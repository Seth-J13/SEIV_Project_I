import apiClient from "./services.js";

export default {
  getUser(userId) {
    return apiClient.get(`users/${userId}`);
  },

  updateUser(userId, data) {
    return apiClient.put(`users/${userId}`, data);
  },
};
