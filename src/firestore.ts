import admin, { firestore } from "firebase-admin";

import { BookReview } from "./interfaces";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.PROJECT_ID,
    clientEmail: process.env.CLIENT_EMAIL,
    privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const REVIEWS = "reviews";
const { Timestamp } = firestore;

function toISOString(createdAt: any): string {
  if ("toDate" in createdAt) {
    return createdAt.toDate().toISOString();
  }

  return "";
}

export const ReviewStore = {
  async get(id?: string): Promise<BookReview | BookReview[] | null> {
    const ref = db.collection(REVIEWS);
    if (id) {
      ref.where("id", "==", id);
    }
    ref.orderBy("createdAt", "desc");
    const snapshot = await ref.get();

    const reviews: BookReview[] = [];
    snapshot.forEach((doc) => {
      if (!doc.exists) {
        return;
      }

      const data = doc.data();
      reviews.push({
        ...data,
        id: doc.id,
        createdAt: toISOString(data.createdAt),
      } as BookReview);
    });

    if (id) {
      return reviews[0];
    }

    return reviews;
  },

  async add(item: Omit<BookReview, "id">): Promise<BookReview> {
    const current = new Date();
    const createdAt = Timestamp.fromDate(current);
    const ref = await db.collection(REVIEWS).add({ ...item, createdAt });
    return { ...item, id: ref.id, createdAt: current.toISOString() };
  },

  async update(
    id: string,
    item: Omit<BookReview, "id">
  ): Promise<BookReview | null> {
    const ref = db.collection(REVIEWS);
    ref.where("id", "==", id);
    const snapshot = await ref.get();

    let review: BookReview | null = null;
    snapshot.forEach((doc) => {
      if (!doc.exists) return;

      const data = doc.data();
      review = {
        ...data,
        createdAt: toISOString(data.createdAt),
      } as BookReview;
    });

    if (!review) return null;

    await db.collection(REVIEWS).doc(id).update(item);

    return {
      ...item,
      id,
      createdAt: review!.createdAt,
    };
  },

  async delete(id: string) {
    try {
      await db.collection(REVIEWS).doc(id).delete();
    } catch (err) {
      console.error(err);
    }
  },
};
