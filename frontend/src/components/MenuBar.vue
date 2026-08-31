<script setup>
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();
const route = useRoute();
const user = ref(null);
const loading = ref(false);

function updateUser() {
  user.value = Utils.getStore("user");
}

onMounted(() => {
  updateUser();
});

watch(
  () => route.path,
  () => {
    updateUser();
  }
);

async function handleLogout() {
  loading.value = true;
  try {
    await authServices.logoutUser();
  } catch (_err) {
    // Proceed with client cleanup
  } finally {
    Utils.removeItem("user");
    user.value = null;
    loading.value = false;
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
      <span class="text-body-2 mr-4 text-high-emphasis">
        {{ user.fName ? `${user.fName} ${user.lName}` : user.username }}
      </span>
      <v-btn
        color="secondary"
        variant="outlined"
        rounded="lg"
        class="oc-cta"
        :loading="loading"
        @click="handleLogout"
      >
        Sign out
      </v-btn>
    </template>
  </v-app-bar>
</template>
