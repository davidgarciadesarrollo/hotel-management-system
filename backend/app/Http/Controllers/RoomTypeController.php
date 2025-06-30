<?php

namespace App\Http\Controllers;

use App\Models\RoomType;

class RoomTypeController extends Controller
{
    public function index()
    {
        $roomTypes = RoomType::with('hotel')->get();
        return response()->json($roomTypes);
    }
}
