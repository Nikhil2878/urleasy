import {
  ACCESS_TOKEN_EXPIRY,
  MILLISECONDS_PER_SECOND,
  REFRESH_TOKEN_EXPIRY,
} from "../config/constants.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  oauthAccountsTable,
  passwordResetTokensTable,
  sessionsTable,
  usersTable,
  verifyEmailTokensTable,
} from "../drizzle/schema.js";
import bcrypt from "bcryptjs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { sendEmail } from "../lib/send-email.js";
import { fstat } from "fs";
import path from "path";
import fs from "fs/promises";
import ejs from "ejs";
import mjml2html from "mjml";
export const getUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return user;
};
export const createUser = async ({ name, email, password }) => {
  return await db
    .insert(usersTable)
    .values({ name, email, password })
    .$returningId();
};

export const hashPassword = async (password) => {
  //Using bcrypt
  // return await bcrypt.hash(password,10);

  // Using argon2
  return await argon2.hash(password);
};
export const comparePassword = async (password, hash) => {
  // return await bcrypt.compare(password,hash);
  return await argon2.verify(hash, password);
};

// export const getUserByEmailPassword = async({email,password}) => {
// const [user] = await db.select().from(usersTable).where(eq(
//     usersTable.email, email))
// return user;
// }

// generate JWT
export const generateToken = ({ id, name, email }) => {
  //Payload
  return jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const createSession = async (userId, { ip, userAgent }) => {
  const [session] = await db
    .insert(sessionsTable)
    .values({ userId, ip, userAgent })
    .$returningId();
  return session;
};
//createAccessToken
export const createAccessToken = ({ id, name, email, sessionId }) => {
  return jwt.sign({ id, name, email, sessionId }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

//
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY / MILLISECONDS_PER_SECOND,
  });
};

//verify JWT
export const verifyJWTToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
//findSessionById
export const findSessionById = async (sessionId) => {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId));
  return session;
};
//findUserById
export const findUserById = async (userId) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));
  return user;
};

//refreshTokens
export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyJWTToken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);

    if (!currentSession || !currentSession.valid) {
      throw new Error("Invalid session");
    }
    const user = await findUserById(currentSession.userId);

    if (!user) throw new Error("Invalid user");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailValid: user.isEmailValid,
      sessionId: currentSession.id,
    };
    //generate access_token
    const newAccessToken = createAccessToken(userInfo);
    //generate refresh_token
    const newRefreshToken = createRefreshToken(currentSession.id);
    return {
      newAccessToken,
      newRefreshToken,
      user: userInfo,
    };
  } catch (error) {
    console.log(error.message);
  }
};

//clearUserSession
export const clearUserSession = async (sessionId) => {
  return db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
};
export const authenticateUser = async ({ req, res, user, name, email }) => {
  // we need to create a sessions
  const session = await createSession(user.id, {
    ip: req.clientIp,
    userAgent: req.headers["user-agent"],
  });

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name || name,
    email: user.email || email,
    isEmailValid: false,
    sessionId: session.id,
  });

  const refreshToken = createRefreshToken(session.id);

  const baseConfig = { httpOnly: true, secure: true };

  res.cookie("access_token", accessToken, {
    ...baseConfig,
    maxAge: ACCESS_TOKEN_EXPIRY,
  });

  res.cookie("refresh_token", refreshToken, {
    ...baseConfig,
    maxAge: REFRESH_TOKEN_EXPIRY,
  });
};
//getAllShortLinks
export const getAllShortLinks = async (userId) => {
  return await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId));
};

//generateRandomToken
export const generateRandomToken = (digit = 8) => {
  const min = 10 ** (digit - 1);
  const max = 10 ** digit;
  return crypto.randomInt(min, max).toString();
};
// ============

export const insertVerifyEmailToken = async ({ userId, token }) => {
  return db.transaction(async (tx) => {
    try {
      await tx
        .delete(verifyEmailTokensTable)
        .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

      // Delete any existing tokens for this specific user
      await tx
        .delete(verifyEmailTokensTable)
        .where(eq(verifyEmailTokensTable.userId, userId));

      // Insert the new token
      await tx.insert(verifyEmailTokensTable).values({ userId, token });
    } catch (error) {
      // Log the error but don't expose details to the caller
      console.error("Failed to insert verification token:", error);
      throw new Error("Unable to create verification token");
    }
  });
};
//=============
//insertVerifyEmailToken
// export const insertVerifyEmailToken = async ({ userId, token }) => {
//   return db.transaction(async (tx) => {
//     try {
//       await tx
//         .delete(verifyEmailTokensTable)
//         .where(lt(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`));

//       //Delete any existing tokens for this specific user
//       await tx
//         .delete(verifyEmailTokensTable)
//         .where(eq(verifyEmailTokensTable.userId, userId));

//       //Insert the new token
//       await tx.insert(verifyEmailTokensTable).values({ userId, token });
//     } catch (error) {
//       console.error("error", error);
//       throw new Error("Unable to create verification token");
//     }
//   });
// };

export const createVerifyEmailLink = async ({ email, token }) => {
  // const uriEncodedEmail = encodeURIComponent(email);
  // return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}&email=${uriEncodedEmail}`;

  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`);
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);
  return url.toString();
};

//findVerificationEmailToken
// export const findVerificationEmailToken = async ({ token, email }) => {
//   // .select({key: table.column})
//   const tokenData = await db
//     .select({
//       userId: verifyEmailTokensTable.userId,
//       token: verifyEmailTokensTable.token,
//       expiresAt: verifyEmailTokensTable.expiresAt,
//     })
//     .from(verifyEmailTokensTable)
//     .where(
//       and(
//       eq(verifyEmailTokensTable.token, token),
//       gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
//       )
//     );
//     if(!tokenData.length){
//       return null;
//     }
//     const {userId} = tokenData[0];
//     // const userId = tokenData[0].userId;
//     const userData = await db.select({userId: usersTable.id,email:usersTable.email}).from(usersTable).where(eq(usersTable.id,userId));

//     if(!userData.length){
//       return null;
//     }
//     return{
//       userId: userData[0].userId,
//       email: userData[0].email,
//       token: tokenData[0].token,
//       expiresAt: tokenData[0].expiresAt,
//     }
// };

export const findVerificationEmailToken = async ({ token, email }) => {
  return await db
    .select({
      userId: usersTable.id,
      email: usersTable.email,
      token: verifyEmailTokensTable.token,
      expiresAt: verifyEmailTokensTable.expiresAt,
    })
    .from(verifyEmailTokensTable)
    .where(
      and(
        eq(verifyEmailTokensTable.token, token),
        eq(usersTable.email, email),
        gte(verifyEmailTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
      ),
    )
    .innerJoin(usersTable, eq(verifyEmailTokensTable.userId, usersTable.id));
};

//verifyUserEmailAndUpdate
export const verifyUserEmailAndUpdate = async (email) => {
  return db
    .update(usersTable)
    .set({ isEmailValid: true })
    .where(eq(usersTable.email, email));
};

//clearVerifyEmailTokens
export const clearVerifyEmailTokens = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));
  return await db
    .delete(verifyEmailTokensTable)
    .where(eq(verifyEmailTokensTable.userId, user.id));
};

export const sendNewVerifyEmailLink = async ({ userId, email }) => {
  const randomToken = generateRandomToken();
  await insertVerifyEmailToken({ userId, token: randomToken });

  const verifyEmailLink = await createVerifyEmailLink({
    email,
    token: randomToken,
  });
  //For etherial email verification

  //1. to get the file data
  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, "..", "emails", "verify-email.mjml"),
    "utf-8",
  );
  //2. to replace the placeholders with the actual values
  const filledTemplate = ejs.render(mjmlTemplate, {
    code: randomToken,
    link: verifyEmailLink,
  });
  //3. to convert mjml to html
  const htmlOutput = mjml2html(filledTemplate).html;
  sendEmail({
    to: email,
    subject: "Verify your email",
    html: htmlOutput,
  }).catch(console.error);
};

//updateUserByName
export const updateUserByName = async ({ userId, name,avatarUrl }) => {
  return await db
    .update(usersTable)
    .set({ name: name, avatarUrl: avatarUrl })
    .where(eq(usersTable.id, userId));
};

//updataPassword
export const updatePassword = async ({ userId, hashPassword }) => {
  return await db
    .update(usersTable)
    .set({ password: hashPassword })
    .where(eq(usersTable.id, userId));
};

//updateUserPassword
export const updateUserPassword = async ({ userId, newPassword }) => {
  const newHashPassword = await hashPassword(newPassword);

  return await db
    .update(usersTable)
    .set({ password: newHashPassword })
    .where(eq(usersTable.id, userId));
};

//findUserByEmail
export const findUserByEmail = async (email) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
};

//createResetPasswordLink
export const createResetPasswordLink = async ({ userId }) => {
  const randomToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(randomToken)
    .digest("hex");

  await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, userId));

  await db.insert(passwordResetTokensTable).values({ userId, tokenHash });

  return `${process.env.FRONTEND_URL}/reset-password/${randomToken}`;
};

//getResetPasswordToken
export const getResetPasswordToken = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const [data] = await db
    .select()
    .from(passwordResetTokensTable)
    .where(
      and(
        eq(passwordResetTokensTable.tokenHash, tokenHash),
        gte(passwordResetTokensTable.expiresAt, sql`CURRENT_TIMESTAMP`),
      ),
    );

  return data;
};

//clearResetPasswordToken
export const clearResetPasswordToken = async (userId) => {
  return await db
    .delete(passwordResetTokensTable)
    .where(eq(passwordResetTokensTable.userId, userId));
};

export async function getUserWithOauthId({ email, provider }) {
  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      isEmailValid: usersTable.isEmailValid,
      providerAccountId: oauthAccountsTable.providerAccountId,
      provider: oauthAccountsTable.provider,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .leftJoin(
      oauthAccountsTable,
      and(
        eq(oauthAccountsTable.provider, provider),
        eq(oauthAccountsTable.userId, usersTable.id),
      ),
    );

  return user;
}

export async function linkUserWithOauth({
  userId,
  provider,
  providerAccountId,
  avatarUrl,
}) {
  await db.insert(oauthAccountsTable).values({
    userId,
    provider,
    providerAccountId,
  });

  if (avatarUrl) {
    await db
      .update(usersTable)
      .set({ avatarUrl })
      .where(and(eq(usersTable.id, userId), isNull(usersTable.avatarUrl)));
  }
}

export async function createUserWithOauth({
  name,
  email,
  provider,
  providerAccountId,
  avatarUrl,
}) {
  const user = await db.transaction(async (trx) => {
    const [user] = await trx
      .insert(usersTable)
      .values({
        email,
        name,
        // password: "",
        avatarUrl,
        isEmailValid: true, // we know that google's email are valid
      })
      .$returningId();

    await trx.insert(oauthAccountsTable).values({
      provider,
      providerAccountId,
      userId: user.id,
    });

    return {
      id: user.id,
      name,
      email,
      isEmailValid: true, // not necessary
      provider,
      providerAccountId,
    };
  });

  return user;
}
