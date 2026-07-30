import api from "./axios";

export const getTasks = (projectId) => api.get(`/tasks/${projectId}`);

export const getTaskById = (projectId, taskId) =>
  api.get(`/tasks/${projectId}/t/${taskId}`);

// data can be a plain object or a FormData instance (for attachments)
export const createTask = (projectId, data) => {
  const isFormData = data instanceof FormData;
  return api.post(`/tasks/${projectId}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};

export const updateTask = (projectId, taskId, data) => {
  const isFormData = data instanceof FormData;
  return api.put(`/tasks/${projectId}/t/${taskId}`, data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
  });
};

export const deleteTask = (projectId, taskId) =>
  api.delete(`/tasks/${projectId}/t/${taskId}`);

export const createSubtask = (projectId, taskId, data) =>
  api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, data);

export const updateSubtask = (projectId, subTaskId, data) =>
  api.put(`/tasks/${projectId}/st/${subTaskId}`, data);

export const deleteSubtask = (projectId, subTaskId) =>
  api.delete(`/tasks/${projectId}/st/${subTaskId}`);
