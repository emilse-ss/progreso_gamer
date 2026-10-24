import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const healthRoutes = Router();

healthRoutes.get("/api/health", getHealth);

export default healthRoutes;
