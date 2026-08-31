/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */

import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";
import { syncTestDatabase, createTestUser, createTestSession } from "./helpers.js";

beforeAll(async () => {
  await syncTestDatabase();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 1 — User Authentication & Session Management", () => {
  describe("US-1.1 — Registration", () => {
    it("User registers with valid information", async () => {
      const payload = {
        fName: "Jane",
        lName: "Doe",
        email: "jdoe@example.com",
        username: "jdoe",
        password: "password123",
      };

      const res = await request(app)
        .post("/todo/register")
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("userId");
      expect(res.body.username).toBe("jdoe");
      expect(res.body.email).toBe("jdoe@example.com");
      expect(res.body.fName).toBe("Jane");
      expect(res.body.lName).toBe("Doe");
      expect(res.body.role).toBe("worker");
      expect(res.body).toHaveProperty("token");
      expect(res.body.password).toBeUndefined();

      // Verify user in database and password hash
      const savedUser = await db.user.scope("withPassword").findByPk(res.body.userId);
      expect(savedUser).not.toBeNull();
      expect(savedUser.password).not.toBe(payload.password);
      const isMatch = await bcrypt.compare(payload.password, savedUser.password);
      expect(isMatch).toBe(true);

      // Verify session created
      const session = await db.session.findOne({ where: { token: res.body.token } });
      expect(session).not.toBeNull();
      expect(session.userId).toBe(savedUser.id);
    });

    it("User submits registration with missing email", async () => {
      const payload = {
        fName: "No",
        lName: "Email",
        username: "noemailuser",
        password: "password123",
      };

      const res = await request(app)
        .post("/todo/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Email is required.");
    });

    it("User submits registration with password too short", async () => {
      const payload = {
        fName: "Short",
        lName: "Pass",
        email: "shortpass@example.com",
        username: "shortpassuser",
        password: "123",
      };

      const res = await request(app)
        .post("/todo/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe("Password must be at least 8 characters.");
    });

    it("User registers with a duplicate username", async () => {
      const payload = {
        fName: "Duplicate",
        lName: "User",
        email: "unique1@example.com",
        username: "jdoe",
        password: "password123",
      };

      const res = await request(app)
        .post("/todo/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username is already taken.");
    });

    it("User registers with a duplicate email", async () => {
      const payload = {
        fName: "Duplicate",
        lName: "Email",
        email: "jdoe@example.com",
        username: "differentuser",
        password: "password123",
      };

      const res = await request(app)
        .post("/todo/register")
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is already registered.");
    });
  });

  describe("US-1.2 — Sign in", () => {
    it("User signs in with valid credentials", async () => {
      const res = await request(app)
        .post("/todo/login")
        .send({
          username: "jdoe",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("userId");
      expect(res.body.username).toBe("jdoe");
      expect(res.body).toHaveProperty("token");
      expect(res.body.role).toBe("worker");
      expect(res.body.password).toBeUndefined();

      // Verify session exists
      const session = await db.session.findOne({ where: { token: res.body.token } });
      expect(session).not.toBeNull();
    });

    it("User signs in with invalid password", async () => {
      const res = await request(app)
        .post("/todo/login")
        .send({
          username: "jdoe",
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid username or password.");
    });

    it("User signs in with missing username", async () => {
      const res = await request(app)
        .post("/todo/login")
        .send({
          password: "password123",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username is required.");
    });

    it("User signs in with missing password", async () => {
      const res = await request(app)
        .post("/todo/login")
        .send({
          username: "jdoe",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password is required.");
    });
  });

  describe("US-1.4 — Sign out", () => {
    it("User signs out", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .post("/todo/logout")
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(200);

      // Verify session is invalidated
      const destroyedSession = await db.session.findOne({ where: { token: session.token } });
      expect(destroyedSession).toBeNull();
    });
  });
});
