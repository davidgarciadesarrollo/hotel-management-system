<?php
// Controlador de hoteles para la API RESTful.
// Permite listar, crear, actualizar y eliminar hoteles.

namespace App\Http\Controllers;

use App\Models\Hotel;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    // Lista todos los hoteles con sus tipos de habitación
    public function index()
    {
        $hoteles = Hotel::with('roomTypes')->get();
        return response()->json($hoteles);
    }

    // Muestra un hotel específico
    public function show($id)
    {
        $hotel = Hotel::with('roomTypes')->findOrFail($id);
        return response()->json($hotel);
    }

    // Crea un nuevo hotel
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required',
            'direccion' => 'required',
            'ciudad' => 'required',
            'nit' => 'required|unique:hotels,nit',
            'numero_habitaciones' => 'required|integer',
            'room_types' => 'array',
            'room_types.*.type' => 'required|string',
            'room_types.*.accommodation' => 'required|string',
            'room_types.*.quantity' => 'required|integer|min:1',
        ]);

        // Validar que no haya acomodaciones repetidas para el mismo hotel
        if ($request->has('room_types')) {
            $this->validateUniqueAccommodations($request->room_types);
            $this->validateTotalRooms($request->room_types, $request->numero_habitaciones);
        }

        $hotel = Hotel::create($request->all());

        // Guardar los tipos de habitación
        if ($request->has('room_types')) {
            foreach ($request->room_types as $rt) {
                $hotel->roomTypes()->create($rt);
            }
        }

        return response()->json($hotel->load('roomTypes'), 201);
    }

    // Actualiza un hotel existente
    public function update(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);
        $request->validate([
            'direccion' => 'required',
            'ciudad' => 'required',
            'nit' => 'required|unique:hotels,nit,' . $hotel->id, // Permite el mismo NIT del hotel actual
            'numero_habitaciones' => 'required|integer',
            'room_types' => 'array',
            'room_types.*.type' => 'required|string',
            'room_types.*.accommodation' => 'required|string',
            'room_types.*.quantity' => 'required|integer|min:1',
        ]);

        // Validar que no haya acomodaciones repetidas para el mismo hotel
        if ($request->has('room_types')) {
            $this->validateUniqueAccommodations($request->room_types, $hotel->id);
            $this->validateTotalRooms($request->room_types, $request->numero_habitaciones);
        }

        $hotel->update($request->all());

        // Actualizar los tipos de habitación
        if ($request->has('room_types')) { // <-- usa snake_case aquí también
            $hotel->roomTypes()->delete();
            foreach ($request->room_types as $rt) {
                $hotel->roomTypes()->create($rt);
            }
        }

        return response()->json($hotel->load('roomTypes'));
    }

    // Elimina un hotel
    public function destroy($id)
    {
        $hotel = Hotel::findOrFail($id);
        $hotel->delete();
        return response()->json(null, 204);
    }

    /**
     * Valida que no existan acomodaciones repetidas para el mismo hotel
     * Una acomodación solo puede existir una vez por hotel, sin importar el tipo
     */
    private function validateUniqueAccommodations($roomTypes, $hotelId = null)
    {
        $accommodations = [];
        $accommodationTypes = []; // Para mostrar qué tipos ya tienen esa acomodación
        
        // NOTA: Al editar un hotel, no validamos contra la BD porque vamos a 
        // reemplazar todos los room_types existentes. Solo validamos que en 
        // la misma petición no haya acomodaciones duplicadas.
        
        foreach ($roomTypes as $index => $roomType) {
            $accommodation = $roomType['accommodation'];
            $type = $roomType['type'];
            
            // Verificar contra acomodaciones en la misma petición
            if (in_array($accommodation, $accommodations)) {
                // Encontrar en qué tipo ya estaba asignada esta acomodación
                $previousIndex = array_search($accommodation, $accommodations);
                $previousType = $accommodationTypes[$previousIndex];
                
                $validator = validator([], []);
                $validator->errors()->add(
                    "room_types.{$index}.accommodation",
                    "La acomodación <strong>'{$accommodation}'</strong> está repetida en esta solicitud. Ya está asignada al tipo <strong>'{$previousType}'</strong> en la posición " . ($previousIndex + 1) . ". Cada acomodación debe ser única por hotel."
                );
                throw new \Illuminate\Validation\ValidationException($validator);
            }
            
            $accommodations[] = $accommodation;
            $accommodationTypes[] = $type;
        }
    }

    /**
     * Valida que la suma de habitaciones por tipo sea exactamente igual al total del hotel
     */
    private function validateTotalRooms($roomTypes, $totalRooms)
    {
        $sumByType = 0;
        foreach ($roomTypes as $roomType) {
            $sumByType += (int) $roomType['quantity'];
        }
        
        if ($sumByType !== (int) $totalRooms) {
            $validator = validator([], []);
            $validator->errors()->add(
                'numero_habitaciones',
                "Las cantidades no cuadran: tienes {$sumByType} habitaciones distribuidas por tipos, pero el hotel dice tener {$totalRooms} habitaciones en total. Estos números deben coincidir exactamente."
            );
            throw new \Illuminate\Validation\ValidationException($validator);
        }
    }
}