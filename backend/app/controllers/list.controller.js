import db from "../models/index.js";
import logger from "../config/logger.js";
import { getAccessibleListOrNull } from "../authorization/authorization.js";

const exports = {};

exports.findAll = async (req, res) => {
  try {
    const lists = await db.list.findAll({
      where: { userId: req.user.id },
      order: [["name", "ASC"]],
    });
    return res.status(200).send(lists);
  } catch (error) {
    logger.error(`Error fetching lists: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).send({ message: "List name is required." });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      return res
        .status(400)
        .send({ message: "List name must be 100 characters or fewer." });
    }

    const list = await db.list.create({
      name: trimmedName,
      userId: req.user.id,
    });

    return res.status(201).send(list);
  } catch (error) {
    logger.error(`Error creating list: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { listId } = req.params;
    const { name } = req.body || {};

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).send({ message: "List name is required." });
    }

    const trimmedName = name.trim();

    if (trimmedName.length > 100) {
      return res
        .status(400)
        .send({ message: "List name must be 100 characters or fewer." });
    }

    const list = await getAccessibleListOrNull(req, listId);
    if (!list) {
      return res.status(404).send({ message: `List with id=${listId} not found.` });
    }

    list.name = trimmedName;
    await list.save();

    return res.status(200).send(list);
  } catch (error) {
    logger.error(`Error updating list: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await getAccessibleListOrNull(req, listId);

    if (!list) {
      return res.status(404).send({ message: `List with id=${listId} not found.` });
    }

    await list.destroy();
    return res.status(200).send({ message: "List deleted successfully." });
  } catch (error) {
    logger.error(`Error deleting list: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

export default exports;
