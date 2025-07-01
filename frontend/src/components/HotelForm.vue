<!-- 
  Componente: HotelForm
  Permite crear o editar un hotel y sus tipos de habitación.
  Usa Bootstrap 5 para el diseño visual y SweetAlert2 para alertas.
-->

<template>
  <!-- Formulario principal para hotel -->
  <div class="hotel-form bg-white p-4 rounded shadow-sm my-4">
    <h3 class="mb-4">{{ hotel.id ? 'Editar Hotel' : 'Registrar Hotel' }}</h3>
    <form @submit.prevent="submitForm" ref="hotelForm">
      <!-- Campos principales del hotel -->
      <div class="row mb-3">
        <div class="col-md-6 mb-3 mb-md-0">
          <label for="nombre" class="form-label">Nombre del Hotel</label>
          <input
            type="text"
            class="form-control"
            id="nombre"
            v-model="hotel.nombre"
            placeholder="Ej: Hotel Central"
            required
          />
          <div class="form-text">Ingrese el nombre oficial del hotel.</div>
        </div>
        <div class="col-md-6">
          <label for="direccion" class="form-label">Dirección</label>
          <input
            type="text"
            class="form-control"
            id="direccion"
            v-model="hotel.direccion"
            placeholder="Ej: Calle 123 #45-67"
            required
          />
          <div class="form-text">Dirección física del hotel.</div>
        </div>
      </div>

      <div class="row mb-3">
        <div class="col-md-4 mb-3 mb-md-0">
          <label for="ciudad" class="form-label">Ciudad</label>
          <input
            type="text"
            class="form-control"
            id="ciudad"
            v-model="hotel.ciudad"
            placeholder="Ej: Bogotá"
            required
          />
        </div>
        <div class="col-md-4 mb-3 mb-md-0">
          <label for="nit" class="form-label">NIT</label>
          <input
            type="text"
            class="form-control"
            id="nit"
            v-model="hotel.nit"
            placeholder="Ej: 900123456"
            required
          />
          <div class="form-text">Debe ser único para cada hotel.</div>
        </div>
        <div class="col-md-4">
          <label for="numero_habitaciones" class="form-label">Número de Habitaciones</label>
          <input
            type="number"
            class="form-control"
            id="numero_habitaciones"
            v-model="hotel.numero_habitaciones"
            min="1"
            placeholder="Ej: 50"
            required
          />
        </div>
      </div>

      <hr class="my-4" />

      <div class="mb-3">
        <h5 class="mb-3">Tipos de Habitación</h5>
        <div class="row g-3" v-for="(rt, idx) in hotel.roomTypes" :key="rt.type">
          <div class="col-md-3">
            <label :for="'tipo-' + idx" class="form-label">Tipo</label>
            <input
              :id="'tipo-' + idx"
              type="text"
              class="form-control"
              v-model="rt.type"
              readonly
            />
          </div>
          <div class="col-md-3">
            <label :for="'cantidad-' + idx" class="form-label">Cantidad</label>
            <input
              :id="'cantidad-' + idx"
              type="number"
              class="form-control"
              v-model.number="rt.quantity"
              min="0"
              placeholder="Ej: 10"
              required
            />
          </div>
          <div class="col-md-4">
            <label :for="'accommodation-' + idx" class="form-label">Acomodación</label>
            <select
              :id="'accommodation-' + idx"
              class="form-select"
              v-model="rt.accommodation"
              required
            >
              <option value="" disabled>Seleccione una opción</option>
              <option v-for="op in getAccommodationOptions(rt.type)" :key="op" :value="op">
                {{ op }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-text mt-2">
          Complete la cantidad y acomodación para cada tipo de habitación.
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="d-flex justify-content-end mt-4">
        <button type="submit" class="btn btn-primary me-2">
          {{ hotel.id ? 'Actualizar Hotel' : 'Registrar Hotel' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Cancelar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
// Componente para crear/editar hoteles.
// Usa SweetAlert2 para mostrar alertas modernas.
import api from '../services/api.js';
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      hotel: {
        id: null,
        nombre: '',
        direccion: '',
        ciudad: '',
        nit: '',
        numero_habitaciones: 0,
        roomTypes: [
          { type: 'ESTANDAR', quantity: 0, accommodation: '' },
          { type: 'JUNIOR', quantity: 0, accommodation: '' },
          { type: 'SUITE', quantity: 0, accommodation: '' },
        ],
      },
    };
  },
  methods: {
    /**
     * Retorna las opciones de acomodación disponibles según el tipo de habitación.
     * @param {string} type - Tipo de habitación (ESTANDAR, JUNIOR, SUITE)
     * @returns {Array<string>} Opciones de acomodación válidas para el tipo.
     */
    getAccommodationOptions(type) {
      const options = {
        ESTANDAR: ['Sencilla', 'Doble'],
        JUNIOR: ['Triple', 'Cuádruple'],
        SUITE: ['Sencilla', 'Doble', 'Triple'],
      };
      return options[type] || [];
    },

    /**
     * Envía el formulario para crear o actualizar un hotel.
     * Realiza validaciones de negocio antes de guardar.
     * Emite eventos para refrescar la lista, actualizar el detalle y cerrar el formulario.
     */
    async submitForm() {
      // Validación: la suma de habitaciones por tipo debe ser igual al total
      const total = this.hotel.roomTypes.reduce((sum, rt) => sum + Number(rt.quantity), 0);
      
      if (total !== Number(this.hotel.numero_habitaciones)) {
        this.showWarningAlert(
          'Las cantidades no cuadran',
          `Tienes ${total} habitaciones distribuidas por tipos, pero el hotel dice tener ${this.hotel.numero_habitaciones} habitaciones en total. Estos números deben coincidir exactamente.`
        );
        return;
      }

      // Validación: no permitir combinaciones duplicadas de tipo y acomodación
      const combinaciones = this.hotel.roomTypes
        .filter(rt => rt.quantity > 0 && rt.accommodation)
        .map(rt => `${rt.type}-${rt.accommodation}`);
      const duplicados = combinaciones.filter((item, idx) => combinaciones.indexOf(item) !== idx);
      if (duplicados.length > 0) {
        this.showWarningAlert(
          'Combinación duplicada',
          'No puede haber tipos de habitación y acomodación repetidos para el mismo hotel.'
        );
        return;
      }

      // Validación: evitar hoteles duplicados por nombre y ciudad al crear
      const existe = this.$parent.hoteles.some(h =>
        h.nombre.trim().toLowerCase() === this.hotel.nombre.trim().toLowerCase() &&
        h.ciudad.trim().toLowerCase() === this.hotel.ciudad.trim().toLowerCase() &&
        h.id !== this.hotel.id // Excluye el hotel que se está editando
      );

      if (existe) {
        this.showWarningAlert(
          'Hotel duplicado',
          'Ya existe un hotel con ese nombre y ciudad.'
        );
        return;
      }

      // Prepara el objeto para el backend
      const payload = {
        ...this.hotel,
        room_types: this.hotel.roomTypes,
      };
      delete payload.roomTypes;

      try {
        if (this.hotel.id) {
          await api.updateHotel(this.hotel.id, payload);
          this.showSuccessAlert('¡Actualizado!', 'El hotel se actualizó correctamente.');
        } else {
          await api.createHotel(payload);
          this.showSuccessAlert('¡Registrado!', 'El hotel se registró correctamente.');
        }
        this.$emit('refresh');
        this.$emit('actualizarDetalle', this.hotel.id);
        this.$emit('close');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.errors) {
          const errors = error.response.data.errors;
          
          // Manejar error de NIT duplicado
          if (errors.nit) {
            this.showErrorAlert(
              'NIT duplicado',
              'El NIT ingresado ya está registrado para otro hotel.'
            );
          }
          // Manejar error de cantidad total de habitaciones
          else if (errors.numero_habitaciones) {
            this.showErrorAlert(
              'Las cantidades no cuadran',
              errors.numero_habitaciones[0]
            );
          }
          // Manejar errores de acomodaciones duplicadas
          else if (this.hasAccommodationErrors(errors)) {
            const accommodationError = this.getAccommodationErrorMessage(errors);
            this.showErrorAlert(
              'Acomodación Duplicada',
              accommodationError
            );
          }
          // Otros errores de validación
          else {
            const errorMessages = this.getValidationErrorMessages(errors);
            this.showErrorAlert(
              'Errores de validación',
              errorMessages
            );
          }
        } else {
          this.showErrorAlert(
            'Error',
            'Error al guardar el hotel. Intenta nuevamente.'
          );
        }
      }
    },

    /**
     * Inicializa el formulario con los datos del hotel recibido.
     * Asegura que siempre existan los tres tipos de habitación.
     * @param {Object} hotel - Objeto hotel recibido (incluye room_types del backend)
     */
    setHotel(hotel) {
      const tipos = ['ESTANDAR', 'JUNIOR', 'SUITE'];
      const roomTypes = tipos.map(type => {
        if (hotel.room_types && hotel.room_types.length) {
          const found = hotel.room_types.find(rt => rt.type === type);
          return {
            type,
            quantity: found ? found.quantity : 0,
            accommodation: found ? found.accommodation : ''
          };
        }
        return { type, quantity: 0, accommodation: '' };
      });

      this.hotel = {
        id: hotel.id !== undefined && hotel.id !== null ? hotel.id : null,
        nombre: hotel.nombre || '',
        direccion: hotel.direccion || '',
        ciudad: hotel.ciudad || '',
        nit: hotel.nit || '',
        numero_habitaciones: hotel.numero_habitaciones || 0,
        roomTypes
      };
    },

    /**
     * Obtiene la lista de hoteles desde la API y la asigna al componente padre.
     * Útil para refrescar la lista después de crear, editar o eliminar hoteles.
     */
    async fetchHotels() {
      this.hoteles = await api.getHotels();
    },

    // Funciones reutilizables de alerta
    showSuccessAlert(title, text) {
      Swal.fire({
        icon: 'success',
        title: title,
        text: text,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#198754'
      });
    },
    showErrorAlert(title, text) {
      Swal.fire({
        icon: 'error',
        title: title,
        html: text, // Cambiado de 'text' a 'html' para permitir etiquetas HTML
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
      });
    },
    showWarningAlert(title, text) {
      Swal.fire({
        icon: 'warning',
        title: title,
        text: text,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ffc107'
      });
    },

    /**
     * Verifica si hay errores relacionados con acomodaciones duplicadas
     */
    hasAccommodationErrors(errors) {
      return Object.keys(errors).some(key => 
        key.includes('room_types') && key.includes('accommodation')
      );
    },

    /**
     * Extrae y formatea el mensaje de error de acomodación duplicada
     */
    getAccommodationErrorMessage(errors) {
      for (const key in errors) {
        if (key.includes('room_types') && key.includes('accommodation')) {
          return errors[key][0]; // Retorna el primer mensaje de error
        }
      }
      return 'Error en acomodaciones. Verifique que no haya acomodaciones duplicadas.';
    },

    /**
     * Extrae y formatea múltiples mensajes de error de validación
     */
    getValidationErrorMessages(errors) {
      const messages = [];
      for (const field in errors) {
        if (Array.isArray(errors[field])) {
          messages.push(...errors[field]);
        } else {
          messages.push(errors[field]);
        }
      }
      return messages.join('\n');
    },
  },
};
</script>

<style scoped>
.hotel-form {
  max-width: 600px;
  margin: auto;
}
.hotel-form div {
  margin-bottom: 15px;
}
</style>

<div v-if="showForm && hotelSeleccionado">
  <HotelForm
    ref="hotelForm"
    @actualizarDetalle="actualizarDetalleHotel"
    @close="cerrarFormulario"
  />
</div>