/**
 * Feature 2 — Todo List Management
 * Spec: features/feature-2-todo-list-management.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Dashboard from "../src/views/Dashboard.vue";
import { mountWithPlugins } from "./testUtils.js";
import listServices from "../src/services/listServices.js";

describe("Feature 2 — Todo List Management", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("US-2.1 — Create todo lists", () => {
    it("User creates a new list", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({ data: [] });
      const createSpy = vi.spyOn(listServices, "create").mockResolvedValueOnce({
        data: { id: 1, name: "Groceries", userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click "+ New List"
      const newBtn = wrapper.findAll("button").find((b) => b.text().includes("+ New List"));
      expect(newBtn).toBeDefined();
      await newBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Find input inside dialog
      const input = document.body.querySelector(".v-dialog input");
      expect(input).not.toBeNull();
      input.value = "Groceries";
      input.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Find Create button inside dialog
      const createBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.trim() === "Create"
      );
      expect(createBtn).toBeDefined();
      createBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(createSpy).toHaveBeenCalledWith({ name: "Groceries" });
      expect(wrapper.text()).toContain("Groceries");
      wrapper.unmount();
    });

    it("User creates a list with an empty name", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({ data: [] });
      const createSpy = vi.spyOn(listServices, "create");

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click "+ New List"
      const newBtn = wrapper.findAll("button").find((b) => b.text().includes("+ New List"));
      await newBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Leave empty and click Create
      const createBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.trim() === "Create"
      );
      expect(createBtn).toBeDefined();
      createBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(document.body.textContent).toContain("List name is required.");
      expect(createSpy).not.toHaveBeenCalled();
      wrapper.unmount();
    });
  });

  describe("US-2.2 — View my lists", () => {
    it("Dashboard loads with existing lists", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [
          { id: 1, name: "Work", userId: 1 },
          { id: 2, name: "Personal", userId: 1 },
        ],
      });

      const { wrapper } = await mountWithPlugins(Dashboard);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(wrapper.text()).toContain("Work");
      expect(wrapper.text()).toContain("Personal");
      expect(wrapper.find('[aria-label="Edit list"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Delete list"]').exists()).toBe(true);
      wrapper.unmount();
    });

    it("User has no lists", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({ data: [] });

      const { wrapper } = await mountWithPlugins(Dashboard);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(wrapper.text()).toContain("No lists yet. Create your first list.");
      wrapper.unmount();
    });
  });

  describe("US-2.3 — Manage list rows", () => {
    it("List rows show edit and delete actions", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });

      const { wrapper } = await mountWithPlugins(Dashboard);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(wrapper.find('[aria-label="Edit list"]').exists()).toBe(true);
      expect(wrapper.find('[aria-label="Delete list"]').exists()).toBe(true);
      wrapper.unmount();
    });
  });

  describe("US-2.4 — Rename and delete lists", () => {
    it("User renames a list", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      const updateSpy = vi.spyOn(listServices, "update").mockResolvedValueOnce({
        data: { id: 1, name: "Shopping", userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click Edit icon
      const editIconBtn = wrapper.find('[aria-label="Edit list"]');
      await editIconBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Find input inside dialog and change value
      const input = document.body.querySelector(".v-dialog input");
      expect(input).not.toBeNull();
      input.value = "Shopping";
      input.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Click Save
      const saveBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.trim() === "Save"
      );
      expect(saveBtn).toBeDefined();
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(1, { name: "Shopping" });
      expect(wrapper.text()).toContain("Shopping");
      wrapper.unmount();
    });

    it("User deletes a list", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      const deleteSpy = vi.spyOn(listServices, "delete").mockResolvedValueOnce({
        data: { message: "List deleted successfully." },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click Delete icon
      const deleteIconBtn = wrapper.find('[aria-label="Delete list"]');
      await deleteIconBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click Delete button in dialog
      const confirmDeleteBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.trim() === "Delete"
      );
      expect(confirmDeleteBtn).toBeDefined();
      confirmDeleteBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(deleteSpy).toHaveBeenCalledWith(1);
      expect(wrapper.text()).not.toContain("Groceries");
      wrapper.unmount();
    });
  });
});
