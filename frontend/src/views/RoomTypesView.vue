<template>
  <table>
    <thead>
      <tr>
        <th>Tipo</th>
        <th>Cantidad</th>
        <th>Acomodación</th>
        <th>Hotel</th>
        <th>Dirección</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="rt in roomTypes" :key="rt.id">
        <td>{{ rt.type }}</td>
        <td>{{ rt.quantity }}</td>
        <td>{{ rt.accommodation }}</td>
        <td>{{ rt.hotel.nombre }}</td>
        <td>{{ rt.hotel.direccion }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import api from '../services/api.js';

export default {
  data() {
    return {
      roomTypes: []
    };
  },
  async mounted() {
    this.roomTypes = await api.getRoomTypes();
  }
};
</script>