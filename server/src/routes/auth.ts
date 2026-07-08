import { Router } from "express";
import { authController } from "../controllers/auth";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/auth/login", authController.login.bind(authController));
router.post("/auth/logout", authController.logout.bind(authController));
router.get("/auth/me", requireAuth, authController.getMe.bind(authController));
router.post(
  "/auth/reset-password",
  requireAuth,
  authController.resetPassword.bind(authController),
);

export default router;
