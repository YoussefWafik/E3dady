import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/services/firebase";

export const createTeam = async (name: string, servantId: string) => {
  await addDoc(collection(db, "teams"), {
    name,
    totalScore: 0,
    createdBy: servantId,
    servants: [servantId],
    createdAt: serverTimestamp()
  });
};
