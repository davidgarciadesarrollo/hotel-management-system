# Hotel Management System - Frontend

Frontend desarrollado en React 18 para el sistema de gestión hotelera.

## Tecnologías

- **React 18.3.1** - Librería de interfaz de usuario
- **React Router 6.28.0** - Enrutamiento SPA
- **Bootstrap 5.3.3** - Framework CSS
- **Bootstrap Icons 1.13.1** - Iconografía
- **Axios 1.7.7** - Cliente HTTP para API
- **SweetAlert2 11.6.12** - Alertas y modales

## Requisitos Previos

- Node.js 16+ y npm
- Backend Laravel corriendo en puerto 8001

## Instalación

1. Navega al directorio del frontend:
   ```bash
   cd hotel-management-system/frontend
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Crea archivo `.env` para configuración:
   ```bash
   echo "PORT=3003" > .env
   ```

## Ejecución

### Modo Desarrollo
```bash
npm start
```
Accede a la aplicación en `http://localhost:3003`

### Modo Producción
```bash
npm run build
npm install -g serve
serve -s build
```

## Estructura del Proyecto

```
frontend/
├── public/
│   └── index.html                     # HTML base
├── src/
│   ├── components/
│   │   ├── Navbar.js                  # Navegación principal
│   │   └── HotelForm.js              # Formulario de hoteles
│   ├── views/
│   │   ├── HotelsView.js             # Lista de hoteles
│   │   └── RoomTypesView.js          # Lista de tipos de habitación
│   ├── services/
│   │   └── api.js                    # Cliente API para backend
│   ├── App.js                        # Componente principal
│   ├── App.css                       # Estilos globales
│   └── index.js                      # Punto de entrada
├── package.json                      # Dependencias y scripts
└── .env                             # Variables de entorno
```

## Funcionalidades

### Gestión de Hoteles
- ✅ Listar todos los hoteles
- ✅ Crear nuevos hoteles
- ✅ Editar hoteles existentes
- ✅ Eliminar hoteles
- ✅ Ver detalles de tipos de habitación

### Gestión de Tipos de Habitación
- ✅ Listar tipos de habitación por hotel
- ✅ Ver información completa (tipo, cantidad, acomodación)
- ✅ Datos relacionados con hoteles

### Características Técnicas
- ✅ Diseño responsive con Bootstrap 5
- ✅ Navegación SPA con React Router
- ✅ Manejo de estado con React Hooks
- ✅ Alertas elegantes con SweetAlert2
- ✅ Indicadores de carga
- ✅ Manejo de errores

## API Endpoints Utilizados

- `GET /api/hotels` - Obtener hoteles
- `POST /api/hotels` - Crear hotel
- `PUT /api/hotels/{id}` - Actualizar hotel
- `DELETE /api/hotels/{id}` - Eliminar hotel
- `GET /api/room-types` - Obtener tipos de habitación

## Configuración de Desarrollo

### Variables de Entorno (.env)
```env
PORT=3003
REACT_APP_API_URL=http://localhost:8001
```

### Scripts Disponibles
```json
{
  "start": "Servidor de desarrollo",
  "build": "Build para producción", 
  "test": "Ejecutar tests",
  "eject": "Exponer configuración webpack"
}
```

## Componentes Principales

### App.js
- Componente raíz
- Configuración de rutas
- Layout general

### HotelsView.js  
- Lista de hoteles
- CRUD completo
- Paginación y filtros

### RoomTypesView.js
- Vista de tipos de habitación
- Información detallada
- Relación con hoteles

### HotelForm.js
- Formulario para crear/editar
- Validaciones en tiempo real
- Manejo de tipos de habitación

## Estilos y UI

- **Bootstrap 5**: Grid system, componentes
- **Bootstrap Icons**: Iconografía consistente
- **CSS Custom**: Estilos específicos
- **Responsive Design**: Mobile-first approach

## Testing

```bash
npm test
```

## Build y Deployment

```bash
npm run build
```

Genera carpeta `build/` con archivos optimizados:
- JavaScript minificado y comprimido
- CSS optimizado  
- Assets con hash para cache-busting
- HTML con referencias actualizadas

## Contribuciones

Si deseas contribuir al proyecto, por favor sigue las pautas de contribución y asegúrate de realizar pruebas antes de enviar un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.