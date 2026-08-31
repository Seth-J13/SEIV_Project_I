import bcrypt from "bcryptjs";
import db from "../models/index.js";
import logger from "../config/logger.js";
import { getAccessibleUserOrNull } from "../authorization/authorization.js";

const exports = {};

exports.findOne = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getAccessibleUserOrNull(req, id);

    if (!user) {
      return res.status(404).send({ message: `User with id=${id} not found.` });
    }

    return res.status(200).send(user);
  } catch (error) {
    logger.error(`Error fetching user profile: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getAccessibleUserOrNull(req, id);

    if (!user) {
      return res.status(404).send({ message: `User with id=${id} not found.` });
    }

    const { fName, lName, email, username, password } = req.body || {};

    if (password !== undefined && password !== null && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return res
          .status(400)
          .send({ message: "Password must be at least 8 characters." });
      }
    }

    if (!fName?.trim()) {
      return res.status(400).send({ message: "First name is required." });
    }

    if (!lName?.trim()) {
      return res.status(400).send({ message: "Last name is required." });
    }

    if (!email?.trim()) {
      return res.status(400).send({ message: "Email is required." });
    }

    if (!username?.trim()) {
      return res.status(400).send({ message: "Username is required." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim();

    const existingUsername = await db.user.findOne({
      where: {
        username: normalizedUsername,
        id: { [db.Sequelize.Op.ne]: user.id },
      },
    });

    if (existingUsername) {
      return res.status(400).send({ message: "Username is already taken." });
    }

    const existingEmail = await db.user.findOne({
      where: {
        email: trimmedEmail,
        id: { [db.Sequelize.Op.ne]: user.id },
      },
    });

    if (existingEmail) {
      return res.status(400).send({ message: "Email is already registered." });
    }

    user.fName = fName.trim();
    user.lName = lName.trim();
    user.email = trimmedEmail;
    user.username = normalizedUsername;

    if (password && password.length >= 8) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = await db.user.findByPk(user.id);
    return res.status(200).send(updatedUser);
  } catch (error) {
    logger.error(`Error updating user profile: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

export default exports;
