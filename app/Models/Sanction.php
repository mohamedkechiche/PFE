<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sanction extends Model
{
    use HasFactory;
    protected $table = 't_sanctions';
    protected $fillable = [
        'ID',
        'Mle',
        'Sanction',
        'D_Debut',
        'Duree',
        'D_Fin',
        'Motif',
        'Ref',
        'Date_ref'
    ];


    /**
     * Get the employee associated with the sanction.
     */
    public function t_personnel(): BelongsTo
    {
        return $this->belongsTo(t_personnels::class, 'mle', 'mle');
    }

}
