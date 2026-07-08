import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import { dashboardController } from "../controllers/dashboard";

const router = Router();

router.use(requireAuth);

router.get(
  "/dashboard/summary",
  dashboardController.getSummary.bind(dashboardController),
);

export default router;
