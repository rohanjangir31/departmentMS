import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyToken,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { sendResponse } from "../utils/responseHandler";

const router = Router();

router.post("/signup", validateRequest({ body: registerSchema }), registerUser);
router.post("/login", validateRequest({ body: loginSchema }), loginUser);
router.post("/logout", authenticate, (_req, res) => {
  sendResponse(res, 200, true, "Logged out successfully", null);
  return;
});
router.get("/verify", verifyToken);

export default router;
