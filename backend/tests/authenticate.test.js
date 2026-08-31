/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */

import request from "supertest";
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
  describe("US-1.3 — Stay signed in across page loads", () => {
    it("API request includes session token", async () => {
      const { user } = await createTestUser();
      const session = await createTestSession(user);

      const res = await request(app)
        .post("/todo/logout")
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(200);
    });

    it("Protected API request succeeds with a valid session", async () => {
      const { user: userA } = await createTestUser();
      const { user: _userB } = await createTestUser();
      const sessionA = await createTestSession(userA);

      const res = await request(app)
        .post("/todo/logout")
        .set("Authorization", `Bearer ${sessionA.token}`);

      expect(res.status).toBe(200);
    });

    it("Expired or invalid session token", async () => {
      const { user } = await createTestUser();
      // Create an expired session
      const expiredDate = new Date(Date.now() - 1000 * 60 * 60);
      const session = await createTestSession(user, { expirationDate: expiredDate });

      const res = await request(app)
        .post("/todo/logout")
        .set("Authorization", `Bearer ${session.token}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });

  describe("US-1.5 — Block unauthenticated access", () => {
    it("Unauthenticated user accesses a protected route", async () => {
      const res = await request(app)
        .post("/todo/logout");

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/Unauthorized/i);
    });
  });
});
