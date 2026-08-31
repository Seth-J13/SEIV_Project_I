/**
 * Feature 1 — User Authentication & Session Management
 * Spec: features/feature-1-user-auth.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import Register from "../src/views/Register.vue";
import { mountWithPlugins } from "./testUtils.js";
import authServices from "../src/services/authServices.js";

describe("Feature 1 — User Authentication & Session Management", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("US-1.1 — Registration", () => {
    it("User submits registration with invalid email format", async () => {
      const registerSpy = vi.spyOn(authServices, "registerUser");
      const { wrapper } = await mountWithPlugins(Register);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("Jane");
      await inputs[1].setValue("Doe");
      await inputs[2].setValue("notanemail");
      await inputs[3].setValue("jdoe");
      await inputs[4].setValue("password123");
      await inputs[5].setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Enter a valid email address.");
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("User submits registration with missing username", async () => {
      const registerSpy = vi.spyOn(authServices, "registerUser");
      const { wrapper } = await mountWithPlugins(Register);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("Jane");
      await inputs[1].setValue("Doe");
      await inputs[2].setValue("jane@example.com");
      await inputs[3].setValue("");
      await inputs[4].setValue("password123");
      await inputs[5].setValue("password123");

      await wrapper.find("form").trigger("submit.prevent");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Username is required.");
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("User submits registration with password too short", async () => {
      const registerSpy = vi.spyOn(authServices, "registerUser");
      const { wrapper } = await mountWithPlugins(Register);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("Jane");
      await inputs[1].setValue("Doe");
      await inputs[2].setValue("jane@example.com");
      await inputs[3].setValue("jdoe");
      await inputs[4].setValue("short");
      await inputs[5].setValue("short");

      await wrapper.find("form").trigger("submit.prevent");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Password must be at least 8 characters.");
      expect(registerSpy).not.toHaveBeenCalled();
    });

    it("User submits registration with mismatched passwords", async () => {
      const registerSpy = vi.spyOn(authServices, "registerUser");
      const { wrapper } = await mountWithPlugins(Register);

      const inputs = wrapper.findAll("input");
      await inputs[0].setValue("Jane");
      await inputs[1].setValue("Doe");
      await inputs[2].setValue("jane@example.com");
      await inputs[3].setValue("jdoe");
      await inputs[4].setValue("password123");
      await inputs[5].setValue("differentpass");

      await wrapper.find("form").trigger("submit.prevent");
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).toContain("Passwords do not match.");
      expect(registerSpy).not.toHaveBeenCalled();
    });
  });
});
