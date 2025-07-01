import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const RoomTypesView = () => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchRoomTypes();
  }, []);

  return (
    <div>
      {/* Encabezado mejorado con Bootstrap 5 */}
      <div className="bg-primary bg-gradient py-4 mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12">
              <h1 className="text-white fw-bold mb-0 text-center">
                <i className="bi bi-door-open-fill me-2"></i>
                Tipos de Habitación por Hotel
              </h1>
            </div>
          </div>
        </div>
      </div>

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
                    <th><i className="bi bi-tag-fill me-1"></i>Tipo</th>
                    <th><i className="bi bi-hash me-1"></i>Cantidad</th>
                    <th><i className="bi bi-people-fill me-1"></i>Acomodación</th>
                    <th><i className="bi bi-building-fill me-1"></i>Hotel</th>
                    <th><i className="bi bi-geo-alt-fill me-1"></i>Dirección</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map(rt => (
                    <tr key={rt.id}>
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
    </div>
  );
};

export default RoomTypesView;
