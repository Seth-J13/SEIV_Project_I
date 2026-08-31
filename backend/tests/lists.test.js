/**
 * Feature 2 — Todo List Management
 * Spec: features/feature-2-todo-list-management.md
 */

import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import {
  syncTestDatabase,
  createTestUser,
  createTestSession,
  createTestList,
} from "./helpers.js";

beforeAll(async () => {
  await syncTestDatabase();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 2 — Todo List Management", () => {
  describe("US-2.1 — Create todo lists", () => {
    it("User creates a new list", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .post("/todo/lists")
        .set("Authorization", `Bearer ${session.token}`)
        .send({ name: "Groceries" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe("Groceries");
      expect(res.body.userId).toBe(user.id);
    });

    it("User creates a list with an empty name", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .post("/todo/lists")
        .set("Authorization", `Bearer ${session.token}`)
        .send({ name: "   " });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });

    it("User creates a list with a name that is too long", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const longName = "a".repeat(101);

      const res = await request(app)
        .post("/todo/lists")
        .set("Authorization", `Bearer ${session.token}`)
        .send({ name: longName });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("List name must be 100 characters or fewer.");
    });
  });

  describe("US-2.2 — View my lists", () => {
    it("Dashboard loads with existing lists", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      await createTestList(user, { name: "Work" });
      await createTestList(user, { name: "Personal" });

      const res = await request(app)
        .get("/todo/lists")
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const names = res.body.map((l) => l.name);
      expect(names).toContain("Work");
      expect(names).toContain("Personal");
      // Alphabetical order check: "Personal" before "Work"
      const personalIndex = names.indexOf("Personal");
      const workIndex = names.indexOf("Work");
      expect(personalIndex).toBeLessThan(workIndex);
    });

    it("User cannot see another user's lists", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      await createTestList(userB, { name: "Secret Project" });

      const res = await request(app)
        .get("/todo/lists")
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(200);
      const names = res.body.map((l) => l.name);
      expect(names).not.toContain("Secret Project");
    });
  });

  describe("US-2.4 — Rename and delete lists", () => {
    it("User renames a list", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .put(`/todo/lists/${list.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ name: "Shopping" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Shopping");

      const reloaded = await db.list.findByPk(list.id);
      expect(reloaded.name).toBe("Shopping");
    });

    it("User deletes a list", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .delete(`/todo/lists/${list.id}`)
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(200);

      const deleted = await db.list.findByPk(list.id);
      expect(deleted).toBeNull();
    });
  });

  describe("US-2.5 — Private lists only", () => {
    it("User attempts to rename another user's list", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);
      const listB = await createTestList(userB, { name: "User B List" });

      const res = await request(app)
        .put(`/todo/lists/${listB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({ name: "Hijacked" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`List with id=${listB.id} not found.`);

      const reloaded = await db.list.findByPk(listB.id);
      expect(reloaded.name).toBe("User B List");
    });

    it("User attempts to delete another user's list", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);
      const listB = await createTestList(userB, { name: "User B List" });

      const res = await request(app)
        .delete(`/todo/lists/${listB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`List with id=${listB.id} not found.`);

      const exists = await db.list.findByPk(listB.id);
      expect(exists).not.toBeNull();
    });

    it("Client cannot assign a list to another user on create", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const res = await request(app)
        .post("/todo/lists")
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({ name: "Groceries", userId: userB.id });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(userA.id);
      expect(res.body.userId).not.toBe(userB.id);
    });

    it("Unauthenticated API request to lists", async () => {
      const res = await request(app).get("/todo/lists");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });
});
