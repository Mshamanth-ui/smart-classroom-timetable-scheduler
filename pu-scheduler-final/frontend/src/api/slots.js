import api from './axios';
export const getSlots       = ()           => api.get('/slots');
export const createSlot     = (data)       => api.post('/slots', data);
export const updateSlot     = (id, data)   => api.put(`/slots/${id}`, data);
export const deleteSlot     = (id)         => api.delete(`/slots/${id}`);
export const moveSlot       = (id, day, t) => api.put(`/slots/${id}/move?day=${day}&timeSlot=${encodeURIComponent(t)}`);
export const copySlot       = (id, day, t) => api.post(`/slots/${id}/copy?day=${day}&timeSlot=${encodeURIComponent(t)}`);
