import { Router } from "express";
import { authController } from "../controllers/auth";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/login", authController.login.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.get("/me", requireAuth, authController.getMe.bind(authController));
router.post(
  "/reset-password",
  requireAuth,
  authController.resetPassword.bind(authController),
);

export default router;
