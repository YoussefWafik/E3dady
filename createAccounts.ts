import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

type Role = "servant" | "admin";
type AccountSpec = {
  role: Role;
  username: string;
  email: string;
  class_id: number | null;
  collection: "servants" | "admins";
};

type AccountResult = {
  role: Role;
  username: string;
  email: string;
  uid: string;
  class_id: number | null;
  status: "created" | "existing" | "failed";
  password: string;
  error: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVANTS_COUNT = 100;
const ADMINS_COUNT = 50;
const SERVANT_DEFAULT_CLASS_ID = 1;

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const adminApp = getApps()[0] ?? (
  serviceAccountJson
    ? initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
    : initializeApp({ credential: applicationDefault() })
);

const adminAuth = getAuth(adminApp);
const firestore = getFirestore(adminApp);

const generatePassword = () => {
  const raw = randomBytes(18).toString("base64url");
  return `${raw.slice(0, 10)}A1!`;
};

const csvEscape = (value: string) => `"${value.replace(/"/g, "\"\"")}"`;

const createSpecs = (): AccountSpec[] => {
  const servants: AccountSpec[] = Array.from({ length: SERVANTS_COUNT }, (_, i) => {
    const number = i + 1;
    const username = `servantEdady${number}`;
    return {
      role: "servant",
      username,
      email: `${username}@e3dady.com`,
      class_id: SERVANT_DEFAULT_CLASS_ID,
      collection: "servants",
    };
  });

  const admins: AccountSpec[] = Array.from({ length: ADMINS_COUNT }, (_, i) => {
    const number = i + 1;
    const username = `adminEdady${number}`;
    return {
      role: "admin",
      username,
      email: `${username}@e3dady.com`,
      class_id: null,
      collection: "admins",
    };
  });

  return [...servants, ...admins];
};

const ensureAccount = async (spec: AccountSpec): Promise<AccountResult> => {
  try {
    let uid = "";
    let status: "created" | "existing" = "existing";
    let generatedPassword = "";

    try {
      const existing = await adminAuth.getUserByEmail(spec.email);
      uid = existing.uid;
    } catch (err: any) {
      if (err?.code !== "auth/user-not-found") throw err;

      generatedPassword = generatePassword();
      const created = await adminAuth.createUser({
        email: spec.email,
        password: generatedPassword,
        displayName: spec.username,
      });

      uid = created.uid;
      status = "created";
    }

    const claims = spec.role === "servant"
      ? { role: "servant", class_id: spec.class_id }
      : { role: "admin" };
    await adminAuth.setCustomUserClaims(uid, claims);

    const payload: Record<string, unknown> = {
      uid,
      username: spec.username,
      email: spec.email,
      role: spec.role,
      class_id: spec.class_id,
      status: "active",
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === "created") {
      payload.createdAt = FieldValue.serverTimestamp();
    }

    await firestore.collection(spec.collection).doc(uid).set(payload, { merge: true });

    return {
      role: spec.role,
      username: spec.username,
      email: spec.email,
      uid,
      class_id: spec.class_id,
      status,
      password: generatedPassword,
      error: "",
    };
  } catch (err: any) {
    return {
      role: spec.role,
      username: spec.username,
      email: spec.email,
      uid: "",
      class_id: spec.class_id,
      status: "failed",
      password: "",
      error: err?.message ?? "Unknown error",
    };
  }
};

const writeCsv = async (results: AccountResult[]) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const artifactsDir = path.join(__dirname, "artifacts");
  await mkdir(artifactsDir, { recursive: true });

  const csvPath = path.join(artifactsDir, `role-accounts-${timestamp}.csv`);
  const header = [
    "role",
    "status",
    "uid",
    "username",
    "email",
    "password",
    "class_id",
    "error",
  ];

  const rows = results.map((result) => [
    result.role,
    result.status,
    result.uid,
    result.username,
    result.email,
    result.password,
    result.class_id === null ? "" : String(result.class_id),
    result.error,
  ]);

  const content = [header, ...rows]
    .map((cols) => cols.map((value) => csvEscape(String(value))).join(","))
    .join("\n");

  await writeFile(csvPath, content, "utf8");
  return csvPath;
};

const summarize = (results: AccountResult[]) => {
  const base = {
    servant: { created: 0, existing: 0, failed: 0 },
    admin: { created: 0, existing: 0, failed: 0 },
  };

  for (const row of results) {
    base[row.role][row.status] += 1;
  }

  return base;
};

const run = async () => {
  const specs = createSpecs();
  const results: AccountResult[] = [];

  for (const spec of specs) {
    const result = await ensureAccount(spec);
    results.push(result);
    console.log(`[${result.status}] ${result.role} ${result.email}`);
  }

  const csvPath = await writeCsv(results);
  const summary = summarize(results);

  console.log("\nProvisioning summary:");
  console.log(`Servants -> created: ${summary.servant.created}, existing: ${summary.servant.existing}, failed: ${summary.servant.failed}`);
  console.log(`Admins   -> created: ${summary.admin.created}, existing: ${summary.admin.existing}, failed: ${summary.admin.failed}`);
  console.log(`CSV file: ${csvPath}`);
};

run().catch((err) => {
  console.error("Failed to provision accounts.", err);
  process.exit(1);
});
