import { Router } from "express";
import todoController from "../controllers/todo.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.use(authenticate);

router.put("/:id", todoController.update);
router.delete("/:id", todoController.delete);

export default router;
