import {Router} from "express";
import {postURLShortener,getShortenerPage,redirectToShortLink} from "../controllers/postshortener.controller.js";
const router = Router();

//EJS template engine
router.get("/report",(req,res) => {
    const student = {
        name: "Lokesh",
        grade: "10th",
        favoriteSubject: "Mathematics"
    }
    res.render("report",{student});
})
router.get("/",getShortenerPage);
//yaha pe function call karoge controller me define karoge
router.post("/",postURLShortener);

router.get("/:shortCode",redirectToShortLink);
export default router;