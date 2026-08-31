import apiClient from "./services.js";

export default {
  getAll() {
    return apiClient.get("lists");
  },

  create(data) {
    return apiClient.post("lists", data);
  },

  update(id, data) {
    return apiClient.put(`lists/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`lists/${id}`);
  },
};
