import { NowRequest, NowResponse } from "@vercel/node";

import { BookReviewParams } from "../interfaces";
import { ReviewStore } from "../firestore";
import { validate } from "../validator";

type QueryParams = { id: string };

function getId(req: NowRequest): string {
  const { id } = req.query as QueryParams;
  return id;
}

// GET /api/reviews
export async function getReviews(_req: NowRequest, res: NowResponse) {
  const reviews = await ReviewStore.get();
  res.status(200).send(reviews);
}

// GET /api/reviews/:id
export async function getReview(req: NowRequest, res: NowResponse) {
  const id = getId(req);

  const review = await ReviewStore.get(id);
  if (review) {
    res.status(200).send(review);
    return;
  }

  res.status(404).send({ errors: ["review is not found"] });
}

// POST /api/reviews
export async function createReview(req: NowRequest, res: NowResponse) {
  const { title, body, score, reviewer } = req.body as BookReviewParams;

  const errors = validate({ title, body, score, reviewer });
  if (errors) {
    res.status(422).send({ errors });
    return;
  }

  const review = await ReviewStore.add({
    title,
    body,
    score,
    reviewer,
  });
  res.status(201).send({ ...review });
}

// PUT /api/reviews/:id
export async function updateReview(req: NowRequest, res: NowResponse) {
  const id = getId(req);

  const { title, body, score, reviewer } = req.body as BookReviewParams;

  const errors = validate({ title, body, score, reviewer });
  if (errors) {
    res.status(422).send({ errors });
    return;
  }

  const review = await ReviewStore.update(id, {
    title,
    body,
    score,
    reviewer,
  });

  if (!review) {
    res.status(404).end();
    return;
  }

  res.status(200).send({ ...review });
}

// DELETE /api/reviews/:id
export async function deleteReview(req: NowRequest, res: NowResponse) {
  const id = getId(req);
  await ReviewStore.delete(id);
  res.status(200).end();
}
