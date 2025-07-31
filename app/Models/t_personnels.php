<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class t_personnels extends Model
{
    use HasFactory;

    protected $table = 't_personnels';
    public $timestamps = false;

    protected $fillable = [
        'ID',
        'Mle',
        'Nom',
        'Prenom',
        'Num_P',
        'Num_M',
        'Date_N',
        'Lieu_N',
        'CIN',
        'CPostal',
        'Date_CIN',
        'Num_CNSS',
        'Adresse',
        'Ville',
        'S_F',
        'Sexe',
        'Date_Entre_Etab',
        'Date_Anc',
        'Date_Sortie_Etab',
        'Motif_Sorte',
        'Tel'
    ];





    /**
     * Relation one-to-one avec le modèle Avancement
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function avancement()
    {
        return $this->belongsTo(Avancement::class, 'Mle', 'Mle');
    }

    public function havancement()
    {
        return $this->hasMany(Havancements::class, 'Mle', 'Mle');
    }
    public function sanctions()
    {
        return $this->hasMany(Sanction::class, 'mle', 'Mle');
    }


}
