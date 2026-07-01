import { Google } from "arctic";
// import { env } from "../../config/env.js";

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://urlsimple.vercel.app/google/callback", // We will create this route to verify after login
);
