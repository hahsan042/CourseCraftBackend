import express from "express";
import { adminControllers } from "../controllers/admin.controller";

const router = express.Router();

router.get("/stats", adminControllers.getAdminStats);

export const AdminRoutes = router;