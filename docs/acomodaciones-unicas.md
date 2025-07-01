# 🏨 Validación de Acomodaciones Únicas por Hotel

## 📋 **Implementación Opción A: Acomodaciones Únicas**

### 🎯 **Regla implementada:**
**Una acomodación solo puede existir una vez por hotel, sin importar el tipo de habitación.**

### ✅ **Casos válidos para el mismo hotel:**
```json
[
  {
    "type": "Estándar",
    "accommodation": "Sencilla",     // ← Única
    "quantity": 10
  },
  {
    "type": "Suite", 
    "accommodation": "Doble",        // ← Diferente acomodación
    "quantity": 5
  },
  {
    "type": "Premium",
    "accommodation": "Triple",       // ← Diferente acomodación
    "quantity": 3
  }
]
```

### ❌ **Casos NO válidos para el mismo hotel:**
```json
[
  {
    "type": "Estándar",
    "accommodation": "Sencilla",     // ← Primera vez
    "quantity": 10
  },
  {
    "type": "Suite",
    "accommodation": "Sencilla",     // ← ❌ DUPLICADO!
    "quantity": 5
  }
]
```

## 🔧 **Implementación técnica:**

### 1. **Base de datos:**
- Índice único: `hotel_id + accommodation`
- Migración: `add_unique_accommodation_constraint_to_room_types_table.php`

### 2. **Validación en aplicación:**
- `HotelController`: Validación al crear/actualizar hoteles
- `RoomTypeController`: Validación al crear/actualizar tipos individuales

### 3. **Mensajes de error mejorados:**

#### **En creación de hotel:**
```
❌ No se puede repetir la acomodación 'Sencilla'. 
Ya está asignada al tipo 'Estándar' en este hotel. 
Cada acomodación debe ser única por hotel.
```

#### **En API individual de tipos:**
```
❌ La acomodación 'Sencilla' ya existe en el hotel 'Hotel Plaza' 
para el tipo 'Estándar'. Cada acomodación debe ser única por hotel.
```

## 🧹 **Limpieza de datos existentes:**

### Comando para limpiar duplicados:
```bash
php artisan rooms:clean-duplicates
```

### Ejemplo de salida:
```
🔍 Buscando acomodaciones duplicadas...
Duplicados encontrados:
Hotel ID: 3, Acomodación: Triple, Cantidad: 2

¿Deseas proceder con la limpieza? (yes/no):
> yes

🧹 Iniciando limpieza de datos duplicados...
✅ Conservando: Hotel 3, Tipo: JUNIOR, Acomodación: Triple
🗑️  Eliminando: Hotel 3, Tipo: SUITE, Acomodación: Triple

🎉 Limpieza completada exitosamente!
📊 Se eliminaron 1 registros duplicados.
🚀 Ahora puedes ejecutar la migración con: php artisan migrate
```

## 🚀 **Pasos para activar la validación:**

1. **Limpiar datos duplicados:**
   ```bash
   php artisan rooms:clean-duplicates
   ```

2. **Ejecutar migración:**
   ```bash
   php artisan migrate
   ```

3. **Probar la validación:**
   ```bash
   # Caso que debe fallar:
   curl -X POST http://127.0.0.1:8000/api/hotels \
     -H "Content-Type: application/json" \
     -H "Accept: application/json" \
     -d '{
       "nombre": "Hotel Test",
       "room_types": [
         {"type": "Estándar", "accommodation": "Sencilla", "quantity": 10},
         {"type": "Suite", "accommodation": "Sencilla", "quantity": 5}
       ]
     }'
   ```

## 📊 **Endpoints afectados:**

- `POST /api/hotels` - Validación en creación
- `PUT /api/hotels/{id}` - Validación en actualización  
- `POST /api/room-types` - Validación individual
- `PUT /api/room-types/{id}` - Validación individual

## 🎯 **Beneficios de esta implementación:**

- ✅ **Integridad garantizada** a nivel de base de datos
- ✅ **Mensajes claros** que indican exactamente el conflicto
- ✅ **Validación preventiva** antes de llegar a la BD
- ✅ **Herramientas de limpieza** para datos existentes
- ✅ **API completa** para gestión individual y masiva
