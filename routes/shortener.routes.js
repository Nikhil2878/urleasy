import { Router } from "express";
import {
  postURLShortener,
  getShortenerPage,
  redirectToShortLink,
  getShortenerEditPage,
  deleteShortCode,
} from "../controllers/postshortener.controller.js";
const router = Router();

//EJS template engine
router.get("/report", (req, res) => {
  const student = {
    name: "Lokesh",
    grade: "10th",
    favoriteSubject: "Mathematics",
  };
  res.render("report", { student });
});
router.get("/", getShortenerPage);
//yaha pe function call karoge controller me define karoge
router.post("/", postURLShortener);

router.get("/:shortCode", redirectToShortLink);

//for edit
router.route("/edit/:id").get(getShortenerEditPage);

//for delete
router.route("/delete/:id").post(deleteShortCode);
export default router;
