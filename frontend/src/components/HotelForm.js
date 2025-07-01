import React, { useState, forwardRef, useImperativeHandle } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const HotelForm = forwardRef((props, ref) => {
  const { onClose, onRefresh, onActualizarDetalle } = props;
  
  const [hotel, setHotel] = useState({
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
  });

  useImperativeHandle(ref, () => ({
    setHotel: (hotelData) => {
      const tipos = ['ESTANDAR', 'JUNIOR', 'SUITE'];
      const roomTypes = tipos.map(type => {
        if (hotelData.room_types && hotelData.room_types.length) {
          const found = hotelData.room_types.find(rt => rt.type === type);
          return {
            type,
            quantity: found ? found.quantity : 0,
            accommodation: found ? found.accommodation : ''
          };
        }
        return { type, quantity: 0, accommodation: '' };
      });

      setHotel({
        id: hotelData.id !== undefined && hotelData.id !== null ? hotelData.id : null,
        nombre: hotelData.nombre || '',
        direccion: hotelData.direccion || '',
        ciudad: hotelData.ciudad || '',
        nit: hotelData.nit || '',
        numero_habitaciones: hotelData.numero_habitaciones || 0,
        roomTypes
      });
    }
  }));

  /**
   * Retorna las opciones de acomodación disponibles según el tipo de habitación.
   */
  const getAccommodationOptions = (type) => {
    const options = {
      ESTANDAR: ['Sencilla', 'Doble'],
      JUNIOR: ['Triple', 'Cuádruple'],
      SUITE: ['Sencilla', 'Doble', 'Triple'],
    };
    return options[type] || [];
  };

  // Funciones reutilizables de alerta
  const showSuccessAlert = (title, text) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#198754'
    });
  };

  const showErrorAlert = (title, text) => {
    Swal.fire({
      icon: 'error',
      title: title,
      html: text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#dc3545'
    });
  };

  const showWarningAlert = (title, text) => {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: text,
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#ffc107'
    });
  };

  const handleInputChange = (field, value) => {
    setHotel(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoomTypeChange = (index, field, value) => {
    setHotel(prev => ({
      ...prev,
      roomTypes: prev.roomTypes.map((rt, idx) => 
        idx === index ? { ...rt, [field]: value } : rt
      )
    }));
  };

  /**
   * Envía el formulario para crear o actualizar un hotel.
   */
  const submitForm = async (e) => {
    e.preventDefault();
    
    // Validación: la suma de habitaciones por tipo debe ser igual al total
    const total = hotel.roomTypes.reduce((sum, rt) => sum + Number(rt.quantity), 0);
    
    if (total !== Number(hotel.numero_habitaciones)) {
      showWarningAlert(
        'Las cantidades no cuadran',
        `Tienes ${total} habitaciones distribuidas por tipos, pero el hotel dice tener ${hotel.numero_habitaciones} habitaciones en total. Estos números deben coincidir exactamente.`
      );
      return;
    }

    // Validación: no permitir combinaciones duplicadas de tipo y acomodación
    const combinaciones = hotel.roomTypes
      .filter(rt => rt.quantity > 0 && rt.accommodation)
      .map(rt => `${rt.type}-${rt.accommodation}`);
    const duplicados = combinaciones.filter((item, idx) => combinaciones.indexOf(item) !== idx);
    if (duplicados.length > 0) {
      showWarningAlert(
        'Combinación duplicada',
        'No puede haber tipos de habitación y acomodación repetidos para el mismo hotel.'
      );
      return;
    }

    // Prepara el objeto para el backend
    const payload = {
      ...hotel,
      room_types: hotel.roomTypes,
    };
    delete payload.roomTypes;

    try {
      if (hotel.id) {
        await api.updateHotel(hotel.id, payload);
        showSuccessAlert('¡Actualizado!', 'El hotel se actualizó correctamente.');
      } else {
        await api.createHotel(payload);
        showSuccessAlert('¡Registrado!', 'El hotel se registró correctamente.');
      }
      onRefresh();
      onActualizarDetalle(hotel.id);
      onClose();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const errors = error.response.data.errors;
        
        // Manejar error de NIT duplicado
        if (errors.nit) {
          showErrorAlert(
            'NIT duplicado',
            'El NIT ingresado ya está registrado para otro hotel.'
          );
        }
        // Manejar error de cantidad total de habitaciones
        else if (errors.numero_habitaciones) {
          showErrorAlert(
            'Las cantidades no cuadran',
            errors.numero_habitaciones[0]
          );
        }
        // Otros errores de validación
        else {
          const errorMessages = Object.values(errors).flat().join('\n');
          showErrorAlert(
            'Errores de validación',
            errorMessages
          );
        }
      } else {
        showErrorAlert(
          'Error',
          'Error al guardar el hotel. Intenta nuevamente.'
        );
      }
    }
  };

  return (
    <div className="hotel-form bg-white p-4 rounded shadow-sm my-4" style={{ maxWidth: '800px', margin: 'auto' }}>
      <h3 className="mb-4">{hotel.id ? 'Editar Hotel' : 'Registrar Hotel'}</h3>
      <form onSubmit={submitForm}>
        {/* Campos principales del hotel */}
        <div className="row mb-3">
          <div className="col-md-6 mb-3 mb-md-0">
            <label htmlFor="nombre" className="form-label">Nombre del Hotel</label>
            <input
              type="text"
              className="form-control"
              id="nombre"
              value={hotel.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Hotel Central"
              required
            />
            <div className="form-text">Ingrese el nombre oficial del hotel.</div>
          </div>
          <div className="col-md-6">
            <label htmlFor="direccion" className="form-label">Dirección</label>
            <input
              type="text"
              className="form-control"
              id="direccion"
              value={hotel.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Ej: Calle 123 #45-67"
              required
            />
            <div className="form-text">Dirección física del hotel.</div>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4 mb-3 mb-md-0">
            <label htmlFor="ciudad" className="form-label">Ciudad</label>
            <input
              type="text"
              className="form-control"
              id="ciudad"
              value={hotel.ciudad}
              onChange={(e) => handleInputChange('ciudad', e.target.value)}
              placeholder="Ej: Bogotá"
              required
            />
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <label htmlFor="nit" className="form-label">NIT</label>
            <input
              type="text"
              className="form-control"
              id="nit"
              value={hotel.nit}
              onChange={(e) => handleInputChange('nit', e.target.value)}
              placeholder="Ej: 900123456"
              required
            />
            <div className="form-text">Debe ser único para cada hotel.</div>
          </div>
          <div className="col-md-4">
            <label htmlFor="numero_habitaciones" className="form-label">Número de Habitaciones</label>
            <input
              type="number"
              className="form-control"
              id="numero_habitaciones"
              value={hotel.numero_habitaciones}
              onChange={(e) => handleInputChange('numero_habitaciones', parseInt(e.target.value) || 0)}
              min="1"
              placeholder="Ej: 50"
              required
            />
          </div>
        </div>

        <hr className="my-4" />

        <div className="mb-3">
          <h5 className="mb-3">Tipos de Habitación</h5>
          {hotel.roomTypes.map((rt, idx) => (
            <div className="row g-3 mb-3" key={rt.type}>
              <div className="col-md-3">
                <label htmlFor={`tipo-${idx}`} className="form-label">Tipo</label>
                <input
                  id={`tipo-${idx}`}
                  type="text"
                  className="form-control"
                  value={rt.type}
                  readOnly
                />
              </div>
              <div className="col-md-3">
                <label htmlFor={`cantidad-${idx}`} className="form-label">Cantidad</label>
                <input
                  id={`cantidad-${idx}`}
                  type="number"
                  className="form-control"
                  value={rt.quantity}
                  onChange={(e) => handleRoomTypeChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                  min="0"
                  placeholder="Ej: 10"
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor={`accommodation-${idx}`} className="form-label">Acomodación</label>
                <select
                  id={`accommodation-${idx}`}
                  className="form-select"
                  value={rt.accommodation}
                  onChange={(e) => handleRoomTypeChange(idx, 'accommodation', e.target.value)}
                  required
                >
                  <option value="" disabled>Seleccione una opción</option>
                  {getAccommodationOptions(rt.type).map(op => (
                    <option key={op} value={op}>{op}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <div className="form-text mt-2">
            Complete la cantidad y acomodación para cada tipo de habitación.
          </div>
        </div>

        {/* Botones de acción */}
        <div className="d-flex justify-content-end mt-4">
          <button type="submit" className="btn btn-primary me-2">
            {hotel.id ? 'Actualizar Hotel' : 'Registrar Hotel'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
});

export default HotelForm;
