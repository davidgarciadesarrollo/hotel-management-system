<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddUniqueAccommodationConstraintToRoomTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('room_types', function (Blueprint $table) {
            // Eliminar la restricción anterior si existe
            try {
                $table->dropUnique('room_types_unique_constraint');
            } catch (Exception $e) {
                // La restricción no existe, continuar
            }
            
            // Añadir restricción única solo para hotel_id + accommodation
            $table->unique(['hotel_id', 'accommodation'], 'room_types_accommodation_unique');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('room_types', function (Blueprint $table) {
            // Eliminar la restricción única
            $table->dropUnique('room_types_accommodation_unique');
            
            // Restaurar la restricción anterior si es necesario
            // $table->unique(['hotel_id', 'type', 'accommodation'], 'room_types_unique_constraint');
        });
    }
}
