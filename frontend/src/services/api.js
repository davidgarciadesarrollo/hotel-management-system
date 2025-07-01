// Servicio de conexión a la API de hoteles.
// Usa Axios para las peticiones HTTP.

import axios from 'axios';

// URL base de la API de hoteles
const API_URL = 'http://localhost:8001/api/hotels';
const ROOM_TYPES_API_URL = 'http://localhost:8001/api/room-types';

const apiService = {
  // Obtiene todos los hoteles
  getHotels() {
    return axios.get(API_URL)
      .then(res => {
        return res.data;
      })
      .catch(error => {
        throw error;
      });
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
  },
  // Obtiene todos los tipos de habitación
  getRoomTypes() {
    return axios.get(ROOM_TYPES_API_URL).then(res => res.data);
  },
  // Crea un tipo de habitación
  createRoomType(data) {
    return axios.post(ROOM_TYPES_API_URL, data);
  },
  // Actualiza un tipo de habitación existente
  updateRoomType(id, data) {
    return axios.put(`${ROOM_TYPES_API_URL}/${id}`, data);
  },
  // Elimina un tipo de habitación por ID
  deleteRoomType(id) {
    return axios.delete(`${ROOM_TYPES_API_URL}/${id}`);
  }
};

export default apiService;