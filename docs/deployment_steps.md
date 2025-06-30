# Pasos para Desplegar la Aplicación Hotel Management System

Este documento proporciona instrucciones paso a paso para desplegar la aplicación Hotel Management System en un entorno de producción. Asegúrate de seguir cada paso cuidadosamente.

## Requisitos Previos

1. **Servidor en la Nube**: Necesitas un servidor en la nube (por ejemplo, AWS, DigitalOcean, Heroku) con acceso SSH.
2. **Instalación de PHP**: Asegúrate de que PHP esté instalado en el servidor (versión 7.4 o superior).
3. **Instalación de Composer**: Composer debe estar instalado para gestionar las dependencias de PHP.
4. **Instalación de PostgreSQL**: Asegúrate de que PostgreSQL esté instalado y en funcionamiento.
5. **Node.js y npm**: Necesitas Node.js y npm instalados para el frontend.

## Pasos para Desplegar el Backend

1. **Clonar el Repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd hotel-management-system/backend
   ```

2. **Instalar Dependencias**:
   ```bash
   composer install
   ```

3. **Configurar Variables de Entorno**:
   - Copia el archivo de ejemplo de variables de entorno:
     ```bash
     cp .env.example .env
     ```
   - Edita el archivo `.env` y configura los parámetros de conexión a la base de datos PostgreSQL.

4. **Crear la Base de Datos**:
   - Accede a PostgreSQL y crea la base de datos:
     ```sql
     CREATE DATABASE hotel_management;
     ```

5. **Ejecutar Migraciones**:
   ```bash
   php artisan migrate
   ```

6. **Sembrar Datos Iniciales** (opcional):
   ```bash
   php artisan db:seed --class=HotelSeeder
   ```

7. **Iniciar el Servidor**:
   ```bash
   php -S localhost:8000 -t public
   ```

## Pasos para Desplegar el Frontend

1. **Navegar al Directorio del Frontend**:
   ```bash
   cd ../frontend
   ```

2. **Instalar Dependencias**:
   ```bash
   npm install
   ```

3. **Construir la Aplicación**:
   ```bash
   npm run build
   ```

4. **Configurar el Servidor Web**:
   - Asegúrate de que el servidor web (por ejemplo, Nginx o Apache) esté configurado para servir los archivos estáticos desde el directorio `dist` generado.

5. **Iniciar el Servidor** (si es necesario):
   - Dependiendo de tu configuración, puede que necesites iniciar un servidor para el frontend.

## Acceso a la Aplicación

Una vez que hayas completado todos los pasos anteriores, podrás acceder a la aplicación a través de la URL de tu servidor en la nube.

## Notas Finales

- Asegúrate de revisar los logs del servidor para solucionar cualquier problema que pueda surgir durante el despliegue.
- Considera implementar un sistema de control de versiones para gestionar cambios futuros en el código.

¡Buena suerte con tu despliegue!