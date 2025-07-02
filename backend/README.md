# 🏨 Backend - Sistema de Gestión Hotelera

**Framework:** Laravel 8.83.27+  
**PHP:** 7.3+ / 8.0+  
**Base de datos:** PostgreSQL / MySQL  
**Versión:** 2.1

---

## 📋 Descripción

Backend desarrollado en Laravel que proporciona una API RESTful completa para la gestión de hoteles y tipos de habitación. Incluye validaciones avanzadas de reglas de negocio y compatibilidad tipo-acomodación.

---

## 🚀 Características Principales

### 🏨 **Gestión de Hoteles**
- CRUD completo de hoteles
- Validación de datos tributarios (NIT)
- Gestión de ubicación (ciudad, dirección)
- Control de número de habitaciones

### 🛏️ **Gestión de Tipos de Habitación**
- CRUD completo de tipos de habitación
- **NUEVA**: Validación automática de compatibilidad tipo-acomodación
- Validación de acomodaciones únicas por hotel
- Mensajes de error descriptivos y orientados a la solución

### 🎯 **Validaciones de Negocio**

#### **Reglas de Compatibilidad Tipo-Acomodación**
| Tipo de Habitación | Acomodaciones Permitidas |
|-------------------|-------------------------|
| **ESTÁNDAR** | Sencilla	, Doble |
| **JUNIOR** | Triple, Cuádruple |
| **SUITE** | Sencilla	, Doble, Triple |

#### **Reglas de Unicidad**
- Una acomodación solo puede existir una vez por hotel
- Validación automática en creación y actualización

#### **Validación de Capacidad (NUEVA en v2.1.1)**
- La suma de cantidades de tipos de habitación no puede exceder el total del hotel
- Validación en tiempo real con información visual de capacidad
- Mensajes descriptivos con habitaciones disponibles

---

## 🔧 Arquitectura y Estructura

### **Controladores Principales**

#### `app/Http/Controllers/HotelController.php`
- Gestión CRUD de hoteles
- Validación de datos tributarios
- Manejo de relaciones con tipos de habitación

#### `app/Http/Controllers/RoomTypeController.php`
- Gestión CRUD de tipos de habitación
- **NUEVO**: Método `validateTypeAccommodationCompatibility()`
- Validación de acomodaciones únicas
- Manejo avanzado de errores

### **Modelos**

#### `app/Models/Hotel.php`
```php
class Hotel extends Model
{
    protected $fillable = [
        'nombre', 'direccion', 'ciudad', 
        'nit', 'numero_habitaciones'
    ];
    
    public function roomTypes()
    {
        return $this->hasMany(RoomType::class);
    }
}
```

#### `app/Models/RoomType.php`
```php
class RoomType extends Model
{
    protected $fillable = [
        'type', 'quantity', 'accommodation', 'hotel_id'
    ];
    
    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }
}
```

---

## 🛠️ Instalación y Configuración

### **1. Dependencias**
```bash
composer install
```

### **2. Configuración de Entorno**
```bash
cp .env.example .env
php artisan key:generate
```

### **3. Variables de Entorno (.env)**
```env
# Base de datos
DB_CONNECTION=pgsql  # o mysql
DB_HOST=127.0.0.1
DB_PORT=5432         # o 3306 para MySQL
DB_DATABASE=db_hoteles
DB_USERNAME=postgres
DB_PASSWORD=tu_password

# Aplicación
APP_NAME="Hotel Management System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8001

# CORS (para frontend React)
CORS_ALLOWED_ORIGINS="http://localhost:3003"
```

### **4. Base de Datos**
```bash
# Ejecutar migraciones
php artisan migrate

# (Opcional) Cargar datos de prueba
php artisan db:seed
```

### **5. Iniciar Servidor**
```bash
php artisan serve --port=8001
```

---

## 📡 API Endpoints

### **Hoteles**
```http
GET    /api/hotels          # Listar hoteles
POST   /api/hotels          # Crear hotel
PUT    /api/hotels/{id}     # Actualizar hotel
DELETE /api/hotels/{id}     # Eliminar hotel
```

### **Tipos de Habitación**
```http
GET    /api/room-types      # Listar tipos
POST   /api/room-types      # Crear tipo (con validación de compatibilidad)
PUT    /api/room-types/{id} # Actualizar tipo (con validación)
DELETE /api/room-types/{id} # Eliminar tipo
```

---

## 🧪 Validaciones Implementadas

### **Validación de Compatibilidad (NUEVA en v2.1)**

```php
/**
 * Validar compatibilidad entre tipo de habitación y acomodación
 */
private function validateTypeAccommodationCompatibility($type, $accommodation)
{
    $compatibilityRules = [
        'ESTÁNDAR' => ['Sencilla	', 'Doble'],
        'JUNIOR' => ['Triple', 'Cuádruple'],
        'SUITE' => ['Sencilla	', 'Doble', 'Triple']
    ];

    if (!in_array($accommodation, $compatibilityRules[$type])) {
        throw ValidationException::withMessages([
            'accommodation' => [
                "🚫 INCOMPATIBILIDAD: La acomodación '{$accommodation}' no es compatible..."
            ]
        ]);
    }
}
```

### **Casos de Uso**

#### ✅ **Válidos**
```bash
# Estándar con Doble
POST /api/room-types
{
  "type": "ESTÁNDAR",
  "accommodation": "Doble",
  "hotel_id": 1,
  "quantity": 5
}

# Junior con Triple
POST /api/room-types
{
  "type": "JUNIOR", 
  "accommodation": "Triple",
  "hotel_id": 1,
  "quantity": 2
}
```

#### ❌ **Inválidos**
```bash
# Junior con Sencilla	 (incompatible)
POST /api/room-types
{
  "type": "JUNIOR",
  "accommodation": "Sencilla	",  # ❌ Error 422
  "hotel_id": 1,
  "quantity": 3
}

# Capacidad excedida (hotel con 15 hab, ya tiene 12 asignadas)
POST /api/room-types
{
  "type": "SUITE",
  "accommodation": "Doble",
  "hotel_id": 1,
  "quantity": 5  # ❌ Error 422 - Solo disponibles 3
}
```

---

## 🔧 Configuración CORS

Para permitir requests desde el frontend React:

**Archivo:** `config/cors.php`
```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3003'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

---

## 🧪 Testing

### **Ejecutar Tests**
```bash
php artisan test
```

### **Tests de Validación de Compatibilidad**
```bash
# Test específico para validaciones
php artisan test --filter RoomTypeCompatibilityTest
```

---

## 📝 Logs y Debugging

### **Logs de Aplicación**
```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log
```

### **Debug de Queries**
```php
// En cualquier controlador
DB::enableQueryLog();
// ... tu código ...
dd(DB::getQueryLog());
```

---

## 🚀 Despliegue en Producción

### **Optimizaciones**
```bash
# Cache de configuración
php artisan config:cache

# Cache de rutas
php artisan route:cache

# Cache de vistas
php artisan view:cache

# Optimización de autoloader
composer install --optimize-autoloader --no-dev
```

### **Variables de Producción**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com

# Base de datos de producción
DB_CONNECTION=pgsql
DB_HOST=tu-servidor-db
DB_DATABASE=hotel_management_prod
```

---

## 📚 Documentación Adicional

- **README principal**: `../README.md`
- **Frontend**: `../frontend/README.md`
- **Changelog**: `../CHANGELOG.md`

---

## 🔧 Mantenimiento

### **Comandos Útiles**
```bash
# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Recrear base de datos
php artisan migrate:fresh --seed

# Verificar configuración
php artisan config:show database
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

**Backend actualizado:** 1 de julio de 2025  
**Versión Laravel:** 8.83.27+  
**Próxima versión:** 2.2 (Sistema de reservas)

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
