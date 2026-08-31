import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import logger from "../config/logger.js";

const exports = {};

exports.register = async (req, res) => {
  try {
    const { fName, lName, email, username, password } = req.body || {};

    if (!fName?.trim() || !lName?.trim()) {
      return res.status(400).send({ message: "First name and last name are required." });
    }

    if (!email?.trim()) {
      return res.status(400).send({ message: "Email is required." });
    }

    if (!username?.trim()) {
      return res.status(400).send({ message: "Username is required." });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required." });
    }

    if (password.length < 8) {
      return res.status(400).send({ message: "Password must be at least 8 characters." });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim();

    const existingUsername = await db.user.findOne({
      where: { username: normalizedUsername },
    });

    if (existingUsername) {
      return res.status(400).send({ message: "Username is already taken." });
    }

    const existingEmail = await db.user.findOne({
      where: { email: trimmedEmail },
    });

    if (existingEmail) {
      return res.status(400).send({ message: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      fName: fName.trim(),
      lName: lName.trim(),
      email: trimmedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      role: "worker",
    });

    const token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 86400 });
    const expirationDate = new Date(Date.now() + 86400 * 1000);

    await db.session.create({
      token,
      email: user.email,
      expirationDate,
      userId: user.id,
    });

    return res.status(201).send({
      userId: user.id,
      username: user.username,
      email: user.email,
      fName: user.fName,
      lName: user.lName,
      role: user.role,
      token,
    });
  } catch (error) {
    logger.error(`Register error: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username?.trim()) {
      return res.status(400).send({ message: "Username is required." });
    }

    if (!password) {
      return res.status(400).send({ message: "Password is required." });
    }

    const normalizedUsername = username.trim().toLowerCase();

    const user = await db.user.scope("withPassword").findOne({
      where: { username: normalizedUsername },
    });

    if (!user) {
      return res.status(401).send({ message: "Invalid username or password." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid username or password." });
    }

    let session = await db.session.findOne({
      where: {
        userId: user.id,
        expirationDate: { [db.Sequelize.Op.gt]: new Date() },
      },
    });

    let token;

    if (session) {
      token = session.token;
    } else {
      token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 86400 });
      const expirationDate = new Date(Date.now() + 86400 * 1000);

      session = await db.session.create({
        token,
        email: user.email,
        expirationDate,
        userId: user.id,
      });
    }

    return res.status(200).send({
      userId: user.id,
      username: user.username,
      email: user.email,
      fName: user.fName,
      lName: user.lName,
      role: user.role,
      token,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    const token = authHeader?.split(" ")[1];

    if (token) {
      await db.session.destroy({ where: { token } });
    }

    return res.status(200).send({ message: "Successfully logged out." });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

export default exports;
