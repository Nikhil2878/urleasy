import { Router } from "express";
import multer from "multer";
import path from "path";
import * as authControllers from "../controllers/auth.controller.js";
const router = Router();

router.get("/register", authControllers.getRegisterPage);
router.post("/register", authControllers.postRegister);

router.get("/login", authControllers.getLoginPage);
router.post("/login", authControllers.postLogin);

router.get("/profile", authControllers.getProfilePage);
router.get("/verify-email", authControllers.getVerifyEmailPage);

router.post(
  "/resend-verification-link",
  authControllers.resendVerificationLink,
);

router.get("/verify-email-token", authControllers.verifyEmailToken);

const avatarStorage = multer.diskStorage({
  destination: (req,file,cb) => {
    cb(null,"public/uploads/avatar");
  },
  filename: (req,file,cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.random()}${ext}}`);
  },
})

const avatarFileFilter = (req,file,cb) =>{
  if(file.mimetype.startsWith("image/")){
    cb(null,true);
  }else{
    cb(new Error("Only image files are allowed"),false);
  }
}

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {fileSize: 5 * 1024 * 1024} //5mb
})

// router.get("/edit-profile", authControllers.getEditProfilePage);
// router.post("/edit-profile", authControllers.postEditProfile);

router
.route("/edit-profile")
.get(authControllers.getEditProfilePage)
.post(avatarUpload.single("avatar"),authControllers.postEditProfile);
// post(authControllers.postEditProfile);


router.get("/change-password", authControllers.getChangePasswordPage);
router.post("/change-password", authControllers.postChangePassword);

router.get("/reset-password", authControllers.getResetPasswordPage);
router.post("/reset-password", authControllers.postForgotPassword);
router.get("/reset-password/:token", authControllers.getResetPasswordTokenPage);
router.post("/reset-password/:token", authControllers.postResetPasswordToken);

router.get("/google", authControllers.getGoogleLoginPage);
router.get("/google/callback", authControllers.getGoogleLoginCallback);

router.get("/github", authControllers.getGithubLoginPage);
router.get("/github/callback", authControllers.getGithubLoginCallback);

router.get("/set-password", authControllers.getSetPasswordPage);
router.post("/set-password", authControllers.postSetPassword);

router.get("/logout", authControllers.logoutUser);

export const authRoutes = router;
