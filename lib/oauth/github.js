import { GitHub } from "arctic";
// import { env } from "../../config/env.js";
//This is comment
export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_CLIENT_SECRET,
  "https://urleasy.onrender.com/oauth/github/callback", // We will create this route to verify after login
);
