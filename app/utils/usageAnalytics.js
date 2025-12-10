import { db } from "@/config/FirebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export async function trackUserUsage(userId) {
  const today = new Date().toISOString().split("T")[0];

  const ref = doc(db, "userUsage", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      daily: { [today]: 1 },
      totalMessages: 1,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const data = snap.data();
  const daily = data.daily || {};
  const todayCount = daily[today] || 0;

  await updateDoc(ref, {
    [`daily.${today}`]: todayCount + 1,
    totalMessages: (data.totalMessages || 0) + 1,
    updatedAt: serverTimestamp(),
  });
}
