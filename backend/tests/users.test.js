/**
 * Feature 4 — User Profile Management
 * Spec: features/feature-4-user-profile-management.md
 */

import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";
import {
  syncTestDatabase,
  createTestUser,
  createTestSession,
} from "./helpers.js";

beforeAll(async () => {
  await syncTestDatabase();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 4 — User Profile Management", () => {
  describe("US-4.2 — Edit profile", () => {
    it("User fetches their own profile", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .get(`/todo/users/${user.id}`)
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
      expect(res.body.fName).toBe(user.fName);
      expect(res.body.lName).toBe(user.lName);
      expect(res.body.email).toBe(user.email);
      expect(res.body.username).toBe(user.username);
      expect(res.body.role).toBe(user.role);
      expect(res.body.password).toBeUndefined();
    });

    it("User attempts to fetch another user's profile", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const res = await request(app)
        .get(`/todo/users/${userB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`User with id=${userB.id} not found.`);
    });

    it("User saves profile changes", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .put(`/todo/users/${user.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({
          fName: "Jane",
          lName: "Doe",
          email: `jane_${Date.now()}@example.com`,
          username: `janedoe_${Date.now()}`,
          password: "newpassword123",
        });

      expect(res.status).toBe(200);
      expect(res.body.fName).toBe("Jane");
      expect(res.body.lName).toBe("Doe");
      expect(res.body.password).toBeUndefined();

      const reloaded = await db.user.scope("withPassword").findByPk(user.id);
      expect(reloaded.fName).toBe("Jane");
      expect(reloaded.lName).toBe("Doe");
      expect(bcrypt.compareSync("newpassword123", reloaded.password)).toBe(true);
    });

    it("User attempts to update another user's profile", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const originalUsername = userB.username;

      const res = await request(app)
        .put(`/todo/users/${userB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({
          fName: "Hacked",
          lName: "User",
          email: "hacked@example.com",
          username: "hacked",
        });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`User with id=${userB.id} not found.`);

      const reloadedB = await db.user.findByPk(userB.id);
      expect(reloadedB.username).toBe(originalUsername);
    });

    it("Unauthenticated profile API request", async () => {
      const res = await request(app).get("/todo/users/1");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });

    it("Profile update rejects a password that is too short", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .put(`/todo/users/${user.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({
          fName: user.fName,
          lName: user.lName,
          email: user.email,
          username: user.username,
          password: "short",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Password must be at least 8 characters.");
    });

    it("Profile update rejects missing required fields", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .put(`/todo/users/${user.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({
          lName: "Doe",
          email: user.email,
          username: user.username,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("First name is required.");
    });

    it("Profile update rejects a duplicate username", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const res = await request(app)
        .put(`/todo/users/${userA.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({
          fName: "Test",
          lName: "User",
          email: userA.email,
          username: userB.username,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Username is already taken.");
    });

    it("Profile update rejects a duplicate email", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const res = await request(app)
        .put(`/todo/users/${userA.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({
          fName: "Test",
          lName: "User",
          email: userB.email,
          username: userA.username,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Email is already registered.");
    });

    it("Unauthenticated profile update API request", async () => {
      const res = await request(app).put("/todo/users/1").send({
        fName: "Test",
        lName: "User",
        email: "test@example.com",
        username: "test",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });
});
