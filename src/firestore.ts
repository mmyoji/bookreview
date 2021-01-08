import admin from "firebase-admin";

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

export const ReviewStore = {
  async get(id?: string): Promise<BookReview | BookReview[] | null> {
    const ref = db.collection(REVIEWS);
    if (id) {
      ref.where("id", "==", id);
    }
    const snapshot = await ref.get();

    const reviews: BookReview[] = [];
    snapshot.forEach((doc) => {
      if (!doc.exists) {
        return;
      }

      reviews.push({ ...doc.data(), id: doc.id } as BookReview);
    });

    if (id) {
      return reviews[0];
    }

    return reviews;
  },

  async add(item: Omit<BookReview, "id">): Promise<BookReview> {
    const ref = await db.collection(REVIEWS).add(item);
    return { ...item, id: ref.id };
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

      review = doc.data() as BookReview;
    });

    if (!review) return null;

    await db.collection(REVIEWS).doc(id).update(item);

    return { ...item, id };
  },

  async delete(id: string) {
    try {
      await db.collection(REVIEWS).doc(id).delete();
    } catch (err) {
      console.error(err);
    }
  },
};
