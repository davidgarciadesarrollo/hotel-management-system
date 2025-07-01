import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

/**
 * Componente formulario para crear/editar tipos de habitación
 * 
 * Funcionalidades principales:
 * - Formulario dinámico para tipos de habitación
 * - Validación de compatibilidad tipo-acomodación en tiempo real
 * - Filtrado automático de acomodaciones según tipo seleccionado
 * - Reseteo automático de campos dependientes
 * - Validación dual (frontend + backend)
 * - Mensajes de ayuda contextuales
 * 
 * Reglas de compatibilidad implementadas:
 * - ESTÁNDAR: SENCILLA, DOBLE
 * - JUNIOR: SENCILLA, DOBLE, TRIPLE  
 * - SUITE: DOBLE, TRIPLE, CUÁDRUPLE
 * 
 * @param {Object} props.onClose - Función para cerrar el formulario
 * @param {Object} props.onRefresh - Función para refrescar la lista principal
 * @param {Object} props.onActualizarDetalle - Función para actualizar detalles
 * @param {Object} ref - Referencia para control externo del componente
 * 
 * @author Sistema de Gestión Hotelera  
 * @version 2.1
 * @since 1.0
 */
const RoomTypeForm = forwardRef(({ onClose, onRefresh, onActualizarDetalle }, ref) => {
  const [formData, setFormData] = useState({
    id: null,
    type: '',
    quantity: 1,
    accommodation: '',
    hotel_id: ''
  });
  const [hoteles, setHoteles] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tiposHabitacion = ['ESTÁNDAR', 'JUNIOR', 'SUITE'];

  /**
   * Reglas de compatibilidad tipo-acomodación
   * 
   * Define qué acomodaciones son válidas para cada tipo de habitación
   * basado en lógica hotelera estándar:
   * 
   * - ESTÁNDAR: Habitaciones básicas para 1-2 personas
   * - JUNIOR: Habitaciones intermedias para 3-4 personas
   * - SUITE: Habitaciones premium para 1-3 personas
   * 
   * IMPORTANTE: Estas reglas deben mantenerse sincronizadas con el backend
   * en RoomTypeController.php
   */
  const compatibilityRules = {
    'ESTÁNDAR': ['SENCILLA', 'DOBLE'],
    'JUNIOR': ['TRIPLE', 'CUÁDRUPLE'],
    'SUITE': ['SENCILLA', 'DOBLE', 'TRIPLE']
  };

  /**
   * Obtiene las acomodaciones disponibles según el tipo seleccionado
   * 
   * @returns {string[]} Array de acomodaciones permitidas para el tipo actual
   * @example
   * // Si formData.type === 'ESTÁNDAR'
   * getAvailableAccommodations() // Returns: ['SENCILLA', 'DOBLE']
   */
  const getAvailableAccommodations = () => {
    if (!formData.type) return [];
    
    // Solución directa: verificar si contiene "EST" para ESTÁNDAR
    if (formData.type.includes('EST')) {
      return ['SENCILLA', 'DOBLE'];
    }
    
    if (formData.type === 'JUNIOR') {
      return ['TRIPLE', 'CUÁDRUPLE'];
    }
    
    if (formData.type === 'SUITE') {
      return ['SENCILLA', 'DOBLE', 'TRIPLE'];
    }
    
    return [];
  };

  /**
   * Calcula la capacidad disponible para el hotel seleccionado (solo para creación)
   * 
   * @returns {Object} Objeto con información de capacidad
   */
  const getHotelCapacityInfo = () => {
    // Solo calcular capacidad si NO estamos editando (formData.id no existe)
    if (formData.id || !formData.hotel_id) return { total: 0, used: 0, available: 0 };
    
    const hotel = hoteles.find(h => h.id === parseInt(formData.hotel_id));
    if (!hotel) return { total: 0, used: 0, available: 0 };
    
    // Calcular habitaciones usadas
    const usedRooms = roomTypes
      .filter(rt => rt.hotel_id === parseInt(formData.hotel_id))
      .reduce((sum, rt) => sum + rt.quantity, 0);
    
    const totalRooms = hotel.numero_habitaciones || 0;
    const availableRooms = totalRooms - usedRooms;
    
    return {
      total: totalRooms,
      used: usedRooms,
      available: availableRooms
    };
  };

  /**
   * Obtiene las acomodaciones ya ocupadas en un hotel específico
   * @param {number} hotelId - ID del hotel
   * @returns {Array} Lista de acomodaciones ocupadas con sus tipos
   */
  const getOccupiedAccommodations = (hotelId) => {
    return roomTypes
      .filter(rt => rt.hotel_id === parseInt(hotelId))
      .map(rt => ({
        accommodation: rt.accommodation,
        type: rt.type,
        quantity: rt.quantity
      }));
  };

  /**
   * Genera HTML para mostrar las acomodaciones ocupadas
   * @param {number} hotelId - ID del hotel  
   * @returns {string} HTML con la lista de acomodaciones ocupadas
   */
  const generateOccupiedAccommodationsHTML = (hotelId) => {
    const occupied = getOccupiedAccommodations(hotelId);
    if (occupied.length === 0) {
      return '<p class="text-muted">No hay acomodaciones registradas en este hotel.</p>';
    }
    
    const accommodationTranslations = {
      'SENCILLA': 'Sencilla (1 persona)',
      'DOBLE': 'Doble (2 personas)', 
      'TRIPLE': 'Triple (3 personas)',
      'CUÁDRUPLE': 'Cuádruple (4 personas)'
    };
    
    const occupiedList = occupied.map(item => {
      const translatedAccommodation = accommodationTranslations[item.accommodation] || item.accommodation;
      return `<li><strong>${translatedAccommodation}</strong> - Tipo: ${item.type} (${item.quantity} habitaciones)</li>`;
    }).join('');
    
    return `
      <p><strong>Acomodaciones ya registradas en este hotel:</strong></p>
      <ul>${occupiedList}</ul>
    `;
  };

  useImperativeHandle(ref, () => ({
    setRoomType: (roomType) => {
      // NORMALIZAR EL TIPO ANTES DE SETEAR
      const normalizedType = roomType.type.includes('EST') ? 'ESTÁNDAR' : roomType.type;
      
      setFormData({
        id: roomType.id,
        type: normalizedType,
        quantity: roomType.quantity,
        accommodation: roomType.accommodation,
        hotel_id: roomType.hotel_id
      });
      setErrors({});
      
      // FORZAR RECARGA DE DATOS
      fetchRoomTypes();
    }
  }));

  const fetchRoomTypes = async () => {
    try {
      // FORZAR RECARGA SIN CACHE
      const roomTypesData = await api.getRoomTypes();
      
      // NORMALIZAR LOS DATOS QUE VIENEN DE LA API
      const normalizedData = roomTypesData.map(roomType => {
        const originalType = roomType.type;
        const normalizedType = roomType.type.includes('EST') ? 'ESTÁNDAR' : roomType.type;
        
        return {
          ...roomType,
          type: normalizedType
        };
      });
      
      setRoomTypes(normalizedData);
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  useEffect(() => {
    const fetchHoteles = async () => {
      try {
        const hotelesData = await api.getHotels();
        setHoteles(hotelesData);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };

    const fetchAndNormalizeRoomTypes = async () => {
      try {
        const roomTypesData = await api.getRoomTypes();
        
        // NORMALIZAR TODOS LOS TIPOS QUE VIENEN DE LA API
        const normalizedData = roomTypesData.map(roomType => ({
          ...roomType,
          type: roomType.type.includes('EST') ? 'ESTÁNDAR' : roomType.type
        }));
        
        setRoomTypes(normalizedData);
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };

    fetchHoteles();
    fetchAndNormalizeRoomTypes();
  }, []);

  /**
   * Maneja los cambios en los campos del formulario
   * 
   * Funcionalidad especial:
   * - Si cambia el tipo de habitación, resetea automáticamente la acomodación
   *   para evitar combinaciones inválidas remanentes
   * - Limpia errores de validación cuando el usuario modifica un campo
   * - Valida capacidad en tiempo real cuando cambia la cantidad
   * 
   * @param {Event} e - Evento del input/select
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si cambia el tipo de habitación, resetear la acomodación
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        accommodation: '' // Resetear acomodación cuando cambia el tipo
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'quantity' ? parseInt(value) || 0 : value
      }));
    }
    
    // Limpiar error específico cuando el usuario modifica el campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.type.trim()) {
      newErrors.type = 'El tipo de habitación es requerido';
    }
    
    if (!formData.accommodation.trim()) {
      newErrors.accommodation = 'La acomodación es requerida';
    }
    
    if (!formData.hotel_id) {
      newErrors.hotel_id = 'Debe seleccionar un hotel';
    }
    
    if (formData.quantity < 1) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0';
    }

    // Validar compatibilidad tipo-acomodación en frontend
    if (formData.type && formData.accommodation) {
      const availableAccommodations = compatibilityRules[formData.type] || [];
      if (!availableAccommodations.includes(formData.accommodation)) {
        newErrors.accommodation = `La acomodación '${formData.accommodation}' no es compatible con el tipo '${formData.type}'`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // VALIDACIÓN ADICIONAL: Verificar capacidad antes de enviar al servidor (solo para creación)
    if (!formData.id) {
      const capacityInfo = getHotelCapacityInfo();
      if (formData.quantity > capacityInfo.available) {
        Swal.fire({
          icon: 'error',
          title: '❌ Capacidad Excedida',
          html: `
            <div class="text-start">
              <p><strong>No se puede guardar este tipo de habitación.</strong></p>
              <hr>
              <p><strong>📊 Resumen de Capacidad:</strong></p>
              <ul>
                <li>🏨 <strong>Hotel:</strong> ${hoteles.find(h => h.id === parseInt(formData.hotel_id))?.nombre}</li>
                <li>🏠 <strong>Total habitaciones:</strong> ${capacityInfo.total}</li>
                <li>📋 <strong>Ya asignadas:</strong> ${capacityInfo.used}</li>
                <li>✅ <strong>Disponibles:</strong> ${capacityInfo.available}</li>
                <li>❌ <strong>Intentando asignar:</strong> ${formData.quantity}</li>
              </ul>
              <p><strong>Por favor, ajuste la cantidad a máximo ${capacityInfo.available} habitaciones.</strong></p>
            </div>
          `,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545',
          width: '500px'
        });
        return;
      }
    }

    setLoading(true);
    
    try {
      if (formData.id) {
        // Editar tipo de habitación existente - NORMALIZAR ANTES DE ENVIAR
        await api.updateRoomType(formData.id, {
          type: formData.type === 'ESTÁNDAR' ? 'ESTANDAR' : formData.type,
          quantity: formData.quantity,
          accommodation: formData.accommodation,
          hotel_id: formData.hotel_id
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Tipo de habitación actualizado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#198754'
        });
        
        if (onActualizarDetalle) {
          onActualizarDetalle(formData.id);
        }
      } else {
        // Crear nuevo tipo de habitación - NORMALIZAR ANTES DE ENVIAR
        await api.createRoomType({
          type: formData.type === 'ESTÁNDAR' ? 'ESTANDAR' : formData.type,
          quantity: formData.quantity,
          accommodation: formData.accommodation,
          hotel_id: formData.hotel_id
        });
        
        Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Tipo de habitación creado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#198754'
        });
      }
      
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error saving room type:', error);
      
      let errorTitle = 'Error';
      let errorMessage = 'Error al guardar el tipo de habitación.';
      let errorIcon = 'error';
      
      if (error.response?.status === 422) {
        // Error de validación específico
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          
          // Personalizar título según el tipo de error
          if (errorMessage.includes('ACOMODACIÓN DUPLICADA')) {
            errorTitle = '🚫 Acomodación Duplicada en Hotel';
            errorIcon = 'warning';
          } else if (errorMessage.includes('INCOMPATIBILIDAD')) {
            errorTitle = '⚠️ Incompatibilidad de Tipos';
            errorIcon = 'warning';
          } else if (errorMessage.includes('CANTIDAD NO EDITABLE')) {
            errorTitle = '🔒 Campo Protegido';
            errorIcon = 'info';
          } else if (errorMessage.includes('TIPO NO VÁLIDO')) {
            errorTitle = '❌ Tipo Inválido';
            errorIcon = 'error';
          }
        } else if (error.response?.data?.errors) {
          const apiErrors = error.response.data.errors;
          const firstError = Object.values(apiErrors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else {
            errorMessage = firstError;
          }
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        icon: errorIcon,
        title: errorTitle,
        html: `
          <div class="text-start">
            <div style="white-space: pre-line; line-height: 1.5;">${errorMessage}</div>
            ${errorMessage.includes('ACOMODACIÓN DUPLICADA') ? 
              `<hr>
              <div class="alert alert-info mt-3 mb-0" style="font-size: 0.9em;">
                <h6 class="alert-heading mb-2">📋 Estado Actual del Hotel:</h6>
                ${generateOccupiedAccommodationsHTML(formData.hotel_id)}
                <hr>
                <p class="mb-2"><strong>💡 Para solucionar este problema:</strong></p>
                <ol class="mb-0">
                  <li>Revise la lista anterior de acomodaciones ya ocupadas</li>
                  <li>Seleccione una acomodación que NO aparezca en la lista</li>
                  <li>Recuerde las reglas de compatibilidad tipo-acomodación</li>
                </ol>
              </div>` : ''
            }
            ${errorMessage.includes('INCOMPATIBILIDAD') ? 
              `<hr>
              <div class="alert alert-warning mt-3 mb-0" style="font-size: 0.9em;">
                <h6 class="alert-heading mb-2">⚠️ Reglas de Compatibilidad:</h6>
                <ul class="mb-0">
                  <li><strong>ESTÁNDAR:</strong> Solo Sencilla o Doble</li>
                  <li><strong>JUNIOR:</strong> Solo Triple o Cuádruple</li>
                  <li><strong>SUITE:</strong> Sencilla, Doble o Triple</li>
                </ul>
              </div>` : ''
            }
          </div>
        `,
        confirmButtonText: 'Entendido',
        confirmButtonColor: errorIcon === 'info' ? '#0d6efd' : '#dc3545',
        width: '500px'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-door-open-fill me-2"></i>
              {formData.id ? 'Editar Tipo de Habitación' : 'Agregar Tipo de Habitación'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* Hotel */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-building-fill me-1"></i>Hotel *
                  </label>
                  <select
                    name="hotel_id"
                    className={`form-select ${errors.hotel_id ? 'is-invalid' : ''}`}
                    value={formData.hotel_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un hotel</option>
                    {hoteles.map(hotel => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.nombre} - {hotel.ciudad}
                      </option>
                    ))}
                  </select>
                  {errors.hotel_id && <div className="invalid-feedback">{errors.hotel_id}</div>}
                </div>

                {/* Tipo de habitación */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-tag-fill me-1"></i>Tipo de Habitación *
                  </label>
                  <select
                    name="type"
                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione un tipo</option>
                    {tiposHabitacion.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                  {errors.type && <div className="invalid-feedback">{errors.type}</div>}
                </div>

                {/* Acomodación */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-people-fill me-1"></i>Acomodación *
                  </label>
                  <select
                    name="accommodation"
                    className={`form-select ${errors.accommodation ? 'is-invalid' : ''}`}
                    value={formData.accommodation}
                    onChange={handleChange}
                    required
                    disabled={!formData.type}
                  >
                    <option value="">
                      {formData.type 
                        ? 'Seleccione una acomodación' 
                        : 'Primero seleccione un tipo de habitación'
                      }
                    </option>
                    {getAvailableAccommodations().map(acomodacion => (
                      <option key={acomodacion} value={acomodacion}>
                        {acomodacion === 'SENCILLA' ? 'Sencilla (1 persona)' :
                         acomodacion === 'DOBLE' ? 'Doble (2 personas)' :
                         acomodacion === 'TRIPLE' ? 'Triple (3 personas)' :
                         acomodacion === 'CUÁDRUPLE' ? 'Cuádruple (4 personas)' :
                         acomodacion}
                      </option>
                    ))}
                  </select>
                  {errors.accommodation && <div className="invalid-feedback">{errors.accommodation}</div>}
                  {formData.type && (
                    <div className="form-text">
                      <i className="bi bi-info-circle me-1"></i>
                      Acomodaciones permitidas para <strong>{formData.type}</strong>: {getAvailableAccommodations().join(', ')}
                    </div>
                  )}
                </div>

                {/* Cantidad */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-hash me-1"></i>Cantidad *
                    {formData.id && (
                      <small className="text-muted ms-2">
                        <i className="bi bi-lock-fill me-1"></i>
                        No editable
                      </small>
                    )}
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    className={`form-control ${errors.quantity ? 'is-invalid' : ''} ${formData.id ? 'bg-light' : ''}`}
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    max={formData.hotel_id && !formData.id ? getHotelCapacityInfo().available : undefined}
                    required
                    readOnly={formData.id ? true : false}
                    title={formData.id ? 'La cantidad no se puede modificar al editar un tipo de habitación' : ''}
                  />
                  {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                  {formData.id ? (
                    <div className="form-text text-info">
                      <i className="bi bi-info-circle me-1"></i>
                      La cantidad no puede modificarse al editar un tipo de habitación existente.
                    </div>
                  ) : (
                    formData.hotel_id && (
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        <strong>Capacidad del hotel:</strong> {getHotelCapacityInfo().total} habitaciones | 
                        <strong> Asignadas:</strong> {getHotelCapacityInfo().used} | 
                        <strong> Disponibles:</strong> <span className={getHotelCapacityInfo().available > 0 ? 'text-success' : 'text-danger'}>
                          {getHotelCapacityInfo().available}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                <i className="bi bi-x-circle me-1"></i>Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    {formData.id ? 'Actualizar' : 'Crear'} Tipo de Habitación
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default RoomTypeForm;
