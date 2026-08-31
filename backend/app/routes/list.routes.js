import { Router } from "express";
import listController from "../controllers/list.controller.js";
import { authenticate } from "../authorization/authorization.js";

const router = Router();

router.use(authenticate);

router.get("/", listController.findAll);
router.post("/", listController.create);
router.put("/:listId", listController.update);
router.delete("/:listId", listController.delete);

export default router;
