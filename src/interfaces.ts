export interface BookReview {
  id: string;
  title: string;
  body: string;
  score: number;
  reviewer: string;
  createdAt?: string;
}

export type BookReviewParams = Omit<BookReview, "id">;
