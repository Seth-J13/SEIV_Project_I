/**
 * Feature 2 — Todo List Management, Feature 3 — Todo List Item Management, & Feature 5 — Todo Due Date
 * Specs: features/feature-2-todo-list-management.md, features/feature-3-todo-list-item-management.md, features/feature-5-todo-due-date.md
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Dashboard from "../src/views/Dashboard.vue";
import { mountWithPlugins } from "./testUtils.js";
import listServices from "../src/services/listServices.js";
import todoServices from "../src/services/todoServices.js";

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

      // Find input inside Create dialog
      const dialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("New List")
      );
      expect(dialogEl).toBeDefined();
      const input = dialogEl.querySelector("input");
      expect(input).not.toBeNull();
      input.value = "Groceries";
      input.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Find Create button inside dialog
      const createBtn = Array.from(dialogEl.querySelectorAll("button")).find(
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

      const dialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("New List")
      );
      const createBtn = Array.from(dialogEl.querySelectorAll("button")).find(
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

      const dialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Rename List")
      );
      expect(dialogEl).toBeDefined();
      const input = dialogEl.querySelector("input");
      expect(input).not.toBeNull();
      input.value = "Shopping";
      input.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Click Save
      const saveBtn = Array.from(dialogEl.querySelectorAll("button")).find(
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

      const dialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Delete List")
      );
      expect(dialogEl).toBeDefined();
      const confirmDeleteBtn = Array.from(dialogEl.querySelectorAll("button")).find(
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

describe("Feature 3 — Todo List Item Management", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("US-3.1 — Add tasks to a list", () => {
    it("User adds a todo to a list via dialog", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({ data: [] });
      const createTodoSpy = vi.spyOn(todoServices, "create").mockResolvedValueOnce({
        data: { id: 10, listId: 1, title: "Buy milk", completed: false, userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click "Items" icon
      const itemsBtn = wrapper.find('[aria-label="Items"]');
      expect(itemsBtn.exists()).toBe(true);
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Find "+ Add Item" button
      const addItemBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.includes("+ Add Item")
      );
      expect(addItemBtn).toBeDefined();
      addItemBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Find input for todo title inside New Todo dialog
      const addDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("New Todo")
      );
      expect(addDialogEl).toBeDefined();
      const titleInput = addDialogEl.querySelector("input:not([type='date']):not([type='checkbox'])");
      titleInput.value = "Buy milk";
      titleInput.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Click "Add" button
      const addBtn = Array.from(addDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Add"
      );
      expect(addBtn).toBeDefined();
      addBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(createTodoSpy).toHaveBeenCalledWith(1, { title: "Buy milk" });
      expect(document.body.textContent).toContain("Buy milk");
      wrapper.unmount();
    });

    it("User adds a todo with an empty title", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({ data: [] });
      const createTodoSpy = vi.spyOn(todoServices, "create");

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Open items dialog
      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click "+ Add Item"
      const addItemBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.includes("+ Add Item")
      );
      addItemBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const addDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("New Todo")
      );
      // Click "Add" with empty title
      const addBtn = Array.from(addDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Add"
      );
      addBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(document.body.textContent).toContain("Todo title is required.");
      expect(createTodoSpy).not.toHaveBeenCalled();
      wrapper.unmount();
    });

    it("Add item is only available inside the items dialog", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });

      const { wrapper } = await mountWithPlugins(Dashboard);
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Main lists view should not have "+ Add Item" button
      expect(wrapper.text()).not.toContain("+ Add Item");
      wrapper.unmount();
    });
  });

  describe("US-3.2 — View tasks in a list", () => {
    it("List items dialog shows empty state", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Personal", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({ data: [] });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.body.textContent).toContain("No todos in this list yet.");
      wrapper.unmount();
    });

    it("User opens items for different lists", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [
          { id: 1, name: "Personal", userId: 1 },
          { id: 2, name: "Work", userId: 1 },
        ],
      });
      const getTodosSpy = vi
        .spyOn(todoServices, "getAllForList")
        .mockResolvedValueOnce({
          data: [{ id: 101, listId: 1, title: "Call mom", completed: false, userId: 1 }],
        })
        .mockResolvedValueOnce({
          data: [
            { id: 201, listId: 2, title: "Email client", completed: false, userId: 1 },
            { id: 202, listId: 2, title: "Write report", completed: false, userId: 1 },
          ],
        });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemButtons = wrapper.findAll('[aria-label="Items"]');

      // Open Personal items
      await itemButtons[0].trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.body.textContent).toContain("Call mom");
      expect(document.body.textContent).not.toContain("Email client");

      // Close Personal items dialog
      const itemsDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Personal — Items")
      );
      const closeBtn = Array.from(itemsDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Close"
      );
      closeBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Open Work items
      await itemButtons[1].trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(document.body.textContent).toContain("Email client");
      expect(document.body.textContent).toContain("Write report");
      expect(getTodosSpy).toHaveBeenCalledTimes(2);

      wrapper.unmount();
    });
  });

  describe("US-3.3 — Complete tasks", () => {
    it("User marks a todo as complete", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: false, userId: 1 }],
      });
      const updateSpy = vi.spyOn(todoServices, "update").mockResolvedValueOnce({
        data: { id: 10, listId: 1, title: "Buy milk", completed: true, userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const checkbox = document.body.querySelector(".v-dialog input[type='checkbox']");
      expect(checkbox).not.toBeNull();
      checkbox.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(10, { completed: true });
      wrapper.unmount();
    });

    it("User marks a completed todo as incomplete", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: true, userId: 1 }],
      });
      const updateSpy = vi.spyOn(todoServices, "update").mockResolvedValueOnce({
        data: { id: 10, listId: 1, title: "Buy milk", completed: false, userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const checkbox = document.body.querySelector(".v-dialog input[type='checkbox']");
      checkbox.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(10, { completed: false });
      wrapper.unmount();
    });
  });

  describe("US-3.4 — Edit and remove tasks", () => {
    it("User edits a todo title", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: false, userId: 1 }],
      });
      const updateSpy = vi.spyOn(todoServices, "update").mockResolvedValueOnce({
        data: { id: 10, listId: 1, title: "Buy oat milk", completed: false, userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click Edit icon on the todo item
      const editTodoBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.getAttribute("aria-label") === "Edit todo"
      );
      expect(editTodoBtn).toBeDefined();
      editTodoBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Change title in Edit Todo dialog
      const editDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Edit Todo")
      );
      expect(editDialogEl).toBeDefined();
      const titleInput = editDialogEl.querySelector("input:not([type='date']):not([type='checkbox'])");
      titleInput.value = "Buy oat milk";
      titleInput.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Click Save
      const saveBtn = Array.from(editDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Save"
      );
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(10, { title: "Buy oat milk", dueDate: null });
      expect(document.body.textContent).toContain("Buy oat milk");
      wrapper.unmount();
    });

    it("User deletes a todo", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: false, userId: 1 }],
      });
      const deleteSpy = vi.spyOn(todoServices, "delete").mockResolvedValueOnce({
        data: { message: "Todo deleted successfully." },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click Delete icon on the todo item
      const deleteTodoBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.getAttribute("aria-label") === "Delete todo"
      );
      expect(deleteTodoBtn).toBeDefined();
      deleteTodoBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click Delete button in delete confirmation dialog
      const deleteDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Delete Todo")
      );
      expect(deleteDialogEl).toBeDefined();
      const confirmDeleteBtn = Array.from(deleteDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Delete"
      );
      expect(confirmDeleteBtn).toBeDefined();
      confirmDeleteBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(deleteSpy).toHaveBeenCalledWith(10);
      expect(document.body.textContent).toContain("No todos in this list yet.");
      wrapper.unmount();
    });
  });
});

describe("Feature 5 — Todo Due Date", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  describe("US-5.1 — Set a due date when creating a todo", () => {
    it("User adds a todo with a due date", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({ data: [] });
      const createTodoSpy = vi.spyOn(todoServices, "create").mockResolvedValueOnce({
        data: {
          id: 10,
          listId: 1,
          title: "Buy milk",
          completed: false,
          dueDate: "2026-07-15",
          userId: 1,
        },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Open items dialog
      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Click "+ Add Item"
      const addItemBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.textContent.includes("+ Add Item")
      );
      addItemBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const addDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("New Todo")
      );
      expect(addDialogEl).toBeDefined();
      const titleInput = addDialogEl.querySelector("input:not([type='date']):not([type='checkbox'])");
      const dateInput = addDialogEl.querySelector("input[type='date']");

      titleInput.value = "Buy milk";
      titleInput.dispatchEvent(new Event("input"));
      dateInput.value = "2026-07-15";
      dateInput.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      // Click "Add"
      const addBtn = Array.from(addDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Add"
      );
      addBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(createTodoSpy).toHaveBeenCalledWith(1, {
        title: "Buy milk",
        dueDate: "2026-07-15",
      });
      expect(document.body.textContent).toContain("Jul 15, 2026");
      wrapper.unmount();
    });
  });

  describe("US-5.3 — Edit or clear a due date", () => {
    it("User sets a due date when editing a todo", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: false, dueDate: null, userId: 1 }],
      });
      const updateSpy = vi.spyOn(todoServices, "update").mockResolvedValueOnce({
        data: { id: 10, listId: 1, title: "Buy milk", completed: false, dueDate: "2026-07-20", userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editTodoBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.getAttribute("aria-label") === "Edit todo"
      );
      editTodoBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Edit Todo")
      );
      expect(editDialogEl).toBeDefined();
      const dateInput = editDialogEl.querySelector("input[type='date']");
      dateInput.value = "2026-07-20";
      dateInput.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      const saveBtn = Array.from(editDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Save"
      );
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(10, {
        title: "Buy milk",
        dueDate: "2026-07-20",
      });
      expect(document.body.textContent).toContain("Jul 20, 2026");
      wrapper.unmount();
    });

    it("User clears a due date when editing a todo", async () => {
      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: false, dueDate: "2026-07-20", userId: 1 }],
      });
      const updateSpy = vi.spyOn(todoServices, "update").mockResolvedValueOnce({
        data: { id: 10, listId: 1, title: "Buy milk", completed: false, dueDate: null, userId: 1 },
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editTodoBtn = Array.from(document.body.querySelectorAll(".v-dialog button")).find(
        (b) => b.getAttribute("aria-label") === "Edit todo"
      );
      editTodoBtn.click();
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const editDialogEl = Array.from(document.body.querySelectorAll(".v-dialog")).find((d) =>
        d.textContent.includes("Edit Todo")
      );
      expect(editDialogEl).toBeDefined();
      const dateInput = editDialogEl.querySelector("input[type='date']");
      dateInput.value = "";
      dateInput.dispatchEvent(new Event("input"));
      await wrapper.vm.$nextTick();

      const saveBtn = Array.from(editDialogEl.querySelectorAll("button")).find(
        (b) => b.textContent.trim() === "Save"
      );
      saveBtn.click();
      await new Promise((resolve) => setTimeout(resolve, 50));
      await wrapper.vm.$nextTick();

      expect(updateSpy).toHaveBeenCalledWith(10, {
        title: "Buy milk",
        dueDate: null,
      });
      expect(document.body.textContent).not.toContain("Jul 20, 2026");
      wrapper.unmount();
    });
  });

  describe("US-5.4 — Spot overdue todos", () => {
    it("Incomplete todo past due date is styled as overdue", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: false, dueDate: yesterdayStr, userId: 1 }],
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const dateSubtitle = document.body.querySelector(".due-date-text");
      expect(dateSubtitle).not.toBeNull();
      expect(dateSubtitle.classList.contains("text-error")).toBe(true);

      wrapper.unmount();
    });

    it("Completed todo past due date is not styled as overdue", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      vi.spyOn(listServices, "getAll").mockResolvedValueOnce({
        data: [{ id: 1, name: "Groceries", userId: 1 }],
      });
      vi.spyOn(todoServices, "getAllForList").mockResolvedValueOnce({
        data: [{ id: 10, listId: 1, title: "Buy milk", completed: true, dueDate: yesterdayStr, userId: 1 }],
      });

      const { wrapper } = await mountWithPlugins(Dashboard, { attachTo: document.body });
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const itemsBtn = wrapper.find('[aria-label="Items"]');
      await itemsBtn.trigger("click");
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      const dateSubtitle = document.body.querySelector(".due-date-text");
      expect(dateSubtitle).not.toBeNull();
      expect(dateSubtitle.classList.contains("text-error")).toBe(false);

      wrapper.unmount();
    });
  });
});
