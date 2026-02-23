import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const adminApp = getApps()[0] ?? (
  serviceAccountJson
    ? initializeApp({ credential: cert(JSON.parse(serviceAccountJson)) })
    : initializeApp({ credential: applicationDefault() })
);

const adminAuth = getAuth(adminApp);
const firestore = getFirestore(adminApp);

const deleteStudentDocsInCollection = async (collectionName: string) => {
  const snapshot = await firestore.collection(collectionName).where("role", "==", "student").get();
  if (snapshot.empty) return 0;

  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snapshot.size;
};

const deleteStudentAuthUsers = async () => {
  let pageToken: string | undefined;
  let deleted = 0;

  do {
    const page = await adminAuth.listUsers(1000, pageToken);
    for (const user of page.users) {
      if (user.customClaims?.role === "student") {
        await adminAuth.deleteUser(user.uid);
        deleted += 1;
      }
    }
    pageToken = page.pageToken;
  } while (pageToken);

  return deleted;
};

const run = async () => {
  const deletedAuthUsers = await deleteStudentAuthUsers();
  const deletedFromUsersCollection = await deleteStudentDocsInCollection("users");
  const deletedFromServantsCollection = await deleteStudentDocsInCollection("servants");
  const deletedFromAdminsCollection = await deleteStudentDocsInCollection("admins");

  console.log("Student cleanup summary:");
  console.log(`Deleted auth users: ${deletedAuthUsers}`);
  console.log(`Deleted Firestore docs from users: ${deletedFromUsersCollection}`);
  console.log(`Deleted Firestore docs from servants: ${deletedFromServantsCollection}`);
  console.log(`Deleted Firestore docs from admins: ${deletedFromAdminsCollection}`);
};

run().catch((err) => {
  console.error("Failed to cleanup student role/accounts.", err);
  process.exit(1);
});
