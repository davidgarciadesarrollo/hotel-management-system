# Hotel Management System

Este proyecto es un sistema de gestión de hoteles que permite a los gerentes de operaciones hoteleras administrar la información de los hoteles, tipos de habitaciones y acomodaciones. La aplicación está dividida en un backend desarrollado en PHP y un frontend construido con Vue.js.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

- **backend/**: Contiene la lógica del servidor, incluyendo controladores, modelos, rutas y servicios.
- **frontend/**: Contiene la interfaz de usuario, construida con Vue.js.
- **docs/**: Incluye documentación adicional, como diagramas UML y pasos de despliegue.
- **db/**: Contiene un volcado de la base de datos para facilitar la instalación.

## Requisitos

- PHP 7.4 o superior
- Composer
- Node.js y npm
- PostgreSQL

## Instalación

### Backend

1. Navega a la carpeta `backend/`.
2. Ejecuta `composer install` para instalar las dependencias del backend.
3. Copia el archivo `.env.example` a `.env` y configura las variables de entorno, especialmente las de la base de datos.
4. Ejecuta las migraciones con el comando `php artisan migrate` para crear las tablas necesarias en la base de datos.
5. (Opcional) Ejecuta el seeder con `php artisan db:seed` para poblar la base de datos con datos iniciales.

### Frontend

1. Navega a la carpeta `frontend/`.
2. Ejecuta `npm install` para instalar las dependencias del frontend.
3. Ejecuta `npm run serve` para iniciar la aplicación en modo de desarrollo.

## Despliegue

Para desplegar la aplicación en la nube, sigue las instrucciones en el archivo `docs/deployment_steps.md`.

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request si deseas contribuir al proyecto.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

## Contacto

Para más información, puedes contactar al equipo de desarrollo a través del correo electrónico proporcionado en la documentación del proyecto.