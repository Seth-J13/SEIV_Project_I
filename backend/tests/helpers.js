import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../app/models/index.js";
import authConfig from "../app/config/auth.config.js";

/** Sync schema for tests */
export const syncTestDatabase = async () => {
  await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
  await db.sequelize.sync({ force: true });
  await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");
};

/** Create a test user directly in the database */
export const createTestUser = async (overrides = {}) => {
  const defaultPassword = overrides.plainPassword || "password123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const user = await db.user.create({
    fName: "Test",
    lName: "User",
    email: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}@example.com`,
    username: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    password: hashedPassword,
    role: "worker",
    ...overrides,
  });

  return { user, plainPassword: defaultPassword };
};

/** Create a test session for a user */
export const createTestSession = async (user, overrides = {}) => {
  const token = jwt.sign({ id: user.id }, authConfig.secret, { expiresIn: 86400 });
  const expirationDate = new Date(Date.now() + 86400 * 1000);

  const session = await db.session.create({
    token,
    email: user.email,
    expirationDate,
    userId: user.id,
    ...overrides,
  });

  return session;
};

/** Create a test list for a user */
export const createTestList = async (user, overrides = {}) => {
  const list = await db.list.create({
    name: `List ${Date.now()}`,
    userId: user.id,
    ...overrides,
  });

  return list;
};
