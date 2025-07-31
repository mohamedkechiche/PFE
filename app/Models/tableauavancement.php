<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tableauavancement extends Model
{
    use HasFactory;
    protected $table = 'tableauavancements';
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
        'Observation',
        'NCategorie',
        'NSous_Categorie',
        'NEchellon',
        'NSBase',
        'NTH',
        'NInd_differentiel',
        'NDate_effet',
        'Note',
        'echNouveau_1',
        'nouveauTH_1',
        'nouvelIndDiff_1'
    ];
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';
}
