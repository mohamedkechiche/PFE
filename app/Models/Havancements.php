<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Havancements extends Model
{
    use HasFactory;

    protected $table = 'Havancements';

    protected $fillable = [
        'id',
        'Mle',
        'NomPrenom',
        'Qualification',
        'Categorie',
        'Sous_Categorie',
        'Echellon',
        'SBase',
        'TH',
        'Ind_differentiel',
        'Date_effet',
        'Date_Prochain_Av',
        'Observation'
    ];


    /**
     * Relation avec le modèle TPersonnel
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function t_personnel(): BelongsTo
    {
        return $this->belongsTo(t_personnels::class, 'Mle', 'Mle');
    }


}
