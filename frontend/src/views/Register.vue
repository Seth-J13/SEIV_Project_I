<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";
import { emailRules } from "../config/validation.js";

const router = useRouter();

const form = ref(null);
const fName = ref("");
const lName = ref("");
const email = ref("");
const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const fNameRules = [(v) => !!v?.trim() || "First name is required."];
const lNameRules = [(v) => !!v?.trim() || "Last name is required."];
const usernameRules = [(v) => !!v?.trim() || "Username is required."];
const passwordRules = [
  (v) => !!v || "Password is required.",
  (v) => (v && v.length >= 8) || "Password must be at least 8 characters.",
];
const confirmPasswordRules = [
  (v) => !!v || "Confirm password is required.",
  (v) => v === password.value || "Passwords do not match.",
];

async function handleRegister() {
  errorMessage.value = "";
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const res = await authServices.registerUser({
      fName: fName.value.trim(),
      lName: lName.value.trim(),
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value,
    });
    Utils.setStore("user", res.data);
    await router.push({ name: "home" });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Failed to create account.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center" fluid style="min-height: 100vh;">
    <v-card width="100%" max-width="500" rounded="lg" elevation="2" class="pa-6 mx-auto">
      <v-card-title class="text-h5 text-center font-weight-bold mb-2">
        Create an account
      </v-card-title>
      <v-card-subtitle class="text-center mb-6">
        Sign up to start organizing your private todos.
      </v-card-subtitle>

      <v-alert
        v-if="errorMessage"
        type="error"
        density="compact"
        class="mb-4"
        variant="tonal"
      >
        {{ errorMessage }}
      </v-alert>

      <v-form ref="form" @submit.prevent="handleRegister">
        <v-row density="comfortable">
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="fName"
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
              v-model="lName"
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
          v-model="email"
          label="Email"
          :rules="emailRules"
          density="comfortable"
          rounded="lg"
          variant="outlined"
          class="mb-2"
          required
        />

        <v-text-field
          v-model="username"
          label="Username"
          :rules="usernameRules"
          density="comfortable"
          rounded="lg"
          variant="outlined"
          class="mb-2"
          required
        />

        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :rules="passwordRules"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          density="comfortable"
          rounded="lg"
          variant="outlined"
          class="mb-2"
          required
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-model="confirmPassword"
          label="Confirm Password"
          :type="showConfirmPassword ? 'text' : 'password'"
          :rules="confirmPasswordRules"
          :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
          density="comfortable"
          rounded="lg"
          variant="outlined"
          class="mb-4"
          required
          @click:append-inner="showConfirmPassword = !showConfirmPassword"
        />

        <v-btn
          type="submit"
          color="primary"
          variant="elevated"
          block
          size="large"
          rounded="lg"
          class="oc-cta mb-4"
          :loading="loading"
        >
          Create account
        </v-btn>

        <div class="text-center text-body-2">
          Already have an account?
          <router-link :to="{ name: 'login' }" class="text-primary font-weight-medium text-decoration-none ml-1">
            Sign in
          </router-link>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
