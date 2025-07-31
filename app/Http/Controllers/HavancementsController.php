<?php

namespace App\Http\Controllers;

use App\Models\Havancements;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HavancementsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $havancements = Havancements::all();

        return Inertia::render('Havancement/Index', [
            'havancements' => $havancements,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
                dd($id);

        // On suppose que le modèle s'appelle Havancement
        $avancement = Havancements::findOrFail($id);
        return Inertia::render('Personnel/Index', [
            'HAvancement' => $avancement,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Afficher l'historique d'un personnel via le Mle.
     */
    public function historique($mle)
    {
        // $historique = Avancement::where('Mle', $mle)->orderBy('Date_effet', 'desc')->get();
        // return response()->json(['historique' => $historique]);
    }
}
