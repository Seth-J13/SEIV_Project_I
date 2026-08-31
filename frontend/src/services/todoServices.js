import apiClient from "./services.js";

export default {
  getAllForList(listId) {
    return apiClient.get(`lists/${listId}/todos`);
  },

  create(listId, data) {
    return apiClient.post(`lists/${listId}/todos`, data);
  },

  update(id, data) {
    return apiClient.put(`todos/${id}`, data);
  },

  delete(id) {
    return apiClient.delete(`todos/${id}`);
  },
};
