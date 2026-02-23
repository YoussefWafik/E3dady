import express, { type NextFunction, type Request, type Response } from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { applicationDefault, cert, getApps, initializeApp as initializeAdminApp } from "firebase-admin/app";
import { getAuth as getAdminAuth, type DecodedIdToken } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type AppRole = "servant" | "admin";
type AuthedRequest = Request & { authUser?: DecodedIdToken };

const db = new Database("league.db");

const resolveRole = (value: unknown): AppRole | null => {
  if (value === "servant" || value === "admin") return value;
  return null;
};

const resolveClassId = (claims: DecodedIdToken | undefined): number | null => {
  if (!claims) return null;
  const raw = claims.class_id;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

let adminAuth: ReturnType<typeof getAdminAuth> | null = null;
let adminDb: ReturnType<typeof getAdminFirestore> | null = null;

try {
  const existing = getApps()[0];
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  const adminApp = existing ?? (
    serviceAccountJson
      ? initializeAdminApp({ credential: cert(JSON.parse(serviceAccountJson)) })
      : initializeAdminApp({ credential: applicationDefault() })
  );

  adminAuth = getAdminAuth(adminApp);
  adminDb = getAdminFirestore(adminApp);
} catch (err) {
  console.error("Firebase Admin initialization failed. Protected APIs will be unavailable.", err);
}

const requireFirebaseAuth = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (!adminAuth) {
    res.status(503).json({ error: "Auth backend unavailable" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const token = authHeader.slice("Bearer ".length);
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.authUser = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid auth token" });
  }
};

const requireRole = (roles: AppRole[]) => {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const role = resolveRole(req.authUser?.role);
    if (!role || !roles.includes(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
};

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT, -- 'servant', 'admin'
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
  db.prepare("INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)")
    .run("admin1", "admin123", "admin", "Global Admin");
  db.prepare("INSERT INTO users (username, password, role, name, class_id) VALUES (?, ?, ?, ?, ?)")
    .run("servant1", "servant123", "servant", "Servant John", 1);

  db.prepare("INSERT INTO teams (name, logo_url) VALUES (?, ?)")
    .run("Lions FC", "https://picsum.photos/seed/lions/100/100");
  db.prepare("INSERT INTO teams (name, logo_url) VALUES (?, ?)")
    .run("Eagles United", "https://picsum.photos/seed/eagles/100/100");
  db.prepare("INSERT INTO teams (name, logo_url) VALUES (?, ?)")
    .run("Sharks SC", "https://picsum.photos/seed/sharks/100/100");

  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)")
    .run("Mark Anthony", 1, 1, 1, 150);
  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)")
    .run("Sarah Smith", 1, 1, 1, 120);
  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)")
    .run("David Miller", 2, 2, 1, 200);
  db.prepare("INSERT INTO students (name, grade, team_id, class_id, points) VALUES (?, ?, ?, ?, ?)")
    .run("Emma Wilson", 3, 3, 1, 180);
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

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

  // Servant/Admin API
  app.get("/api/servant/students/:classId", requireFirebaseAuth, requireRole(["servant", "admin"]), (req: AuthedRequest, res) => {
    const requestedClassId = Number(req.params.classId);
    if (!Number.isFinite(requestedClassId)) {
      res.status(400).json({ error: "Invalid class id" });
      return;
    }

    const role = resolveRole(req.authUser?.role);
    const claimedClassId = resolveClassId(req.authUser);
    const targetClassId = role === "servant" ? (claimedClassId ?? requestedClassId) : requestedClassId;

    const students = db.prepare("SELECT * FROM students WHERE class_id = ?").all(targetClassId);
    res.json(students);
  });

  app.post("/api/servant/attendance", requireFirebaseAuth, requireRole(["servant", "admin"]), (req, res) => {
    const { student_id, date, type, status } = req.body;
    db.prepare("INSERT INTO attendance (student_id, date, type, status) VALUES (?, ?, ?, ?)")
      .run(student_id, date, type, status);
    res.json({ success: true });
  });

  app.post("/api/servant/points", requireFirebaseAuth, requireRole(["servant", "admin"]), (req, res) => {
    const { student_id, points, reason, date } = req.body;
    db.prepare("INSERT INTO points_log (student_id, points, reason, date) VALUES (?, ?, ?, ?)")
      .run(student_id, points, reason, date);
    db.prepare("UPDATE students SET points = points + ? WHERE id = ?")
      .run(points, student_id);

    const student = db.prepare("SELECT team_id FROM students WHERE id = ?").get(student_id) as { team_id: number } | undefined;
    if (student) {
      db.prepare("UPDATE teams SET points = points + ? WHERE id = ?").run(points, student.team_id);
    }

    res.json({ success: true });
  });

  app.post("/api/servant/followup", requireFirebaseAuth, requireRole(["servant", "admin"]), (req, res) => {
    const { student_id, servant_id, date, notes } = req.body;
    db.prepare("INSERT INTO follow_ups (student_id, servant_id, date, notes) VALUES (?, ?, ?, ?)")
      .run(student_id, servant_id, date, notes);
    res.json({ success: true });
  });

  // Admin API
  app.get("/api/admin/dashboard", requireFirebaseAuth, requireRole(["admin"]), (req, res) => {
    const stats = {
      totalStudents: db.prepare("SELECT COUNT(*) as count FROM students").get(),
      totalTeams: db.prepare("SELECT COUNT(*) as count FROM teams").get(),
      totalPoints: db.prepare("SELECT SUM(points) as sum FROM students").get(),
      pendingApprovals: db.prepare("SELECT COUNT(*) as count FROM points_log WHERE approved = 0").get()
    };
    res.json(stats);
  });

  app.get("/api/admin/accounts", requireFirebaseAuth, requireRole(["admin"]), async (req, res) => {
    if (!adminDb) {
      res.status(503).json({ error: "Firestore backend unavailable" });
      return;
    }

    const role = typeof req.query.role === "string" ? req.query.role : "";
    const collectionName = role === "servant" ? "servants" : role === "admin" ? "admins" : null;
    if (!collectionName) {
      res.status(400).json({ error: "role query param must be servant or admin" });
      return;
    }

    try {
      const snapshot = await adminDb.collection(collectionName).get();
      const rows = snapshot.docs
        .map((doc) => doc.data())
        .sort((a, b) => String(a.username ?? "").localeCompare(String(b.username ?? "")));
      res.json(rows);
    } catch (err) {
      console.error("Failed to load admin accounts", err);
      res.status(500).json({ error: "Failed to load accounts" });
    }
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
