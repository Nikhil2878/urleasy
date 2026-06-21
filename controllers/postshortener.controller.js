import crypto from "crypto";
import {
  deleteShortCodeById,
  findShortLinkById,
  getAllShortLinks,
  getShortLinkByShortCode,
  insertShortLink,
} from "../services/shortener.services.js";
import {
  homePageSchema,
  shortenerSearchParamsSchema,
} from "../validators/shortener-validator.js";
import { z } from "zod";
// import {loadLinks,getLinkByShortCode, insertShortLink} from "../models/shortener.model.js";
export const getShortenerPage = async (req, res) => {
  try {
    // const file = await readFile(path.join("views","index.html"));

    // const links = await loadLinks();
    if (!req.user) return res.redirect("/login");
    const searchParams = shortenerSearchParamsSchema.parse(req.query);

    // const links = await getAllShortLinks(req.user.id);

    // let isLoggedIn = req.headers.cookie;
    // isLoggedIn = Boolean(
    //     isLoggedIn
    //     ?.split(";")
    //     ?.find((cookie) => cookie.trim().startsWith("isLoggedIn"))
    //     ?.split("=")[1]
    // );
    // console.log("isLoggedIn : ",typeof isLoggedIn);

    // let isLoggedIn = req.cookies?.isLoggedIn;
    const { shortLinks, totalCount } = await getAllShortLinks({
      userId: req.user.id,
      limit: 10,
      offset: (searchParams - 1) * 10,
    });
    const totalPages = Math.ceil(totalCount / 10);

    return res.render("index", {
      links: shortLinks,
      host: req.host,
      currentPage: searchParams.page,
      totalPages: totalPages,
      errors: req.flash("errors"),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
export const postURLShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { data, error } = homePageSchema.safeParse(req.body);
    if (error) {
      const errors = error.issues[0].message;
      res.flash("errors", errors);
      // console.log("error hai ",error);
      res.redirect("/login");
    }

    const { url, shortCode } = data;
    const finalShortCode = shortCode || crypto.randomBytes(4).toString("hex");
    // const links = await loadLinks();
    const link = await getShortLinkByShortCode(finalShortCode);
    if (link) {
      // return res
      // .status(400)
      // .send("Short code already exists. Please choose another.");
      req.flash("errors", "Short code already exists. Please choose another.");
      return res.redirect("/");
    }
    // links[finalShortCode] = url;
    // await saveLinks(links);
    // await saveLinks({url,shortCode});
    await insertShortLink({ url, finalShortCode, userId: req.user.id });

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
export const redirectToShortLink = async (req, res) => {
  try {
    const { shortCode } = req.params;
    // const links = await loadLinks();
    const link = await getShortLinkByShortCode(shortCode);

    // if(!links[shortCode]) return res.status(404).send("404 error occured");
    if (!link) return res.redirect("/404");

    return res.redirect(link.url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

//getShortenerEditPage
export const getShortenerEditPage = async (req, res) => {
  if (!req.user) return res.redirect("/login");
  // const id = req.params;
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.redirect("/404");
  try {
    const shortLink = await findShortLinkById(id);
    if (!shortLink) return res.redirect("/404");

    res.render("edit-shortLink", {
      id: shortLink.id,
      url: shortLink.url,
      shortCode: shortLink.shortCode,
      errors: req.flash("errors"),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal server error");
  }
};
//deleteShortCode
export const deleteShortCode = async (req, res) => {
  const { data: id, error } = z.coerce.number().int().safeParse(req.params.id);
  if (error) return res.redirect("/404");
  try {
    await deleteShortCodeById(id);
    return res.redirect("/");
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      req.flash("errors", "Shortcode already exists, please choose another");
      return res.redirect(`/edit/${id}`);
    }
  }
};
