<script setup>
import { ref, onMounted } from "vue";
import listServices from "../services/listServices.js";
import todoServices from "../services/todoServices.js";

const lists = ref([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref("");

// List Dialog states
const createDialog = ref(false);
const createForm = ref(null);
const newListName = ref("");

const editDialog = ref(false);
const editForm = ref(null);
const editingList = ref(null);
const editListName = ref("");

const deleteDialog = ref(false);
const deletingList = ref(null);

const listNameRules = [
  (v) => !!v?.trim() || "List name is required.",
];

// Todo / Items states
const itemsDialog = ref(false);
const selectedList = ref(null);
const todos = ref([]);
const todosLoading = ref(false);
const todosError = ref("");
const todoSaving = ref(false);

const addTodoDialog = ref(false);
const addTodoForm = ref(null);
const newTodoTitle = ref("");

const editTodoDialog = ref(false);
const editTodoForm = ref(null);
const editingTodo = ref(null);
const editTodoTitle = ref("");

const deleteTodoDialog = ref(false);
const deletingTodo = ref(null);

const todoTitleRules = [
  (v) => !!v?.trim() || "Todo title is required.",
];

async function fetchLists() {
  loading.value = true;
  errorMessage.value = "";
  try {
    const res = await listServices.getAll();
    lists.value = res.data || [];
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Failed to load lists.";
  } finally {
    loading.value = false;
  }
}

function openCreateDialog() {
  newListName.value = "";
  errorMessage.value = "";
  createDialog.value = true;
}

async function handleCreate() {
  if (!createForm.value) return;
  const { valid } = await createForm.value.validate();
  if (!valid) return;

  saving.value = true;
  errorMessage.value = "";
  try {
    const res = await listServices.create({ name: newListName.value.trim() });
    lists.value.push(res.data);
    lists.value.sort((a, b) => a.name.localeCompare(b.name));
    createDialog.value = false;
    newListName.value = "";
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Failed to create list.";
  } finally {
    saving.value = false;
  }
}

function openEditDialog(list) {
  editingList.value = list;
  editListName.value = list.name;
  errorMessage.value = "";
  editDialog.value = true;
}

async function handleEdit() {
  if (!editForm.value) return;
  const { valid } = await editForm.value.validate();
  if (!valid) return;

  saving.value = true;
  errorMessage.value = "";
  try {
    const res = await listServices.update(editingList.value.id, {
      name: editListName.value.trim(),
    });
    const index = lists.value.findIndex((l) => l.id === editingList.value.id);
    if (index !== -1) {
      lists.value[index] = res.data;
      lists.value.sort((a, b) => a.name.localeCompare(b.name));
    }
    editDialog.value = false;
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Failed to update list.";
  } finally {
    saving.value = false;
  }
}

function openDeleteDialog(list) {
  deletingList.value = list;
  errorMessage.value = "";
  deleteDialog.value = true;
}

async function handleDelete() {
  if (!deletingList.value) return;

  saving.value = true;
  errorMessage.value = "";
  try {
    await listServices.delete(deletingList.value.id);
    lists.value = lists.value.filter((l) => l.id !== deletingList.value.id);
    deleteDialog.value = false;
    deletingList.value = null;
  } catch (err) {
    errorMessage.value = err.response?.data?.message || "Failed to delete list.";
  } finally {
    saving.value = false;
  }
}

// Todo handlers
async function openItemsDialog(list) {
  selectedList.value = list;
  todos.value = [];
  todosError.value = "";
  itemsDialog.value = true;
  await fetchTodos(list.id);
}

async function fetchTodos(listId) {
  todosLoading.value = true;
  todosError.value = "";
  try {
    const res = await todoServices.getAllForList(listId);
    todos.value = res.data || [];
  } catch (err) {
    todosError.value = err.response?.data?.message || "Failed to load todos.";
  } finally {
    todosLoading.value = false;
  }
}

function openAddTodoDialog() {
  newTodoTitle.value = "";
  todosError.value = "";
  addTodoDialog.value = true;
}

async function handleAddTodo() {
  if (!addTodoForm.value) return;
  const { valid } = await addTodoForm.value.validate();
  if (!valid) return;

  todoSaving.value = true;
  todosError.value = "";
  try {
    const res = await todoServices.create(selectedList.value.id, {
      title: newTodoTitle.value.trim(),
    });
    todos.value.push(res.data);
    addTodoDialog.value = false;
    newTodoTitle.value = "";
  } catch (err) {
    todosError.value = err.response?.data?.message || "Failed to add todo.";
  } finally {
    todoSaving.value = false;
  }
}

async function handleToggleTodo(todo) {
  const newStatus = !todo.completed;
  try {
    const res = await todoServices.update(todo.id, { completed: newStatus });
    const index = todos.value.findIndex((t) => t.id === todo.id);
    if (index !== -1) {
      todos.value[index] = res.data;
    }
  } catch (err) {
    todosError.value = err.response?.data?.message || "Failed to update todo.";
  }
}

function openEditTodoDialog(todo) {
  editingTodo.value = todo;
  editTodoTitle.value = todo.title;
  todosError.value = "";
  editTodoDialog.value = true;
}

async function handleEditTodo() {
  if (!editTodoForm.value) return;
  const { valid } = await editTodoForm.value.validate();
  if (!valid) return;

  todoSaving.value = true;
  todosError.value = "";
  try {
    const res = await todoServices.update(editingTodo.value.id, {
      title: editTodoTitle.value.trim(),
    });
    const index = todos.value.findIndex((t) => t.id === editingTodo.value.id);
    if (index !== -1) {
      todos.value[index] = res.data;
    }
    editTodoDialog.value = false;
  } catch (err) {
    todosError.value = err.response?.data?.message || "Failed to update todo.";
  } finally {
    todoSaving.value = false;
  }
}

function openDeleteTodoDialog(todo) {
  deletingTodo.value = todo;
  todosError.value = "";
  deleteTodoDialog.value = true;
}

async function handleDeleteTodo() {
  if (!deletingTodo.value) return;

  todoSaving.value = true;
  todosError.value = "";
  try {
    await todoServices.delete(deletingTodo.value.id);
    todos.value = todos.value.filter((t) => t.id !== deletingTodo.value.id);
    deleteTodoDialog.value = false;
    deletingTodo.value = null;
  } catch (err) {
    todosError.value = err.response?.data?.message || "Failed to delete todo.";
  } finally {
    todoSaving.value = false;
  }
}

onMounted(() => {
  fetchLists();
});
</script>

<template>
  <v-container class="py-8" max-width="800">
    <v-card rounded="lg" elevation="2">
      <v-card-item class="pb-2">
        <template #title>
          <h1 class="text-h5 font-weight-bold text-primary">My Lists</h1>
        </template>
        <template #append>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            @click="openCreateDialog"
          >
            + New List
          </v-btn>
        </template>
      </v-card-item>

      <v-divider />

      <v-alert
        v-if="errorMessage"
        type="error"
        density="compact"
        class="ma-4"
        variant="tonal"
      >
        {{ errorMessage }}
      </v-alert>

      <div v-if="loading" class="text-center py-10">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <div
        v-else-if="lists.length === 0"
        class="text-center py-10 text-medium-emphasis"
      >
        No lists yet. Create your first list.
      </div>

      <v-list v-else lines="one" class="py-0">
        <template v-for="(list, index) in lists" :key="list.id">
          <v-list-item class="px-4 py-2">
            <v-list-item-title class="font-weight-medium text-body-1">
              {{ list.name }}
            </v-list-item-title>

            <template #append>
              <v-btn
                icon="mdi-format-list-checks"
                size="small"
                variant="text"
                color="primary"
                aria-label="Items"
                class="mr-1"
                @click="openItemsDialog(list)"
              />
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="secondary"
                aria-label="Edit list"
                class="mr-1"
                @click="openEditDialog(list)"
              />
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                aria-label="Delete list"
                @click="openDeleteDialog(list)"
              />
            </template>
          </v-list-item>
          <v-divider v-if="index < lists.length - 1" />
        </template>
      </v-list>
    </v-card>

    <!-- Create List Dialog -->
    <v-dialog v-model="createDialog" max-width="450" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          New List
        </v-card-title>
        <v-card-text>
          <v-form ref="createForm" @submit.prevent="handleCreate">
            <v-text-field
              v-model="newListName"
              label="List Name"
              :rules="listNameRules"
              density="comfortable"
              rounded="lg"
              variant="outlined"
              autofocus
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="saving"
            @click="createDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="saving"
            @click="handleCreate"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit List Dialog -->
    <v-dialog v-model="editDialog" max-width="450" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          Rename List
        </v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="handleEdit">
            <v-text-field
              v-model="editListName"
              label="List Name"
              :rules="listNameRules"
              density="comfortable"
              rounded="lg"
              variant="outlined"
              autofocus
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="saving"
            @click="editDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="saving"
            @click="handleEdit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="450" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          Delete List
        </v-card-title>
        <v-card-text class="text-body-1">
          Are you sure you want to delete "{{ deletingList?.name }}"?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="saving"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            class="oc-cta"
            :loading="saving"
            @click="handleDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- List Items Dialog -->
    <v-dialog v-model="itemsDialog" max-width="600" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-item class="pb-2">
          <template #title>
            <h2 class="text-h6 font-weight-bold text-primary">
              {{ selectedList?.name }} — Items
            </h2>
          </template>
          <template #append>
            <v-btn
              color="primary"
              variant="elevated"
              class="oc-cta"
              @click="openAddTodoDialog"
            >
              + Add Item
            </v-btn>
          </template>
        </v-card-item>

        <v-divider />

        <v-alert
          v-if="todosError"
          type="error"
          density="compact"
          class="ma-3"
          variant="tonal"
        >
          {{ todosError }}
        </v-alert>

        <div v-if="todosLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div
          v-else-if="todos.length === 0"
          class="text-center py-8 text-medium-emphasis"
        >
          No todos in this list yet.
        </div>

        <v-list v-else lines="one" class="py-0">
          <template v-for="(todo, index) in todos" :key="todo.id">
            <v-list-item class="px-2 py-1">
              <template #prepend>
                <v-checkbox-btn
                  :model-value="todo.completed"
                  color="primary"
                  class="mr-2"
                  @update:model-value="handleToggleTodo(todo)"
                />
              </template>

              <v-list-item-title
                :class="{
                  'text-decoration-line-through text-medium-emphasis': todo.completed,
                }"
                class="text-body-1"
              >
                {{ todo.title }}
              </v-list-item-title>

              <template #append>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="secondary"
                  aria-label="Edit todo"
                  class="mr-1"
                  @click="openEditTodoDialog(todo)"
                />
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  aria-label="Delete todo"
                  @click="openDeleteTodoDialog(todo)"
                />
              </template>
            </v-list-item>
            <v-divider v-if="index < todos.length - 1" />
          </template>
        </v-list>

        <v-card-actions class="justify-end pt-4">
          <v-btn
            color="secondary"
            variant="text"
            @click="itemsDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Todo Dialog -->
    <v-dialog v-model="addTodoDialog" max-width="450" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          New Todo
        </v-card-title>
        <v-card-text>
          <v-form ref="addTodoForm" @submit.prevent="handleAddTodo">
            <v-text-field
              v-model="newTodoTitle"
              label="Todo Title"
              :rules="todoTitleRules"
              density="comfortable"
              rounded="lg"
              variant="outlined"
              autofocus
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="todoSaving"
            @click="addTodoDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="todoSaving"
            @click="handleAddTodo"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Todo Dialog -->
    <v-dialog v-model="editTodoDialog" max-width="450" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          Edit Todo
        </v-card-title>
        <v-card-text>
          <v-form ref="editTodoForm" @submit.prevent="handleEditTodo">
            <v-text-field
              v-model="editTodoTitle"
              label="Todo Title"
              :rules="todoTitleRules"
              density="comfortable"
              rounded="lg"
              variant="outlined"
              autofocus
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="todoSaving"
            @click="editTodoDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            class="oc-cta"
            :loading="todoSaving"
            @click="handleEditTodo"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Todo Confirmation Dialog -->
    <v-dialog v-model="deleteTodoDialog" max-width="450" persistent>
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          Delete Todo
        </v-card-title>
        <v-card-text class="text-body-1">
          Are you sure you want to delete "{{ deletingTodo?.title }}"?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            color="secondary"
            variant="text"
            :disabled="todoSaving"
            @click="deleteTodoDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            class="oc-cta"
            :loading="todoSaving"
            @click="handleDeleteTodo"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
