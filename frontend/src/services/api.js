// Servicio de conexión a la API de hoteles.
// Usa Axios para las peticiones HTTP.

import axios from 'axios';

// URL base de la API de hoteles
const API_URL = 'http://localhost:8001/api/hotels';

export default {
  // Obtiene todos los hoteles
  getHotels() {
    return axios.get(API_URL).then(res => res.data);
  },
  // Crea un hotel
  createHotel(data) {
    return axios.post(API_URL, data);
  },
  // Actualiza un hotel existente
  updateHotel(id, data) {
    return axios.put(`${API_URL}/${id}`, data);
  },
  // Elimina un hotel por ID
  deleteHotel(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
};