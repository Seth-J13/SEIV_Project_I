/**
 * Feature 4 — User Profile Management
 * Spec: features/feature-4-user-profile-management.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import MenuBar from "../src/components/MenuBar.vue";
import { mountWithPlugins } from "./testUtils.js";
import authServices from "../src/services/authServices.js";
import userServices from "../src/services/userServices.js";
import Utils from "../src/config/utils.js";

const MenuBarWrapper = {
  components: { MenuBar },
  template: `<v-layout><MenuBar /></v-layout>`,
};

describe("Feature 4 — User Profile Management", () => {
  const mockUser = {
    userId: 42,
    id: 42,
    fName: "Jane",
    lName: "Doe",
    email: "jane@example.com",
    username: "jdoe",
    role: "worker",
    token: "fake-jwt-token",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    Utils.setStore("user", mockUser);
  });

  afterEach(() => {
    document.body.innerHTML = "";
    Utils.removeItem("user");
  });

  describe("US-4.1 — View profile from the menu bar", () => {
    it("User opens the profile dropdown from the menu bar", async () => {
      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      expect(profileBtn.exists()).toBe(true);

      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.body.textContent).toContain("Jane Doe");
      expect(document.body.textContent).toContain("jdoe");
      expect(document.body.textContent).toContain("jane@example.com");
      expect(document.body.textContent).toContain("Edit Profile");
      expect(document.body.textContent).toContain("Log out");

      wrapper.unmount();
    });
  });

  describe("US-4.2 — Edit profile", () => {
    it("User opens the edit profile dialog", async () => {
      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      expect(editBtn).toBeDefined();

      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const inputs = Array.from(
        document.body.querySelectorAll(".v-dialog input")
      );
      expect(inputs.length).toBeGreaterThanOrEqual(4);
      expect(inputs[0].value).toBe("Jane");
      expect(inputs[1].value).toBe("Doe");
      expect(inputs[2].value).toBe("jane@example.com");
      expect(inputs[3].value).toBe("jdoe");

      wrapper.unmount();
    });

    it("User cancels the edit profile dialog", async () => {
      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const updateSpy = vi.spyOn(userServices, "updateUser");

      // Change first name
      const inputs = Array.from(
        document.body.querySelectorAll(".v-dialog input")
      );
      inputs[0].value = "ChangedName";
      inputs[0].dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Click Cancel
      const cancelBtn = Array.from(
        document.body.querySelectorAll(".v-dialog button")
      ).find((b) => b.textContent.trim() === "Cancel");
      expect(cancelBtn).toBeDefined();
      cancelBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(updateSpy).not.toHaveBeenCalled();
      expect(Utils.getStore("user").fName).toBe("Jane");

      wrapper.unmount();
    });

    it("User saves profile changes", async () => {
      const updateSpy = vi.spyOn(userServices, "updateUser").mockResolvedValueOnce({
        data: {
          id: 42,
          fName: "Janet",
          lName: "Smith",
          email: "janet.smith@example.com",
          username: "jsmith",
          role: "worker",
        },
      });

      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const inputs = Array.from(
        document.body.querySelectorAll(".v-dialog input")
      );
      inputs[0].value = "Janet";
      inputs[0].dispatchEvent(new Event("input"));
      inputs[1].value = "Smith";
      inputs[1].dispatchEvent(new Event("input"));
      inputs[2].value = "janet.smith@example.com";
      inputs[2].dispatchEvent(new Event("input"));
      inputs[3].value = "jsmith";
      inputs[3].dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      const saveBtn = Array.from(
        document.body.querySelectorAll(".v-dialog button")
      ).find((b) => b.textContent.trim() === "Save");
      expect(saveBtn).toBeDefined();
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(42, {
        fName: "Janet",
        lName: "Smith",
        email: "janet.smith@example.com",
        username: "jsmith",
      });

      expect(Utils.getStore("user").fName).toBe("Janet");
      expect(Utils.getStore("user").lName).toBe("Smith");

      wrapper.unmount();
    });

    it("User saves profile with invalid email format", async () => {
      const updateSpy = vi.spyOn(userServices, "updateUser");

      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const inputs = Array.from(
        document.body.querySelectorAll(".v-dialog input")
      );
      inputs[2].value = "notanemail";
      inputs[2].dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      const saveBtn = Array.from(
        document.body.querySelectorAll(".v-dialog button")
      ).find((b) => b.textContent.trim() === "Save");
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(document.body.textContent).toContain("Enter a valid email address.");
      expect(updateSpy).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("User saves profile with mismatched passwords", async () => {
      const updateSpy = vi.spyOn(userServices, "updateUser");

      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const inputs = Array.from(
        document.body.querySelectorAll(".v-dialog input")
      );
      inputs[4].value = "password123";
      inputs[4].dispatchEvent(new Event("input"));
      inputs[5].value = "differentpassword";
      inputs[5].dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      const saveBtn = Array.from(
        document.body.querySelectorAll(".v-dialog button")
      ).find((b) => b.textContent.trim() === "Save");
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(document.body.textContent).toContain("Passwords do not match.");
      expect(updateSpy).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("User saves profile with a password that is too short", async () => {
      const updateSpy = vi.spyOn(userServices, "updateUser");

      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const inputs = Array.from(
        document.body.querySelectorAll(".v-dialog input")
      );
      inputs[4].value = "short";
      inputs[4].dispatchEvent(new Event("input"));
      inputs[5].value = "short";
      inputs[5].dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      const saveBtn = Array.from(
        document.body.querySelectorAll(".v-dialog button")
      ).find((b) => b.textContent.trim() === "Save");
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(document.body.textContent).toContain(
        "Password must be at least 8 characters."
      );
      expect(updateSpy).not.toHaveBeenCalled();

      wrapper.unmount();
    });

    it("Profile update API returns an error", async () => {
      vi.spyOn(userServices, "updateUser").mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: "Username is already taken." },
        },
      });

      const { wrapper } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Edit Profile");
      editBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const saveBtn = Array.from(
        document.body.querySelectorAll(".v-dialog button")
      ).find((b) => b.textContent.trim() === "Save");
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(document.body.textContent).toContain("Username is already taken.");

      wrapper.unmount();
    });
  });

  describe("US-4.3 — Log out from profile", () => {
    it("User logs out from the profile dropdown", async () => {
      const logoutSpy = vi
        .spyOn(authServices, "logoutUser")
        .mockResolvedValueOnce({ data: { message: "Logged out" } });

      const { wrapper, router } = await mountWithPlugins(MenuBarWrapper, {
        attachTo: document.body,
      });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const profileBtn = wrapper.find('[aria-label="User profile"]');
      await profileBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const logoutBtn = Array.from(
        document.body.querySelectorAll(".v-overlay button")
      ).find((b) => b.textContent.trim() === "Log out");
      expect(logoutBtn).toBeDefined();

      logoutBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(logoutSpy).toHaveBeenCalled();
      expect(Utils.getStore("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");

      wrapper.unmount();
    });
  });

  describe("US-4.4 — Single logout entry point", () => {
    it("Menu bar does not show Sign out", async () => {
      const { wrapper } = await mountWithPlugins(MenuBarWrapper);
      await wrapper.vm.$nextTick();

      expect(wrapper.text()).not.toContain("Sign out");
      wrapper.unmount();
    });
  });
});
