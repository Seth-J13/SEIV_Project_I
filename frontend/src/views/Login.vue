<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();

const form = ref(null);
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref("");

const usernameRules = [
  (v) => !!v?.trim() || "Username is required.",
];

const passwordRules = [
  (v) => !!v || "Password is required.",
];

async function handleLogin() {
  errorMessage.value = "";
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const res = await authServices.loginUser({
      username: username.value,
      password: password.value,
    });
    Utils.setStore("user", res.data);
    await router.push({ name: "home" });
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Invalid username or password.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <v-container class="fill-height justify-center" fluid>
    <v-card width="100%" max-width="440" rounded="lg" elevation="2" class="pa-6">
      <v-card-title class="text-h5 text-center font-weight-bold mb-2">
        Sign in
      </v-card-title>
      <v-card-subtitle class="text-center mb-6">
        Welcome back! Please enter your details.
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

      <v-form ref="form" @submit.prevent="handleLogin">
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
          class="mb-4"
          required
          @click:append-inner="showPassword = !showPassword"
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
          Sign in
        </v-btn>

        <div class="text-center text-body-2">
          Don't have an account?
          <router-link :to="{ name: 'register' }" class="text-primary font-weight-medium text-decoration-none ml-1">
            Create account
          </router-link>
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
