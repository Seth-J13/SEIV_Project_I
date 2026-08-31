/**
 * Feature 3 — Todo List Item Management & Feature 5 — Todo Due Date
 * Specs: features/feature-3-todo-list-item-management.md, features/feature-5-todo-due-date.md
 */

import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import {
  syncTestDatabase,
  createTestUser,
  createTestSession,
  createTestList,
  createTestTodo,
} from "./helpers.js";

beforeAll(async () => {
  await syncTestDatabase();
});

afterAll(async () => {
  await db.sequelize.close();
});

describe("Feature 3 — Todo List Item Management", () => {
  describe("US-3.1 — Add tasks to a list", () => {
    it("User adds a todo to a list via dialog", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .post(`/todo/lists/${list.id}/todos`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ title: "Buy milk" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.title).toBe("Buy milk");
      expect(res.body.completed).toBe(false);
      expect(res.body.userId).toBe(user.id);
      expect(res.body.listId).toBe(list.id);
    });

    it("User adds a todo with an empty title", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .post(`/todo/lists/${list.id}/todos`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ title: "   " });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Todo title is required.");
    });
  });

  describe("US-3.2 — View tasks in a list", () => {
    it("User only sees their own todos when opening items", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listA = await createTestList(userA, { name: "Work" });
      const listB = await createTestList(userB, { name: "Work" });

      await createTestTodo(userA, listA, { title: "My task" });
      await createTestTodo(userB, listB, { title: "Their task" });

      const res = await request(app)
        .get(`/todo/lists/${listA.id}/todos`)
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const titles = res.body.map((t) => t.title);
      expect(titles).toContain("My task");
      expect(titles).not.toContain("Their task");
    });
  });

  describe("US-3.3 — Complete tasks", () => {
    it("User marks a todo as complete", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, {
        title: "Buy milk",
        completed: false,
      });

      const res = await request(app)
        .put(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ completed: true });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);

      const reloaded = await db.todo.findByPk(todo.id);
      expect(reloaded.completed).toBe(true);
    });

    it("User marks a completed todo as incomplete", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, {
        title: "Buy milk",
        completed: true,
      });

      const res = await request(app)
        .put(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ completed: false });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(false);

      const reloaded = await db.todo.findByPk(todo.id);
      expect(reloaded.completed).toBe(false);
    });
  });

  describe("US-3.4 — Edit and remove tasks", () => {
    it("User edits a todo title", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, { title: "Buy milk" });

      const res = await request(app)
        .put(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ title: "Buy oat milk" });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Buy oat milk");

      const reloaded = await db.todo.findByPk(todo.id);
      expect(reloaded.title).toBe("Buy oat milk");
    });

    it("User deletes a todo", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, { title: "Buy milk" });

      const res = await request(app)
        .delete(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(200);

      const deleted = await db.todo.findByPk(todo.id);
      expect(deleted).toBeNull();
    });
  });

  describe("US-3.5 — Private items only", () => {
    it("User cannot read todos in another user's list", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listB = await createTestList(userB, { name: "Secret" });
      await createTestTodo(userB, listB, { title: "Hidden task" });

      const res = await request(app)
        .get(`/todo/lists/${listB.id}/todos`)
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`List with id=${listB.id} not found.`);
    });

    it("User attempts to add a todo to another user's list", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listB = await createTestList(userB, { name: "Secret" });

      const res = await request(app)
        .post(`/todo/lists/${listB.id}/todos`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({ title: "Intruder task" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`List with id=${listB.id} not found.`);

      const count = await db.todo.count({ where: { listId: listB.id } });
      expect(count).toBe(0);
    });

    it("User attempts to rename another user's todo", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listB = await createTestList(userB, { name: "Secret" });
      const todoB = await createTestTodo(userB, listB, { title: "Original task" });

      const res = await request(app)
        .put(`/todo/todos/${todoB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({ title: "Hijacked" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Todo with id=${todoB.id} not found.`);

      const reloaded = await db.todo.findByPk(todoB.id);
      expect(reloaded.title).toBe("Original task");
    });

    it("User attempts to delete another user's todo", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listB = await createTestList(userB, { name: "Secret" });
      const todoB = await createTestTodo(userB, listB, { title: "Original task" });

      const res = await request(app)
        .delete(`/todo/todos/${todoB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Todo with id=${todoB.id} not found.`);

      const exists = await db.todo.findByPk(todoB.id);
      expect(exists).not.toBeNull();
    });

    it("Client cannot assign a todo to another user on create", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listA = await createTestList(userA, { name: "Groceries" });

      const res = await request(app)
        .post(`/todo/lists/${listA.id}/todos`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({ title: "Buy milk", userId: userB.id });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBe(userA.id);
      expect(res.body.userId).not.toBe(userB.id);
    });

    it("Unauthenticated API request for todos", async () => {
      const res = await request(app).get("/todo/lists/1/todos");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });

  describe("US-3.6 — Lists carry their items", () => {
    it("Deleting a list removes its todos", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const list = await createTestList(user, { name: "Groceries" });
      const todo1 = await createTestTodo(user, list, { title: "Buy milk" });
      const todo2 = await createTestTodo(user, list, { title: "Buy eggs" });

      const deleteRes = await request(app)
        .delete(`/todo/lists/${list.id}`)
        .set("Authorization", `Bearer ${session.token}`);

      expect(deleteRes.status).toBe(200);

      const remainingTodos = await db.todo.findAll({
        where: { id: [todo1.id, todo2.id] },
      });
      expect(remainingTodos.length).toBe(0);
    });
  });
});

describe("Feature 5 — Todo Due Date", () => {
  describe("US-5.1 — Set a due date when creating a todo", () => {
    it("User adds a todo with a due date", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .post(`/todo/lists/${list.id}/todos`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ title: "Buy milk", dueDate: "2026-07-15" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Buy milk");
      expect(res.body.dueDate).toBe("2026-07-15");

      const saved = await db.todo.findByPk(res.body.id);
      expect(saved.dueDate).toBe("2026-07-15");
    });

    it("User adds a todo without a due date", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .post(`/todo/lists/${list.id}/todos`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ title: "Buy milk" });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Buy milk");
      expect(res.body.dueDate).toBeNull();
    });

    it("API rejects an invalid due date on create", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });

      const res = await request(app)
        .post(`/todo/lists/${list.id}/todos`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ title: "Task", dueDate: "not-a-date" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Due date must be a valid date in YYYY-MM-DD format."
      );

      const count = await db.todo.count({ where: { listId: list.id } });
      expect(count).toBe(0);
    });
  });

  describe("US-5.3 — Edit or clear a due date", () => {
    it("User sets a due date when editing a todo", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, {
        title: "Buy milk",
        dueDate: null,
      });

      const res = await request(app)
        .put(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ dueDate: "2026-07-20" });

      expect(res.status).toBe(200);
      expect(res.body.dueDate).toBe("2026-07-20");

      const reloaded = await db.todo.findByPk(todo.id);
      expect(reloaded.dueDate).toBe("2026-07-20");
    });

    it("User clears a due date when editing a todo", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, {
        title: "Buy milk",
        dueDate: "2026-07-20",
      });

      const res = await request(app)
        .put(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ dueDate: null });

      expect(res.status).toBe(200);
      expect(res.body.dueDate).toBeNull();

      const reloaded = await db.todo.findByPk(todo.id);
      expect(reloaded.dueDate).toBeNull();
    });

    it("API rejects an invalid due date on update", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);
      const list = await createTestList(user, { name: "Groceries" });
      const todo = await createTestTodo(user, list, {
        title: "Buy milk",
        dueDate: "2026-07-15",
      });

      const res = await request(app)
        .put(`/todo/todos/${todo.id}`)
        .set("Authorization", `Bearer ${session.token}`)
        .send({ dueDate: "2026-99-99" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Due date must be a valid date in YYYY-MM-DD format."
      );

      const reloaded = await db.todo.findByPk(todo.id);
      expect(reloaded.dueDate).toBe("2026-07-15");
    });

    it("User cannot set due date on another user's todo", async () => {
      const { user: userA } = await createTestUser();
      const { user: userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const listB = await createTestList(userB, { name: "Secret" });
      const todoB = await createTestTodo(userB, listB, {
        title: "Original task",
        dueDate: "2026-07-10",
      });

      const res = await request(app)
        .put(`/todo/todos/${todoB.id}`)
        .set("Authorization", `Bearer ${sessionA.token}`)
        .send({ dueDate: "2026-07-15" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe(`Todo with id=${todoB.id} not found.`);

      const reloaded = await db.todo.findByPk(todoB.id);
      expect(reloaded.dueDate).toBe("2026-07-10");
    });
  });
});
