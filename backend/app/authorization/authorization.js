import db from "../models/index.js";
import logger from "../config/logger.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send({ message: "Unauthorized! No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send({ message: "Unauthorized! No token provided." });
    }

    const session = await db.session.findOne({
      where: { token },
      include: [{ model: db.user, as: "user" }],
    });

    if (!session || new Date(session.expirationDate) < new Date() || !session.user) {
      return res.status(401).send({ message: "Unauthorized! Session expired or invalid." });
    }

    req.user = {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
      fName: session.user.fName,
      lName: session.user.lName,
    };

    next();
  } catch (error) {
    logger.error(`Authentication error: ${error.message}`);
    return res.status(500).send({ message: error.message });
  }
};

export const getAccessibleListOrNull = async (req, listId) => {
  const parsedId = parseInt(listId, 10);
  if (isNaN(parsedId)) {
    return null;
  }
  const row = await db.list.findOne({
    where: { id: parsedId, userId: req.user.id },
  });
  return row ?? null;
};
