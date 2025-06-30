<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    protected $fillable = ['type', 'quantity', 'accommodation'];

    public function hotel()
    {
        return $this->belongsTo(\App\Models\Hotel::class);
    }
}