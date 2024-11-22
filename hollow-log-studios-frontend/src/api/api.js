import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const fetchArtworks = () => API.get('/artworks');
export const fetchArtworkById = (id) => API.get(`/artworks/${id}`);
export const createArtwork = (newArtwork) => API.post('/artworks', newArtwork);
export const updateArtwork = (id, updatedArtwork) => API.put(`/artworks/${id}`, updatedArtwork);
export const deleteArtwork = (id) => API.delete(`/artworks/${id}`);
