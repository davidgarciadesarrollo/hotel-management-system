import React, { useState, useEffect, useRef } from 'react';
import RoomTypeForm from '../components/RoomTypeForm';
import api from '../services/api';
import Swal from 'sweetalert2';

const RoomTypesView = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [roomTypeDetalle, setRoomTypeDetalle] = useState(null);
  const roomTypeFormRef = useRef();

  // Carga la lista de tipos de habitación
  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const data = await api.getRoomTypes();
      setRoomTypes(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar tipos de habitación: ' + error.message,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  // Abre el formulario para editar un tipo de habitación
  const editRoomType = async (roomType) => {
    setShowForm(true);
    setTimeout(() => {
      if (roomTypeFormRef.current) {
        roomTypeFormRef.current.setRoomType(roomType);
      }
    }, 0);
    verDetalle(roomType);
  };

  // Abre el formulario para agregar un nuevo tipo de habitación
  const agregarRoomType = () => {
    setFormKey(formKey + 1);
    setShowForm(true);
    setTimeout(() => {
      if (roomTypeFormRef.current) {
        roomTypeFormRef.current.setRoomType({
          id: null,
          type: '',
          quantity: 1,
          accommodation: '',
          hotel_id: ''
        });
      }
    }, 0);
  };

  // Elimina un tipo de habitación tras confirmación
  const deleteRoomType = async (id) => {
    const result = await Swal.fire({
      title: '¿Seguro que deseas eliminar este tipo de habitación?',
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
        await api.deleteRoomType(id);
        await fetchRoomTypes();
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'El tipo de habitación ha sido eliminado correctamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#198754'
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el tipo de habitación. Intenta nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#dc3545'
        });
      }
    }
  };

  // Muestra el detalle del tipo de habitación seleccionado
  const verDetalle = (roomType) => {
    setRoomTypeDetalle(roomType);
  };

  // Actualiza el detalle tras editar
  const actualizarDetalleRoomType = async (id) => {
    await fetchRoomTypes();
    const roomType = roomTypes.find(rt => rt.id === id);
    if (roomType) {
      setRoomTypeDetalle(roomType);
    }
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  return (
    <div>
      {/* Encabezado mejorado con Bootstrap 5 */}
      <div className="bg-primary bg-gradient py-2 mb-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <h2 className="text-white fw-bold mb-0 text-center text-md-start">
                <i className="bi bi-door-open-fill me-2"></i>
                Tipos de Habitación por Hotel
              </h2>
            </div>
            <div className="col-12 col-md-4 mt-3 mt-md-0 d-flex justify-content-center justify-content-md-end">
              <button className="btn btn-success fw-semibold" onClick={agregarRoomType}>
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Tipo de Habitación
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de tipo de habitación */}
      {showForm && (
        <RoomTypeForm
          ref={roomTypeFormRef}
          key={formKey}
          onClose={() => setShowForm(false)}
          onRefresh={fetchRoomTypes}
          onActualizarDetalle={actualizarDetalleRoomType}
        />
      )}

      {/* Estado de carga o contenido */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando tipos de habitación...</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body">
            {roomTypes.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th><i className="bi bi-hash me-1"></i>ID</th>
                    <th><i className="bi bi-tag-fill me-1"></i>Tipo</th>
                    <th><i className="bi bi-hash me-1"></i>Cantidad</th>
                    <th><i className="bi bi-people-fill me-1"></i>Acomodación</th>
                    <th><i className="bi bi-building-fill me-1"></i>Hotel</th>
                    <th><i className="bi bi-geo-alt-fill me-1"></i>Dirección</th>
                    <th className="text-center"><i className="bi bi-gear-fill me-1"></i>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map(rt => (
                    <tr key={rt.id}>
                      <td>{rt.id}</td>
                      <td>
                        <span className={`badge ${rt.type === 'SUITE' ? 'bg-warning' : rt.type === 'JUNIOR' ? 'bg-info' : 'bg-secondary'} text-dark`}>
                          {rt.type}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">{rt.quantity}</span>
                      </td>
                      <td>{rt.accommodation}</td>
                      <td className="fw-semibold">{rt.hotel.nombre}</td>
                      <td className="text-muted">{rt.hotel.direccion}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-2">
                          <button className="btn btn-sm btn-primary" onClick={() => editRoomType(rt)} title="Editar">
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteRoomType(rt.id)} title="Eliminar">
                            <i className="bi bi-trash-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-secondary" onClick={() => verDetalle(rt)} title="Ver Detalle">
                            <i className="bi bi-eye-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No hay tipos de habitación registrados</h4>
              <p className="text-muted">Los tipos de habitación aparecerán aquí cuando se registren hoteles.</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Detalle del tipo de habitación */}
      {roomTypeDetalle && (
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <i className="bi bi-info-circle-fill me-2"></i>
            Detalle del Tipo de Habitación: {roomTypeDetalle.type} - {roomTypeDetalle.accommodation}
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="fw-bold text-primary">Información Básica</h6>
                <ul className="list-unstyled">
                  <li><strong>ID:</strong> {roomTypeDetalle.id}</li>
                  <li><strong>Tipo:</strong> <span className={`badge ${roomTypeDetalle.type === 'SUITE' ? 'bg-warning' : roomTypeDetalle.type === 'JUNIOR' ? 'bg-info' : 'bg-secondary'} text-dark`}>{roomTypeDetalle.type}</span></li>
                  <li><strong>Acomodación:</strong> {roomTypeDetalle.accommodation}</li>
                  <li><strong>Cantidad:</strong> <span className="fw-bold text-primary">{roomTypeDetalle.quantity}</span></li>
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="fw-bold text-success">Información del Hotel</h6>
                <ul className="list-unstyled">
                  <li><strong>Hotel:</strong> {roomTypeDetalle.hotel.nombre}</li>
                  <li><strong>Ciudad:</strong> {roomTypeDetalle.hotel.ciudad}</li>
                  <li><strong>Dirección:</strong> {roomTypeDetalle.hotel.direccion}</li>
                  <li><strong>NIT:</strong> {roomTypeDetalle.hotel.nit}</li>
                </ul>
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button className="btn btn-primary" onClick={() => editRoomType(roomTypeDetalle)}>
                <i className="bi bi-pencil-fill me-1"></i>Editar
              </button>
              <button className="btn btn-secondary" onClick={() => setRoomTypeDetalle(null)}>
                <i className="bi bi-x-circle me-1"></i>Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomTypesView;
