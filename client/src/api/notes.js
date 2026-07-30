import api from "./axios";

export const getNotes = (projectId) => api.get(`/notes/${projectId}`);

export const getNoteById = (projectId, noteId) =>
  api.get(`/notes/${projectId}/n/${noteId}`);

export const createNote = (projectId, data) => api.post(`/notes/${projectId}`, data);

export const updateNote = (projectId, noteId, data) =>
  api.put(`/notes/${projectId}/n/${noteId}`, data);

export const deleteNote = (projectId, noteId) =>
  api.delete(`/notes/${projectId}/n/${noteId}`);
