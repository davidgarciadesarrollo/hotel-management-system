<?php

namespace App\Http\Controllers;

use App\Models\RoomType;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::with('hotel')->get();
        return response()->json($roomTypes);
    }

    /**
     * Crear un nuevo tipo de habitación
     */
    public function store(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'type' => 'required|string|max:255',
            'accommodation' => 'required|string|max:255',
            'quantity' => 'required|integer|min:1',
        ]);

        // Verificar que no exista ya esta acomodación para el mismo hotel
        $existingRoomType = RoomType::where('hotel_id', $request->hotel_id)
                                  ->where('accommodation', $request->accommodation)
                                  ->first();

        if ($existingRoomType) {
            $hotel = Hotel::find($request->hotel_id);
            throw ValidationException::withMessages([
                'accommodation' => [
                    "🚫 ACOMODACIÓN DUPLICADA: La acomodación '{$request->accommodation}' ya existe en el hotel '{$hotel->nombre}' " .
                    "para el tipo de habitación '{$existingRoomType->type}'. No se pueden repetir acomodaciones en el mismo hotel. " .
                    "Por favor, elija una acomodación diferente."
                ]
            ]);
        }

        $roomType = RoomType::create($request->all());
        return response()->json($roomType->load('hotel'), 201);
    }

    /**
     * Mostrar un tipo de habitación específico
     */
    public function show($id)
    {
        $roomType = RoomType::with('hotel')->findOrFail($id);
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

        // Verificar que no exista ya esta acomodación para el mismo hotel
        // (excluyendo el registro actual)
        $existingRoomType = RoomType::where('hotel_id', $request->hotel_id)
                                  ->where('accommodation', $request->accommodation)
                                  ->where('id', '!=', $id)
                                  ->first();

        if ($existingRoomType) {
            $hotel = Hotel::find($request->hotel_id);
            throw ValidationException::withMessages([
                'accommodation' => [
                    "🚫 ACOMODACIÓN DUPLICADA: La acomodación '{$request->accommodation}' ya existe en el hotel '{$hotel->nombre}' " .
                    "para el tipo de habitación '{$existingRoomType->type}'. No se pueden repetir acomodaciones en el mismo hotel. " .
                    "Por favor, elija una acomodación diferente."
                ]
            ]);
        }

        $roomType->update($request->all());
        return response()->json($roomType->load('hotel'));
    }

    /**
     * Eliminar un tipo de habitación
     */
    public function destroy($id)
    {
        $roomType = RoomType::findOrFail($id);
        $roomType->delete();
        return response()->json(null, 204);
    }
}
