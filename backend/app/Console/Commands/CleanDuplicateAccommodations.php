<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RoomType;
use Illuminate\Support\Facades\DB;

class CleanDuplicateAccommodations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rooms:clean-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia acomodaciones duplicadas para el mismo hotel';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Buscando acomodaciones duplicadas...');
        
        // Encontrar duplicados
        $duplicates = DB::select('
            SELECT hotel_id, accommodation, COUNT(*) as count 
            FROM room_types 
            GROUP BY hotel_id, accommodation 
            HAVING COUNT(*) > 1
        ');
        
        if (empty($duplicates)) {
            $this->info('No se encontraron acomodaciones duplicadas.');
            return 0;
        }
        
        $this->info('Duplicados encontrados:');
        foreach ($duplicates as $duplicate) {
            $this->line("Hotel ID: {$duplicate->hotel_id}, Acomodación: {$duplicate->accommodation}, Cantidad: {$duplicate->count}");
        }
        
        if (!$this->confirm('¿Deseas proceder con la limpieza? Se conservará solo la primera entrada de cada acomodación por hotel.')) {
            $this->info('❌ Operación cancelada por el usuario.');
            return 0;
        }
        
        $this->info('🧹 Iniciando limpieza de datos duplicados...');
        $cleaned = 0;
        
        foreach ($duplicates as $duplicate) {
            // Obtener todos los registros duplicados
            $roomTypes = RoomType::where('hotel_id', $duplicate->hotel_id)
                                ->where('accommodation', $duplicate->accommodation)
                                ->orderBy('id')
                                ->get();
            
            // Conservar el primero, eliminar el resto
            $first = $roomTypes->first();
            $toDelete = $roomTypes->skip(1);
            
            $this->line("✅ Conservando: Hotel {$first->hotel_id}, Tipo: {$first->type}, Acomodación: {$first->accommodation}");
            
            foreach ($toDelete as $roomType) {
                $this->line("🗑️  Eliminando: Hotel {$roomType->hotel_id}, Tipo: {$roomType->type}, Acomodación: {$roomType->accommodation}");
                $roomType->delete();
                $cleaned++;
            }
        }
        
        $this->info("🎉 Limpieza completada exitosamente!");
        $this->info("📊 Se eliminaron {$cleaned} registros duplicados.");
        $this->info("🚀 Ahora puedes ejecutar la migración con: php artisan migrate");
        
        return 0;
    }
}
