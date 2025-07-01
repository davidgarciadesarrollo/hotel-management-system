import React, { useState, useEffect, useRef } from 'react';
import HotelForm from '../components/HotelForm';
import api from '../services/api';
import Swal from 'sweetalert2';

const HotelsView = () => {
  const [hoteles, setHoteles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [hotelDetalle, setHotelDetalle] = useState(null);
  const [loading, setLoading] = useState(true);
  const hotelFormRef = useRef();

  // Carga la lista de hoteles ordenada por ID descendente
  const fetchHotels = async () => {
    try {
      setLoading(true);
      const hotelesData = await api.getHotels();
      setHoteles(hotelesData.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error('Error fetching hotels:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar hoteles: ' + error.message,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setLoading(false);
    }
  };

  // Abre el formulario para editar un hotel y muestra su detalle
  const editHotel = async (hotel) => {
    setShowForm(true);
    setTimeout(() => {
      if (hotelFormRef.current) {
        hotelFormRef.current.setHotel(hotel);
      }
    }, 0);
    verDetalle(hotel);
  };

  // Abre el formulario para agregar un nuevo hotel
  const agregarHotel = () => {
    setFormKey(formKey + 1);
    setShowForm(true);
    setTimeout(() => {
      if (hotelFormRef.current) {
        hotelFormRef.current.setHotel({
          id: null,
          nombre: '',
          direccion: '',
          ciudad: '',
          nit: '',
          numero_habitaciones: 0,
          roomTypes: [],
        });
      }
    }, 0);
  };

  // Elimina un hotel tras confirmación
  const deleteHotel = async (id) => {
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
        await fetchHotels();
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
  };

  // Muestra el detalle del hotel seleccionado
  const verDetalle = (hotel) => {
    setHotelDetalle(hotel);
  };

  // Actualiza el detalle tras editar
  const actualizarDetalleHotel = async (id) => {
    await fetchHotels();
    const hotel = hoteles.find(h => h.id === id);
    if (hotel) {
      setHotelDetalle(hotel);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  return (
    <div>
      {/* Encabezado */}
      <div className="bg-primary bg-gradient py-2 mb-2">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-md-8">
              <h2 className="text-white fw-bold mb-0 text-center text-md-start">
                Lista de Hoteles
              </h2>
            </div>
            <div className="col-12 col-md-4 mt-3 mt-md-0 d-flex justify-content-center justify-content-md-end">
              <button className="btn btn-success fw-semibold" onClick={agregarHotel}>
                <i className="bi bi-plus-circle me-2"></i>
                Agregar Hotel
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulario de hotel */}
      {showForm && (
        <HotelForm
          ref={hotelFormRef}
          key={formKey}
          onClose={() => setShowForm(false)}
          onRefresh={fetchHotels}
          onActualizarDetalle={actualizarDetalleHotel}
        />
      )}

      {/* Estado de carga o contenido */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando hoteles...</p>
        </div>
      ) : (
        <div>
          {/* Tabla de hoteles */}
          <table className="table table-striped table-hover table-bordered align-middle">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Ciudad</th>
                <th>NIT</th>
                <th>Habitaciones</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {hoteles.map(hotel => (
                <tr key={hotel.id}>
                  <td>{hotel.id}</td>
                  <td>{hotel.nombre}</td>
                  <td>{hotel.direccion}</td>
                  <td>{hotel.ciudad}</td>
                  <td>{hotel.nit}</td>
                  <td>{hotel.numero_habitaciones}</td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button className="btn btn-sm btn-primary" onClick={() => editHotel(hotel)} title="Editar">
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => deleteHotel(hotel.id)} title="Eliminar">
                        <i className="bi bi-trash-fill"></i>
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => verDetalle(hotel)} title="Ver Detalle">
                        <i className="bi bi-eye-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Detalle de tipos de habitación */}
          {hotelDetalle && (
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                Detalle de Tipos de Habitación para: {hotelDetalle.nombre}
              </div>
              <div className="card-body">
                {hotelDetalle.room_types && hotelDetalle.room_types.length > 0 ? (
                  <ul className="list-group list-group-flush">
                    {hotelDetalle.room_types.map(rt => (
                      <li key={rt.id} className="list-group-item d-flex align-items-center">
                        <span className="fw-bold me-2">{rt.type}</span>
                        <span className="badge bg-secondary me-2">{rt.quantity}</span>
                        <small className="text-muted">{rt.accommodation}</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted">
                    Este hotel no tiene tipos de habitación registrados.
                  </div>
                )}
                <button className="btn btn-secondary mt-3" onClick={() => setHotelDetalle(null)}>
                  <i className="bi bi-x-circle"></i> Cerrar Detalle
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelsView;
