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
        ]);

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
        ]);

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
}