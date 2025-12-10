import arcjet, { tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 7,                 // ✅ 7 free messages
      refillRate: 7,               // ✅ full refill
      interval: 12 * 60 * 60,      // ✅ every 12 hours
    }),
  ],
});
