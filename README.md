# 📋 Documentación del Proyecto - Hotel Management System
**Autor:** David García  
**Fecha:** 1 de julio de 2025  
**Versión:** 2.0

---

## 📖 Descripción General

Sistema de gestión hotelera que permite registrar hoteles, sus datos tributarios y asignar tipos de habitación con sus acomodaciones, cumpliendo los criterios funcionales y técnicos solicitados. 

La aplicación está dividida en un **backend** desarrollado en Laravel (PHP) y un **frontend** construido con React 18, proporcionando una API RESTful completa para la gestión integral de hoteles y sus servicios.

---

## 🔧 Requisitos Técnicos

### Stack Tecnológico
- **Backend:** PHP 7.3+ con Laravel 8.83.27+
- **Frontend:** React 18.3.1 (migrado desde Vue.js)
- **Base de datos:** PostgreSQL o MySQL
- **API:** RESTful con Laravel Sanctum
- **Navegadores soportados:** Firefox, Chrome, Edge, Safari

### Dependencias Backend (Laravel)
```json
{
  "php": "^7.3|^8.0",
  "laravel/framework": "^8.83.27",
  "laravel/sanctum": "^2.11",
  "fruitcake/laravel-cors": "^2.0",
  "guzzlehttp/guzzle": "^7.0.1"
}
```

### Dependencias Frontend (React)
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1", 
  "react-router-dom": "^6.28.0",
  "bootstrap": "^5.3.3",
  "axios": "^1.7.7",
  "sweetalert2": "11.6.12"
}
```

---

## 🚀 Instalación y Ejecución

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/davidgarciadesarrollo/hotel-management-system
cd hotel-management-system
```

### 2️⃣ Configuración de Base de Datos

#### Para PostgreSQL:
```bash
# Crear base de datos
createdb -U postgres db_hoteles

# Importar datos iniciales
psql -U postgres -d db_hoteles -f "c:\laragon\www\hotel-management-system\db\dump.sql"
```

#### Para MySQL:
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE db_hoteles;"

# Importar datos iniciales
mysql -u root -p db_hoteles < "c:\laragon\www\hotel-management-system\db\dump.sql"
```

### 3️⃣ Configuración del Backend (Laravel)

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias PHP
composer install

# Crear archivo de configuración
cp .env.example .env

# Generar clave de aplicación
php artisan key:generate

# Configurar variables de entorno en .env
# Editar las siguientes líneas:
DB_CONNECTION=pgsql  # o mysql
DB_HOST=127.0.0.1
DB_PORT=5432         # o 3306 para MySQL
DB_DATABASE=db_hoteles
DB_USERNAME=postgres # o tu usuario MySQL
DB_PASSWORD=tu_password # si no tiene contraseña dejar vacío

# Verificar configuración
php artisan config:clear
php artisan cache:clear

# Ejecutar migraciones
php artisan migrate

# (Opcional) Ejecutar seeders
php artisan db:seed

# Iniciar servidor de desarrollo
php artisan serve --port=8001
```

### 4️⃣ Configuración del Frontend (React)

```bash
# En nueva terminal, navegar al frontend
cd frontend

# Instalar dependencias base
npm install

# Instalar dependencias adicionales
npm install sweetalert2
npm install bootstrap-icons

# Configurar puerto personalizado
echo "PORT=3003" > .env

# Iniciar servidor de desarrollo
npm start
```

---

## 🌐 URLs de Acceso

| Servicio | URL | Puerto |
|----------|-----|--------|
| **Frontend (React)** | http://localhost:3003 | 3003 |
| **Backend (Laravel)** | http://localhost:8001 | 8001 |
| **API Base** | http://localhost:8001/api | 8001 |

---

## 🧪 Verificación de la Instalación

### 1. Probar Backend API
```bash
# Verificar que el backend responde
curl http://localhost:8001/api/hotels

# Debe retornar JSON con lista de hoteles
```

### 2. Probar Frontend
```bash
# Abrir navegador en:
http://localhost:3003

# Verificar que la aplicación carga correctamente
```

### 3. Verificar Conectividad
```bash
# Desde el frontend, verificar conexión a API
# Abrir DevTools (F12) > Network tab
# Realizar una acción en la app y verificar requests a localhost:8001
```

---

## 📚 Endpoints API Principales

### 🏨 Hoteles
```bash
GET    /api/hotels          # Listar todos los hoteles
POST   /api/hotels          # Crear nuevo hotel
PUT    /api/hotels/{id}     # Actualizar hotel
DELETE /api/hotels/{id}     # Eliminar hotel
```

### 🛏️ Tipos de Habitación
```bash
GET    /api/room-types      # Listar tipos de habitación
POST   /api/room-types      # Crear tipo de habitación
PUT    /api/room-types/{id} # Actualizar tipo
DELETE /api/room-types/{id} # Eliminar tipo
```

---

## 🗂️ Estructura del Proyecto

```
hotel-management-system/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/   # Controladores API
│   │   ├── Models/            # Modelos Eloquent
│   │   └── ...
│   ├── database/
│   │   ├── migrations/        # Migraciones DB
│   │   └── seeders/          # Datos iniciales
│   ├── routes/api.php         # Rutas API
│   └── README.md              # Documentación específica backend
├── frontend/                   # React App
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── views/            # Páginas/Vistas
│   │   ├── services/         # Servicios API
│   │   └── ...
│   ├── public/               # Assets estáticos
│   ├── package.json
│   └── README.md              # Documentación específica frontend
├── db/                        # Dumps de base de datos
├── .gitignore                 # Control de versiones
├── LICENSE                    # Licencia del proyecto
└── README.md                  # Documentación principal
```

---

## 🛠️ Scripts Útiles

### Backend (Laravel)
```bash
# Limpiar cache y configuraciones
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Migraciones
php artisan migrate:fresh      # Recrear tablas
php artisan migrate:fresh --seed  # Con datos iniciales

# Testing
php artisan test              # Ejecutar tests

# Optimización para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend (React)
```bash
# Desarrollo
npm start                     # Servidor desarrollo
npm test                      # Ejecutar tests
npm run build                 # Build para producción

# Linting y formato
npm run lint                  # Verificar código
npm run format               # Formatear código
```

---

## 🔧 Resolución de Problemas Comunes

### ❌ Error: "Connection refused" en API
```bash
# Verificar que Laravel esté ejecutándose
php artisan serve --port=8001

# Verificar puerto en frontend/src/services/api.js
# Debe apuntar a: http://localhost:8001
```

### ❌ Error: "CORS policy"
```bash
# Verificar configuración CORS en backend
# Archivo: config/cors.php debe permitir origen localhost:3003
```

### ❌ Error: Base de datos no conecta
```bash
# Verificar variables en .env
# Probar conexión:
php artisan tinker
# > DB::connection()->getPdo();
```

### ❌ Error: "npm ERR! peer dep missing"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 📖 Funcionalidades Principales

### 🏨 **Gestión de Hoteles**
- ✅ Crear, editar, eliminar hoteles
- ✅ Información tributaria (NIT)
- ✅ Datos de ubicación (dirección, ciudad)
- ✅ Número de habitaciones

### 🛏️ **Tipos de Habitación**
- ✅ Definir tipos de habitación
- ✅ Configurar acomodaciones
- ✅ Asignar a hoteles específicos
- ✅ Gestión de cantidades
- ✅ **NUEVO**: Validación de compatibilidad tipo-acomodación
- ✅ **NUEVO**: Reglas de negocio automáticas para combinaciones lógicas

### 💻 **Interfaz de Usuario**
- ✅ Diseño responsivo con Bootstrap 5
- ✅ Navegación intuitiva
- ✅ Alertas y confirmaciones con SweetAlert2
- ✅ Formularios dinámicos

---

## 🚀 Deployment en Producción

### Backend (Laravel)
```bash
# Optimizar para producción
composer install --no-dev --optimize-autoloader
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Variables de entorno
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
```

### Frontend (React)
```bash
# Build de producción
npm run build

# Deploy carpeta build/ a servidor web
# Ejemplo con Nginx:
cp -r build/* /var/www/html/
```

---

## 🏨 Reglas de Negocio - Acomodaciones Únicas

### 🎯 **Validación Implementada:**
**Una acomodación solo puede existir una vez por hotel, sin importar el tipo de habitación.**

#### ✅ **Casos válidos para el mismo hotel:**
- Estándar + Sencilla
- Suite + Doble  
- Premium + Triple

#### ❌ **Casos NO válidos para el mismo hotel:**
- Estándar + Sencilla
- Suite + Sencilla ← **DUPLICADO!**

### 🔧 **Implementación técnica:**
- **Base de datos**: Índice único `hotel_id + accommodation`
- **Validación**: En controllers de hoteles y tipos de habitación
- **Mensajes**: Errores claros indicando el conflicto específico

---

## 🎯 **NUEVA FUNCIONALIDAD: Validación de Compatibilidad Tipo-Acomodación**

### 📋 **Reglas de Compatibilidad Implementadas**

La aplicación ahora valida automáticamente que las acomodaciones sean lógicamente compatibles con cada tipo de habitación:

| Tipo de Habitación | Acomodaciones Permitidas |
|-------------------|-------------------------|
| **ESTÁNDAR** | SENCILLA, DOBLE |
| **JUNIOR** | TRIPLE, CUÁDRUPLE |
| **SUITE** | SENCILLA, DOBLE, TRIPLE |

### ✅ **Ejemplos de Combinaciones VÁLIDAS:**
- ✅ Habitación ESTÁNDAR con acomodación SENCILLA
- ✅ Habitación ESTÁNDAR con acomodación DOBLE
- ✅ Habitación JUNIOR con acomodación TRIPLE
- ✅ Habitación JUNIOR con acomodación CUÁDRUPLE
- ✅ Habitación SUITE con acomodación SENCILLA
- ✅ Habitación SUITE con acomodación DOBLE
- ✅ Habitación SUITE con acomodación TRIPLE

### ❌ **Ejemplos de Combinaciones NO VÁLIDAS:**
- ❌ Habitación ESTÁNDAR con acomodación TRIPLE
- ❌ Habitación ESTÁNDAR con acomodación CUÁDRUPLE
- ❌ Habitación JUNIOR con acomodación SENCILLA
- ❌ Habitación JUNIOR con acomodación DOBLE
- ❌ Habitación SUITE con acomodación CUÁDRUPLE

### 🔧 **Implementación Técnica:**

#### **Backend (Laravel)**
- **Archivo**: `backend/app/Http/Controllers/RoomTypeController.php`
- **Método**: `validateTypeAccommodationCompatibility()`
- **Validación en**: Creación y actualización de tipos de habitación
- **Respuesta**: Mensajes de error descriptivos con acomodaciones permitidas

#### **Frontend (React)**
- **Archivo**: `frontend/src/components/RoomTypeForm.js`
- **Funcionalidades**:
  - Filtrado dinámico de acomodaciones según tipo seleccionado
  - Reseteo automático de acomodación al cambiar tipo
  - Validación en tiempo real
  - Texto de ayuda contextual

#### **Interfaz de Usuario**
- **Panel de reglas**: Botón "Reglas" en la vista de tipos de habitación
- **Ayuda visual**: Cards que muestran las combinaciones permitidas
- **Validación preventiva**: Solo se muestran opciones válidas

### 💡 **Beneficios**
1. **Prevención de errores**: Evita combinaciones ilógicas
2. **Experiencia mejorada**: Interfaz intuitiva y guiada
3. **Integridad de datos**: Validación doble (frontend + backend)
4. **Mensajes claros**: Feedback específico al usuario

---

## 🌐 Deployment en Servidor

### 📋 **Requisitos del Servidor**
- **PHP**: 7.4+ con extensiones (mbstring, xml, pdo, etc.)
- **Composer**: Para dependencias PHP
- **Node.js**: 16+ con npm
- **Base de datos**: PostgreSQL o MySQL
- **Servidor web**: Apache o Nginx

### 🚀 **Pasos de Deployment**

#### Backend (Laravel)
```bash
# En servidor de producción
git clone [repository-url]
cd hotel-management-system/backend

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Configurar entorno
cp .env.example .env
# Editar .env con datos de producción

# Configurar base de datos
php artisan migrate
php artisan db:seed

# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Configurar permisos
chmod -R 755 storage bootstrap/cache
```

#### Frontend (React)
```bash
cd frontend/

# Build para producción
npm install
npm run build

# Subir carpeta build/ al servidor web
# Configurar servidor web para servir archivos estáticos
```

#### Variables de Entorno Producción
```bash
# Backend .env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
DB_CONNECTION=pgsql
DB_HOST=tu-servidor-db
DB_DATABASE=hotel_management_prod
DB_USERNAME=usuario_prod
DB_PASSWORD=password_seguro
```

---

## 📞 Soporte y Contacto

- **Desarrollador:** David García
- **Email:** davidgarciadesarrollo@email.com
- **Repositorio:** https://github.com/davidgarciadesarrollo/hotel-management-system

Para más información consulta:
- **Backend:** [README del backend](./backend/README.md)
- **Frontend:** [README del frontend](./frontend/README.md)
- **Cambios:** [CHANGELOG](./CHANGELOG.md)

---

## 📋 Checklist de Instalación

- [ ] ✅ Repositorio clonado
- [ ] ✅ Base de datos creada e importada
- [ ] ✅ Backend configurado y ejecutándose en :8001
- [ ] ✅ Frontend configurado y ejecutándose en :3003
- [ ] ✅ API responde correctamente
- [ ] ✅ Frontend conecta con backend
- [ ] ✅ Funcionalidades principales probadas

---

**¡Tu sistema de gestión hotelera está listo para usar!** 🎉

*Última actualización: 1 de julio de 2025*