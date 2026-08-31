<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authServices from "../services/authServices.js";
import Utils from "../config/utils.js";

const router = useRouter();
const user = ref(null);
const loggingOut = ref(false);

onMounted(() => {
  user.value = Utils.getStore("user");
});

async function handleLogout() {
  loggingOut.value = true;
  try {
    await authServices.logoutUser();
  } catch (_err) {
    // Continue cleanup even if server call fails
  } finally {
    Utils.removeItem("user");
    loggingOut.value = false;
    await router.push({ name: "login" });
  }
}
</script>

<template>
  <v-container class="fill-height justify-center" fluid>
    <v-card width="100%" max-width="500" rounded="lg" elevation="2" class="pa-6 text-center">
      <v-card-title class="text-h4 font-weight-bold mb-2">
        Welcome, {{ user?.fName || "User" }}!
      </v-card-title>
      <v-card-text class="text-body-1 text-medium-emphasis mb-6">
        You are signed in to Todo Speckit.
      </v-card-text>
      <v-card-actions class="justify-center">
        <v-btn
          color="secondary"
          variant="outlined"
          rounded="lg"
          class="oc-cta"
          :loading="loggingOut"
          @click="handleLogout"
        >
          Sign out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
