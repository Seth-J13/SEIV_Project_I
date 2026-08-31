/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import Login from "../src/views/Login.vue";
import { mountWithPlugins } from "./testUtils.js";
import authServices from "../src/services/authServices.js";

describe("Feature 1 — User Authentication & Session Management", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("US-1.2 — Sign in", () => {
    it("User signs in with invalid password", async () => {
      const loginSpy = vi
        .spyOn(authServices, "loginUser")
        .mockRejectedValueOnce({
          response: {
            status: 401,
            data: { message: "Invalid username or password." },
          },
        });

      const { wrapper } = await mountWithPlugins(Login);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("jdoe");
      await inputs[1].setValue("wrongpassword");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(loginSpy).toHaveBeenCalledWith({
        username: "jdoe",
        password: "wrongpassword",
      });
      expect(wrapper.text()).toContain("Invalid username or password.");
    });

    it("User signs in with missing username", async () => {
      const loginSpy = vi.spyOn(authServices, "loginUser");
      const { wrapper } = await mountWithPlugins(Login);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("");
      await inputs[1].setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Username is required.");
      expect(loginSpy).not.toHaveBeenCalled();
    });

    it("User signs in with missing password", async () => {
      const loginSpy = vi.spyOn(authServices, "loginUser");
      const { wrapper } = await mountWithPlugins(Login);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("jdoe");
      await inputs[1].setValue("");

      await wrapper.find("form").trigger("submit.prevent");
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Password is required.");
      expect(loginSpy).not.toHaveBeenCalled();
    });
  });
});
