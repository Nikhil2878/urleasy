import { count, desc, eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLinksTable } from "../drizzle/schema.js";
// export const getAllShortLinks = async (userId) => {
//   return await db
//     .select()
//     .from(shortLinksTable)
//     .where(eq(shortLinksTable.userId, userId));
// };
export const getAllShortLinks = async ({ userId, limit = 10, offset = 0 }) => {
  const shortLinks = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId))
    .orderBy(desc(shortLinksTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(shortLinksTable)
    .where(eq(shortLinksTable.userId, userId));

  return { shortLinks, totalCount };
};
export const getShortLinkByShortCode = async (shortCode) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.shortCode, shortCode));
  return result;
};
export const insertShortLink = async ({ url, finalShortCode, userId }) => {
  await db
    .insert(shortLinksTable)
    .values({ url, shortCode: finalShortCode, userId });
};

//findShortLinkById
export const findShortLinkById = async (id) => {
  const [result] = await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.id, id));
  return result;
};

export const deleteShortCodeById = async (id) => {
  return await db.delete(shortLinksTable).where(eq(shortLinksTable.id, id));
};
