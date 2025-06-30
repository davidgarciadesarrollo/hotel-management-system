<template>
  <div>
    <!-- Encabezado mejorado con Bootstrap 5 -->
    <div class="bg-primary bg-gradient py-4 mb-4">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-12 col-md-8">
            <h1 class="text-white fw-bold mb-0 text-center text-md-start">
              Lista de Hoteles
            </h1>
          </div>
          <div class="col-12 col-md-4 mt-3 mt-md-0 d-flex justify-content-center justify-content-md-end">
            <button
              class="btn btn-success fw-semibold"
              @click="agregarHotel"
            >
              <i class="bi bi-plus-circle me-2"></i>
              Agregar Hotel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showForm">
      <HotelForm
        ref="hotelForm"
        :key="formKey"
        @close="showForm = false"
        @refresh="fetchHotels"
        @actualizarDetalle="actualizarDetalleHotel"
      />
    </div>

    <!-- Tabla de hoteles con acciones -->
    <table class="table table-striped table-hover table-bordered align-middle">
      <thead class="table-dark">
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Ciudad</th>
          <th>NIT</th>
          <th>Habitaciones</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="hotel in hoteles" :key="hotel.id">
          <td>{{ hotel.id }}</td>
          <td>{{ hotel.nombre }}</td>
          <td>{{ hotel.direccion }}</td>
          <td>{{ hotel.ciudad }}</td>
          <td>{{ hotel.nit }}</td>
          <td>{{ hotel.numero_habitaciones }}</td>
          <td>
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-sm btn-primary" @click="editHotel(hotel)" title="Editar">
                <i class="bi bi-pencil-fill"></i>
              </button>
              <button class="btn btn-sm btn-danger" @click="deleteHotel(hotel.id)" title="Eliminar">
                <i class="bi bi-trash-fill"></i>
              </button>
              <button class="btn btn-sm btn-secondary" @click="verDetalle(hotel)" title="Ver Detalle">
                <i class="bi bi-eye-fill"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Detalle de tipos de habitación del hotel seleccionado -->
    <div v-if="hotelDetalle" class="card shadow-sm mb-4">
      <div class="card-header bg-primary text-white">
        Detalle de Tipos de Habitación para: {{ hotelDetalle.nombre }}
      </div>
      <div class="card-body">
        <div v-if="hotelDetalle.room_types && hotelDetalle.room_types.length > 0">
          <ul class="list-group list-group-flush">
            <li
              v-for="rt in hotelDetalle.room_types"
              :key="rt.id"
              class="list-group-item d-flex align-items-center"
            >
              <span class="fw-bold me-2">{{ rt.type }}</span>
              <span class="badge bg-secondary me-2">{{ rt.quantity }}</span>
              <small class="text-muted">{{ rt.accommodation }}</small>
            </li>
          </ul>
        </div>
        <div v-else class="text-muted">
          Este hotel no tiene tipos de habitación registrados.
        </div>
        <button class="btn btn-secondary mt-3" @click="hotelDetalle = null">
          <i class="bi bi-x-circle"></i> Cerrar Detalle
        </button>
      </div>
    </div>
  </div>
</template>

<script>
// Vista de hoteles: muestra, crea, edita y elimina hoteles.
// Usa Bootstrap 5, Bootstrap Icons y SweetAlert2 para alertas.
import HotelForm from '../components/HotelForm.vue';
import api from '../services/api.js';
import Swal from 'sweetalert2';

export default {
  components: { HotelForm },
  data() {
    return {
      hoteles: [],
      showForm: false,
      formKey: 0,
      hotelSeleccionado: null,
      hotelDetalle: null
    };
  },
  methods: {
    // Carga la lista de hoteles ordenada por ID descendente
    async fetchHotels() {
      try {
        const hoteles = await api.getHotels();
        this.hoteles = hoteles.sort((a, b) => b.id - a.id);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al cargar hoteles',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc3545'
        });
      }
    },
    // Abre el formulario para editar un hotel y muestra su detalle
    async editHotel(hotel) {
      this.showForm = true;
      this.hotelSeleccionado = hotel;
      this.$nextTick(() => {
        this.$refs.hotelForm.setHotel(hotel);
      });
      this.verDetalle(hotel);
    },
    // Abre el formulario para agregar un nuevo hotel
    agregarHotel() {
      this.formKey++;
      this.hotelSeleccionado = null;
      this.showForm = true;
      this.$nextTick(() => {
        this.$refs.hotelForm.setHotel({
          id: null,
          nombre: '',
          direccion: '',
          ciudad: '',
          nit: '',
          numero_habitaciones: 0,
          roomTypes: [],
        });
      });
    },
    // Elimina un hotel tras confirmación
    async deleteHotel(id) {
      const result = await Swal.fire({
        title: '¿Seguro que deseas eliminar este hotel?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        try {
          await api.deleteHotel(id);
          await this.fetchHotels();
          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El hotel ha sido eliminado correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#198754'
          });
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el hotel. Intenta nuevamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#dc3545'
          });
        }
      }
    },
    // Muestra el detalle del hotel seleccionado
    verDetalle(hotel) {
      this.hotelDetalle = hotel;
    },
    // Actualiza el detalle tras editar
    async actualizarDetalleHotel(id) {
      await this.fetchHotels(); // Refresca la lista primero
      const hotel = this.hoteles.find(h => h.id === id);
      if (hotel) {
        this.hotelDetalle = hotel; // Actualiza el detalle con los datos frescos
      }
    }
  },
  mounted() {
    this.fetchHotels();
  }
};
</script>

