import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.use(authenticate);

router.get("/:id", userController.findOne);
router.put("/:id", userController.update);

export default router;
