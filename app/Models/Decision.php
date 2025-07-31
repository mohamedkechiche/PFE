<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Decision extends Model
{
    use HasFactory;

    protected $table = 'decisions';
    //  public $timestamps = false;

    protected $fillable = [
        'idav',
        'Mle',
        'NomPrenom',
        'Qualification',
        'objet',
        'date',
        'Trh',
        'Tav'
    ];

    /**
     * Relation avec le modèle Avancement
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function tableauavancement(): BelongsTo
    {
        return $this->belongsTo(tableauavancement::class, 'idav', 'id');
    }
}
