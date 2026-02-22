import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("league.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'servant', 'leader'
    name TEXT,
    class_id INTEGER
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    points INTEGER DEFAULT 0,
    logo_url TEXT
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    grade INTEGER,
    team_id INTEGER,
    points INTEGER DEFAULT 0,
    class_id INTEGER,
    FOREIGN KEY(team_id) REFERENCES teams(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT,
    type TEXT, -- 'lesson', 'mass'
    status INTEGER, -- 1 present, 0 absent
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS points_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    points INTEGER,
    reason TEXT,
    date TEXT,
    approved INTEGER DEFAULT 1,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS follow_ups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    servant_id INTEGER,
    date TEXT,
    notes TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(servant_id) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)").run("leader", "leader123", "leader", "Global Leader");
  db.prepare("INSERT INTO users (username, password, role, name, class_id) VALUES (?, ?, ?, ?, ?)").run("servant1", "servant123", "servant", "Servant John", 1);
  
  db.prepare("INSERT INTO teams (name, logo_url) VALUES (?, ?)").run("Lions FC", "https://picsum.photos/seed/lions/100/100");
  db.prepare("INSERT INTO teams (name, logo_url) VALUES (?, ?)").run("Eagles United", "https://picsum.photos/seed/eagles/100/100");
  db.prepare("INSERT INTO teams (name, logo_url) VALUES (?, ?)").run("Sharks SC", "https://picsum.photos/seed/sharks/100/100");

  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)").run("Mark Anthony", 1, 1, 1, 150);
  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)").run("Sarah Smith", 1, 1, 1, 120);
  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)").run("David Miller", 2, 2, 1, 200);
  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)").run("Emma Wilson", 3, 3, 1, 180);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Public Data API
  app.get("/api/public/stats", (req, res) => {
    const teams = db.prepare("SELECT * FROM teams ORDER BY points DESC").all();
    const topStudents = db.prepare(`
      SELECT s.*, t.name as team_name 
      FROM students s 
      JOIN teams t ON s.team_id = t.id 
      ORDER BY s.points DESC LIMIT 10
    `).all();
    const mvp = db.prepare(`
      SELECT s.*, t.name as team_name 
      FROM students s 
      JOIN teams t ON s.team_id = t.id 
      ORDER BY s.points DESC LIMIT 1
    `).get();
    
    res.json({ teams, topStudents, mvp });
  });

  app.get("/api/public/teams", (req, res) => {
    const teams = db.prepare("SELECT * FROM teams ORDER BY points DESC").all();
    res.json(teams);
  });

  app.get("/api/public/students", (req, res) => {
    const students = db.prepare(`
      SELECT s.*, t.name as team_name 
      FROM students s 
      JOIN teams t ON s.team_id = t.id 
      ORDER BY s.points DESC
    `).all();
    res.json(students);
  });

  // Servant API
  app.get("/api/servant/students/:classId", (req, res) => {
    const students = db.prepare("SELECT * FROM students WHERE class_id = ?").all(req.params.classId);
    res.json(students);
  });

  app.post("/api/servant/attendance", (req, res) => {
    const { student_id, date, type, status } = req.body;
    db.prepare("INSERT INTO attendance (student_id, date, type, status) VALUES (?, ?, ?, ?)").run(student_id, date, type, status);
    res.json({ success: true });
  });

  app.post("/api/servant/points", (req, res) => {
    const { student_id, points, reason, date } = req.body;
    db.prepare("INSERT INTO points_log (student_id, points, reason, date) VALUES (?, ?, ?, ?)").run(student_id, points, reason, date);
    db.prepare("UPDATE students SET points = points + ? WHERE id = ?").run(points, student_id);
    
    // Update team points too
    const student = db.prepare("SELECT team_id FROM students WHERE id = ?").get(student_id) as any;
    if (student) {
      db.prepare("UPDATE teams SET points = points + ? WHERE id = ?").run(points, student.team_id);
    }
    
    res.json({ success: true });
  });

  app.post("/api/servant/followup", (req, res) => {
    const { student_id, servant_id, date, notes } = req.body;
    db.prepare("INSERT INTO follow_ups (student_id, servant_id, date, notes) VALUES (?, ?, ?, ?)").run(student_id, servant_id, date, notes);
    res.json({ success: true });
  });

  // Leader API
  app.get("/api/leader/dashboard", (req, res) => {
    const stats = {
      totalStudents: db.prepare("SELECT COUNT(*) as count FROM students").get(),
      totalTeams: db.prepare("SELECT COUNT(*) as count FROM teams").get(),
      totalPoints: db.prepare("SELECT SUM(points) as sum FROM students").get(),
      pendingApprovals: db.prepare("SELECT COUNT(*) as count FROM points_log WHERE approved = 0").get()
    };
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
