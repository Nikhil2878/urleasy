import {Router} from "express";
import * as authControllers from "../controllers/auth.controller.js";
const router = Router();

router.get("/register",authControllers.getRegisterPage);
router.post("/register",authControllers.postRegister);

router.get("/login",authControllers.getLoginPage);
router.post("/login",authControllers.postLogin);

router.get("/me",authControllers.getMe);
router.get("/logout",authControllers.logoutUser);

export const authRoutes = router;