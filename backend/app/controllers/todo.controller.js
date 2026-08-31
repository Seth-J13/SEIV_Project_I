import db from "../models/index.js";
import logger from "../config/logger.js";
import {
  getAccessibleListOrNull,
  getAccessibleTodoOrNull,
} from "../authorization/authorization.js";

const exports = {};

exports.findAllByList = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await getAccessibleListOrNull(req, listId);

    if (!list) {
      return res.status(404).send({ message: `List with id=${listId} not found.` });
    }

    const todos = await db.todo.findAll({
      where: { listId: list.id, userId: req.user.id },
      order: [
        ["completed", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    return res.status(200).send(todos);
  } catch (error) {
    logger.error(`Error fetching todos for list: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body || {};

    const list = await getAccessibleListOrNull(req, listId);
    if (!list) {
      return res.status(404).send({ message: `List with id=${listId} not found.` });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).send({ message: "Todo title is required." });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length > 255) {
      return res
        .status(400)
        .send({ message: "Todo title must be 255 characters or fewer." });
    }

    const todo = await db.todo.create({
      title: trimmedTitle,
      completed: false,
      listId: list.id,
      userId: req.user.id,
    });

    return res.status(201).send(todo);
  } catch (error) {
    logger.error(`Error creating todo: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body || {};

    const todo = await getAccessibleTodoOrNull(req, id);
    if (!todo) {
      return res.status(404).send({ message: `Todo with id=${id} not found.` });
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).send({ message: "Todo title is required." });
      }

      const trimmedTitle = title.trim();
      if (trimmedTitle.length > 255) {
        return res
          .status(400)
          .send({ message: "Todo title must be 255 characters or fewer." });
      }
      todo.title = trimmedTitle;
    }

    if (completed !== undefined) {
      todo.completed = Boolean(completed);
    }

    await todo.save();
    return res.status(200).send(todo);
  } catch (error) {
    logger.error(`Error updating todo: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await getAccessibleTodoOrNull(req, id);

    if (!todo) {
      return res.status(404).send({ message: `Todo with id=${id} not found.` });
    }

    await todo.destroy();
    return res.status(200).send({ message: "Todo deleted successfully." });
  } catch (error) {
    logger.error(`Error deleting todo: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

export default exports;
