<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import authServices from "../services/authServices.js";
import userServices from "../services/userServices.js";
import Utils from "../config/utils.js";
import { emailRules } from "../config/validation.js";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const loggingOut = ref(false);

// Menu dropdown state
const menuOpen = ref(false);

// Edit profile dialog state
const editDialog = ref(false);
const editForm = ref(null);
const editFName = ref("");
const editLName = ref("");
const editEmail = ref("");
const editUsername = ref("");
const editPassword = ref("");
const editConfirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const saving = ref(false);
const editErrorMessage = ref("");

const fNameRules = [(v) => !!v?.trim() || "First name is required."];
const lNameRules = [(v) => !!v?.trim() || "Last name is required."];
const usernameRules = [(v) => !!v?.trim() || "Username is required."];
const passwordRules = [
  (v) => !v || v.length >= 8 || "Password must be at least 8 characters.",
];
const confirmPasswordRules = [
  (v) =>
    !editPassword.value ||
    v === editPassword.value ||
    "Passwords do not match.",
];

function updateUser() {
  user.value = Utils.getStore("user");
}

function handleUserLoggedIn() {
  updateUser();
}

onMounted(() => {
  updateUser();
  window.addEventListener("user-logged-in", handleUserLoggedIn);
});

onUnmounted(() => {
  window.removeEventListener("user-logged-in", handleUserLoggedIn);
});

watch(
  () => route.path,
  () => {
    updateUser();
  }
);

function openEditDialog() {
  if (!user.value) return;
  editFName.value = user.value.fName || "";
  editLName.value = user.value.lName || "";
  editEmail.value = user.value.email || "";
  editUsername.value = user.value.username || "";
  editPassword.value = "";
  editConfirmPassword.value = "";
  editErrorMessage.value = "";
  showPassword.value = false;
  showConfirmPassword.value = false;
  menuOpen.value = false;
  editDialog.value = true;
}

function closeEditDialog() {
  editDialog.value = false;
}

async function handleSaveProfile() {
  editErrorMessage.value = "";
  if (!editForm.value) return;

  const { valid } = await editForm.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const userId = user.value.userId || user.value.id;
    const payload = {
      fName: editFName.value.trim(),
      lName: editLName.value.trim(),
      email: editEmail.value.trim(),
      username: editUsername.value.trim(),
    };

    if (editPassword.value) {
      payload.password = editPassword.value;
    }

    const res = await userServices.updateUser(userId, payload);
    const updatedUser = {
      ...user.value,
      ...res.data,
      userId: res.data.id || user.value.userId || user.value.id,
    };

    Utils.setStore("user", updatedUser);
    user.value = updatedUser;
    window.dispatchEvent(new Event("user-logged-in"));
    editDialog.value = false;
  } catch (err) {
    editErrorMessage.value =
      err.response?.data?.message || "Failed to update profile.";
  } finally {
    saving.value = false;
  }
}

async function handleLogout() {
  loggingOut.value = true;
  try {
    await authServices.logoutUser();
  } catch (_err) {
    // Proceed with client cleanup
  } finally {
    Utils.removeItem("user");
    user.value = null;
    loggingOut.value = false;
    menuOpen.value = false;
    await router.push({ name: "login" });
  }
}
</script>

<template>
  <v-app-bar
    v-if="user && route.name !== 'login' && route.name !== 'register'"
    elevation="1"
    color="surface"
  >
    <v-app-bar-title class="font-weight-bold text-primary">
      Todo Speckit
    </v-app-bar-title>

    <template #append>
      <!-- User Profile Dropdown Menu -->
      <v-menu v-model="menuOpen" min-width="260" rounded="lg" offset="10">
        <template #activator="{ props }">
          <v-btn
            icon="mdi-account-circle"
            size="large"
            color="primary"
            variant="text"
            aria-label="User profile"
            v-bind="props"
          />
        </template>

        <v-card rounded="lg" elevation="3" class="pa-2">
          <v-list density="compact" class="py-0">
            <v-list-item class="px-3 py-2">
              <v-list-item-title class="font-weight-bold text-body-1">
                {{ user.fName }} {{ user.lName }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption text-medium-emphasis">
                {{ user.username }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption text-medium-emphasis">
                {{ user.email }}
              </v-list-item-subtitle>
            </v-list-item>

            <v-divider class="my-1" />

            <v-list-item class="px-2 py-1">
              <v-btn
                color="primary"
                variant="elevated"
                block
                size="small"
                class="oc-cta my-1"
                @click="openEditDialog"
              >
                Edit Profile
              </v-btn>
            </v-list-item>

            <v-list-item class="px-2 py-1">
              <v-btn
                color="error"
                variant="text"
                block
                size="small"
                :loading="loggingOut"
                @click="handleLogout"
              >
                Log out
              </v-btn>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </template>
  </v-app-bar>

  <!-- Edit Profile Dialog -->
  <v-dialog v-model="editDialog" max-width="500" persistent>
    <v-card rounded="lg" class="pa-4">
      <v-card-title class="text-h6 font-weight-bold">
        Edit Profile
      </v-card-title>

      <v-alert
        v-if="editErrorMessage"
        type="error"
        density="compact"
        class="ma-2"
        variant="tonal"
      >
        {{ editErrorMessage }}
      </v-alert>

      <v-card-text>
        <v-form ref="editForm" @submit.prevent="handleSaveProfile">
          <v-row density="comfortable">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editFName"
                label="First Name"
                :rules="fNameRules"
                density="comfortable"
                rounded="lg"
                variant="outlined"
                required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="editLName"
                label="Last Name"
                :rules="lNameRules"
                density="comfortable"
                rounded="lg"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="editEmail"
            label="Email"
            :rules="emailRules"
            density="comfortable"
            rounded="lg"
            variant="outlined"
            class="mb-2"
            required
          />

          <v-text-field
            v-model="editUsername"
            label="Username"
            :rules="usernameRules"
            density="comfortable"
            rounded="lg"
            variant="outlined"
            class="mb-2"
            required
          />

          <v-text-field
            v-model="editPassword"
            label="New Password (optional)"
            :type="showPassword ? 'text' : 'password'"
            :rules="passwordRules"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            density="comfortable"
            rounded="lg"
            variant="outlined"
            class="mb-2"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="editConfirmPassword"
            label="Confirm New Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            :rules="confirmPasswordRules"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            density="comfortable"
            rounded="lg"
            variant="outlined"
            class="mb-2"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          color="secondary"
          variant="text"
          :disabled="saving"
          @click="closeEditDialog"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          class="oc-cta"
          :loading="saving"
          @click="handleSaveProfile"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
