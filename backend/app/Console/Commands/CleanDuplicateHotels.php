<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Hotel;
use Illuminate\Support\Facades\DB;

class CleanDuplicateHotels extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hotels:clean-duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Limpia hoteles con nombres duplicados, manteniendo solo el más reciente';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Buscando hoteles con nombres duplicados...');
        
        // Encontrar nombres duplicados
        $duplicates = DB::table('hotels')
            ->select('nombre', DB::raw('count(*) as total'))
            ->groupBy('nombre')
            ->havingRaw('count(*) > 1')
            ->get();

        if ($duplicates->isEmpty()) {
            $this->info('No se encontraron hoteles con nombres duplicados.');
            return 0;
        }

        $this->info("Encontrados {$duplicates->count()} nombres duplicados:");

        foreach ($duplicates as $duplicate) {
            $this->line("- {$duplicate->nombre} ({$duplicate->total} veces)");
            
            // Obtener todos los hoteles con este nombre, ordenados por ID descendente
            $hotels = Hotel::where('nombre', $duplicate->nombre)
                ->orderBy('id', 'desc')
                ->get();
            
            // Mantener el primero (más reciente) y eliminar los demás
            $hotelToKeep = $hotels->first();
            $hotelsToDelete = $hotels->skip(1);
            
            foreach ($hotelsToDelete as $hotel) {
                $this->line("  Eliminando hotel ID {$hotel->id} (manteniendo ID {$hotelToKeep->id})");
                $hotel->delete();
            }
        }

        $this->info('Limpieza completada. Ahora se puede aplicar la restricción unique.');
        return 0;
    }
}
