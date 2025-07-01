import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const RoomTypeForm = forwardRef(({ onClose, onRefresh, onActualizarDetalle }, ref) => {
  const [formData, setFormData] = useState({
    id: null,
    type: '',
    quantity: 1,
    accommodation: '',
    hotel_id: ''
  });
  const [hoteles, setHoteles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const tiposHabitacion = ['ESTÁNDAR', 'JUNIOR', 'SUITE'];
  const acomodaciones = ['SENCILLA', 'DOBLE', 'TRIPLE', 'CUÁDRUPLE'];

  useImperativeHandle(ref, () => ({
    setRoomType: (roomType) => {
      setFormData(roomType);
      setErrors({});
    }
  }));

  useEffect(() => {
    const fetchHoteles = async () => {
      try {
        const hotelesData = await api.getHotels();
        setHoteles(hotelesData);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      }
    };
    fetchHoteles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value
    }));
    
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (formData.id) {
        // Editar tipo de habitación existente
        await api.updateRoomType(formData.id, {
          type: formData.type,
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
        // Crear nuevo tipo de habitación
        await api.createRoomType({
          type: formData.type,
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
      
      let errorMessage = 'Error al guardar el tipo de habitación.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const firstError = Object.values(apiErrors)[0];
        if (Array.isArray(firstError)) {
          errorMessage = firstError[0];
        } else {
          errorMessage = firstError;
        }
      }
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: errorMessage,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
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
                  >
                    <option value="">Seleccione una acomodación</option>
                    {acomodaciones.map(acomodacion => (
                      <option key={acomodacion} value={acomodacion}>{acomodacion}</option>
                    ))}
                  </select>
                  {errors.accommodation && <div className="invalid-feedback">{errors.accommodation}</div>}
                </div>

                {/* Cantidad */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-hash me-1"></i>Cantidad *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                  {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
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
