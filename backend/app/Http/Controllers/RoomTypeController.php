<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Controlador para la gestión de tipos de habitación
 * 
 * Este controlador maneja las operaciones de consulta y actualización 
 * de tipos de habitación con validaciones de compatibilidad.
 * 
 * Funcionalidades principales:
 * - Consulta de tipos de habitación (READ)
 * - Actualización de tipos de habitación (UPDATE) - solo tipo y acomodación
 * - Validación de compatibilidad tipo-acomodación
 * - Manejo de errores descriptivos
 * 
 * NOTA: Las operaciones CREATE y DELETE han sido deshabilitadas por 
 * política empresarial para mantener integridad de datos.
 * 
 * @author Sistema de Gestión Hotelera
 * @version 2.2
 * @since 1.0
 */
class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::with('hotel')
                           ->join('hotels', 'room_types.hotel_id', '=', 'hotels.id')
                           ->orderBy('hotels.nombre', 'asc')
                           ->select('room_types.*')
                           ->get();
        
        // Normalizar los tipos antes de enviar al frontend
        foreach ($roomTypes as $roomType) {
            $roomType->type = $this->normalizeType($roomType->type);
        }
        
        return response()->json($roomTypes->load('hotel'));
    }

    /**
     * NOTA: La funcionalidad de crear tipos de habitación ha sido deshabilitada
     * por requerimientos de negocio. Los tipos de habitación deben ser gestionados
     * únicamente por administradores del sistema.
     * 
     * @deprecated Esta funcionalidad ha sido deshabilitada
     */
    public function store(Request $request)
    {
        return response()->json([
            'message' => 'La creación de nuevos tipos de habitación no está permitida por política de la empresa.'
        ], 403);
    }

    /**
     * Mostrar un tipo de habitación específico
     */
    public function show($id)
    {
        $roomType = RoomType::with('hotel')->findOrFail($id);
        
        // Normalizar el tipo antes de enviar al frontend
        $roomType->type = $this->normalizeType($roomType->type);
        
        return response()->json($roomType);
    }

    /**
     * Actualizar un tipo de habitación
     */
    public function update(Request $request, $id)
    {
        $roomType = RoomType::findOrFail($id);

        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'type' => 'required|string|max:255',
            'accommodation' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
        ]);

        // Validar que la cantidad no haya cambiado (solo lectura en edición)
        if ($request->quantity != $roomType->quantity) {
            return response()->json([
                'message' => "🚫 CANTIDAD NO EDITABLE: La cantidad de habitaciones no puede modificarse al editar un tipo de habitación existente. La cantidad actual es {$roomType->quantity} y debe mantenerse igual.",
                'errors' => [
                    'quantity' => [
                        "🚫 CANTIDAD NO EDITABLE: La cantidad de habitaciones no puede modificarse al editar un tipo de habitación existente. La cantidad actual es {$roomType->quantity} y debe mantenerse igual."
                    ]
                ]
            ], 422);
        }

        // Validar compatibilidad tipo-acomodación
        $this->validateTypeAccommodationCompatibility($request->type, $request->accommodation);

        // Verificar que no exista ya esta acomodación para el mismo hotel
        // (excluyendo el registro actual)
        $existingRoomType = RoomType::where('hotel_id', $request->hotel_id)
                                  ->where('accommodation', $request->accommodation)
                                  ->where('id', '!=', $id)
                                  ->first();

        if ($existingRoomType) {
            $hotel = Hotel::find($request->hotel_id);
            $accommodationTranslations = [
                'SENCILLA' => 'Sencilla (1 persona)',
                'DOBLE' => 'Doble (2 personas)',
                'TRIPLE' => 'Triple (3 personas)',
                'CUÁDRUPLE' => 'Cuádruple (4 personas)'
            ];
            
            $accommodationName = $accommodationTranslations[$request->accommodation] ?? $request->accommodation;
            $existingAccommodationName = $accommodationTranslations[$existingRoomType->accommodation] ?? $existingRoomType->accommodation;
            
            return response()->json([
                'message' => "🚫 ACOMODACIÓN DUPLICADA EN HOTEL\n\n" .
                           "La acomodación '{$accommodationName}' ya está registrada en el hotel '{$hotel->nombre}' " .
                           "como parte del tipo de habitación '{$existingRoomType->type}'.\n\n" .
                           "🏨 REGLA DE NEGOCIO: Cada tipo de acomodación puede existir solo UNA VEZ por hotel, " .
                           "independientemente del tipo de habitación.\n\n" .
                           "💡 SOLUCIÓN: Seleccione una acomodación diferente que no esté ya registrada en este hotel.",
                'errors' => [
                    'accommodation' => [
                        "La acomodación '{$accommodationName}' ya existe en el hotel '{$hotel->nombre}'. " .
                        "Cada acomodación solo puede registrarse una vez por hotel. " .
                        "Seleccione una acomodación diferente."
                    ],
                    'hotel_id' => [
                        "El hotel '{$hotel->nombre}' ya tiene registrada la acomodación '{$existingAccommodationName}' " .
                        "en el tipo de habitación '{$existingRoomType->type}'."
                    ]
                ]
            ], 422);
        }

        $roomType->update($request->all());
        
        // Normalizar el tipo antes de devolver la respuesta
        $roomType->type = $this->normalizeType($roomType->type);
        
        return response()->json($roomType->load('hotel'));
    }

    /**
     * NOTA: La funcionalidad de eliminar tipos de habitación ha sido deshabilitada
     * por requerimientos de negocio. Los tipos de habitación no deben eliminarse
     * una vez creados para mantener la integridad de los datos históricos.
     * 
     * @deprecated Esta funcionalidad ha sido deshabilitada
     */
    public function destroy($id)
    {
        return response()->json([
            'message' => 'La eliminación de tipos de habitación no está permitida por política de la empresa.'
        ], 403);
    }

    /**
     * Validar compatibilidad entre tipo de habitación y acomodación
     * 
     * Este método implementa las reglas de negocio para garantizar que
     * las acomodaciones sean lógicamente compatibles con los tipos de habitación.
     * 
     * Reglas implementadas:
     * - ESTÁNDAR: Solo permite SENCILLA y DOBLE (habitaciones básicas 1-2 personas)
     * - JUNIOR: Permite TRIPLE y CUÁDRUPLE (habitaciones intermedias 3-4 personas)  
     * - SUITE: Permite SENCILLA, DOBLE y TRIPLE (habitaciones premium 1-3 personas)
     * 
     * @param string $type Tipo de habitación (ESTÁNDAR, JUNIOR, SUITE)
     * @param string $accommodation Acomodación (SENCILLA, DOBLE, TRIPLE, CUÁDRUPLE)
     * 
     * @throws ValidationException Si el tipo no existe o la combinación no es válida
     * 
     * @example
     * // Caso válido
     * $this->validateTypeAccommodationCompatibility('SUITE', 'TRIPLE'); // ✅ Pasa
     * 
     * // Caso inválido  
     * $this->validateTypeAccommodationCompatibility('ESTÁNDAR', 'CUÁDRUPLE'); // ❌ Falla
     * 
     * @since 2.1
     */
    private function validateTypeAccommodationCompatibility($type, $accommodation)
    {
        // Normalizar el tipo para manejar problemas de codificación
        $normalizedType = $this->normalizeType($type);
        
        // Definir reglas de compatibilidad
        $compatibilityRules = [
            'ESTÁNDAR' => ['SENCILLA', 'DOBLE'],
            'ESTANDAR' => ['SENCILLA', 'DOBLE'],
            'EST\\u00c1NDAR' => ['SENCILLA', 'DOBLE'],
            'EST\u00c1NDAR' => ['SENCILLA', 'DOBLE'],
            'JUNIOR' => ['TRIPLE', 'CUÁDRUPLE'],
            'SUITE' => ['SENCILLA', 'DOBLE', 'TRIPLE']
        ];

        // Verificar si el tipo existe en las reglas
        if (!array_key_exists($normalizedType, $compatibilityRules)) {
            return response()->json([
                'message' => "❌ TIPO NO VÁLIDO: El tipo de habitación '{$type}' (normalizado: '{$normalizedType}') no es válido. Los tipos válidos son: ESTÁNDAR, JUNIOR, SUITE.",
                'errors' => [
                    'type' => [
                        "❌ TIPO NO VÁLIDO: El tipo de habitación '{$type}' no es válido. Los tipos válidos son: ESTÁNDAR, JUNIOR, SUITE."
                    ]
                ]
            ], 422);
        }

        // Verificar si la acomodación es compatible con el tipo
        if (!in_array($accommodation, $compatibilityRules[$normalizedType])) {
            $allowedAccommodations = implode(', ', $compatibilityRules[$normalizedType]);
            return response()->json([
                'message' => "🚫 INCOMPATIBILIDAD: La acomodación '{$accommodation}' no es compatible con el tipo de habitación '{$normalizedType}'. Las acomodaciones permitidas para '{$normalizedType}' son: {$allowedAccommodations}.",
                'errors' => [
                    'accommodation' => [
                        "🚫 INCOMPATIBILIDAD: La acomodación '{$accommodation}' no es compatible con el tipo de habitación '{$normalizedType}'. Las acomodaciones permitidas para '{$normalizedType}' son: {$allowedAccommodations}."
                    ]
                ]
            ], 422);
        }
    }

    /**
     * Validar que la cantidad total de habitaciones no exceda el límite del hotel
     * 
     * Este método verifica que la suma de todas las cantidades de tipos de habitación
     * no supere el número total de habitaciones definido en el hotel.
     * 
     * @param int $hotelId ID del hotel
     * @param int $newQuantity Nueva cantidad que se quiere asignar
     * @param int|null $excludeRoomTypeId ID del tipo de habitación a excluir (para updates)
     * 
     * @throws ValidationException Si la cantidad total excede el límite del hotel
     * 
     * @example
     * // Hotel con 15 habitaciones, actualmente tiene 10 asignadas
     * $this->validateTotalRoomQuantity(1, 6); // ❌ Falla (10 + 6 = 16 > 15)
     * $this->validateTotalRoomQuantity(1, 5); // ✅ Pasa (10 + 5 = 15)
     * 
     * @since 2.1.1
     */
    private function validateTotalRoomQuantity($hotelId, $newQuantity, $excludeRoomTypeId = null)
    {
        $hotel = Hotel::findOrFail($hotelId);
        
        // Calcular cantidad total actual de habitaciones (excluyendo el registro actual si es update)
        $currentTotalQuery = RoomType::where('hotel_id', $hotelId);
        
        if ($excludeRoomTypeId) {
            $currentTotalQuery->where('id', '!=', $excludeRoomTypeId);
        }
        
        $currentTotal = $currentTotalQuery->sum('quantity');
        $newTotal = $currentTotal + $newQuantity;
        
        if ($newTotal > $hotel->numero_habitaciones) {
            $available = $hotel->numero_habitaciones - $currentTotal;
            throw ValidationException::withMessages([
                'quantity' => [
                    "🚫 CAPACIDAD EXCEDIDA: El hotel '{$hotel->nombre}' tiene un total de {$hotel->numero_habitaciones} habitaciones. " .
                    "Actualmente hay {$currentTotal} habitaciones asignadas. " .
                    "La cantidad máxima disponible para asignar es: {$available} habitaciones. " .
                    "No se pueden asignar {$newQuantity} habitaciones adicionales."
                ]
            ]);
        }
    }

    /**
     * Normaliza el tipo de habitación para manejar problemas de codificación
     * 
     * @param string $type Tipo de habitación
     * @return string Tipo normalizado
     */
    private function normalizeType($type)
    {
        if (!$type) return $type;
        
        // Manejar diferentes codificaciones de caracteres especiales
        $normalizedType = $type;
        
        // Lista de todas las variantes posibles de ESTÁNDAR
        $standardVariants = [
            'EST\\u00c1NDAR', 
            'EST\u00c1NDAR', 
            'EST\u00C1NDAR',
            'EST\\u00C1NDAR'
        ];
        
        // Reemplazar cualquier variante de ESTÁNDAR
        $normalizedType = str_replace($standardVariants, 'ESTÁNDAR', $normalizedType);
        
        // También manejar si viene con entidades HTML
        $normalizedType = html_entity_decode($normalizedType, ENT_QUOTES, 'UTF-8');
        
        // Si aún contiene EST seguido de caracteres raros, convertir a ESTÁNDAR
        if (preg_match('/EST.*NDAR/i', $normalizedType) && $normalizedType !== 'ESTÁNDAR') {
            $normalizedType = 'ESTÁNDAR';
        }
        
        return $normalizedType;
    }
}
