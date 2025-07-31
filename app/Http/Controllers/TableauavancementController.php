<?php

namespace App\Http\Controllers;

use App\Models\Tableauavancement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TableauavancementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tableauavancementsmonth = Tableauavancement::query()
            ->selectRaw("DATE_FORMAT(NDate_effet, '%Y-%m') as NDate_effet")
            ->groupByRaw("DATE_FORMAT(NDate_effet, '%Y-%m')")
            ->orderByRaw("DATE_FORMAT(NDate_effet, '%Y-%m') desc")
            ->paginate(1000);

        $tableauavancements = Tableauavancement::query()
            ->paginate(1000);
        return Inertia::render('Historique/Index', [
            'tableauavancementsmonth' => $tableauavancementsmonth,
            'tableauavancements' => $tableauavancements,
            'filters' => [
                'annee' => request('annee', ''),

            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }


    public function destroyByDate(Request $request)
    {
        $dateEffet = $request->route('date_effet'); // format attendu : 'YYYY-MM'
        if (!$dateEffet) {
            return redirect()->back()->with('error', 'Date non fournie.');
        }

        // Suppression de tous les enregistrements du même mois et année
        Tableauavancement::whereRaw("DATE_FORMAT(NDate_effet, '%Y-%m') = ?", [$dateEffet])->delete();

        return redirect()->route('historique.index')
            ->with('success', 'Tous les avancements de ce mois ont été supprimés.');
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
        $validated = $request->validate([
            'Mle' => 'required|string|max:255',
            'NomPrenom' => 'required|string|max:255',
            'Qualification' => 'nullable|string|max:255',
            'Categorie' => 'nullable|string|max:255',
            'Sous_Categorie' => 'nullable|string|max:255',
            'Echellon' => 'nullable|string|max:255',
            'SBase' => 'nullable|numeric',
            'TH' => 'nullable|numeric',
            'Ind_differentiel' => 'nullable|numeric',
            'Date_effet' => 'nullable|date',
            'Observation' => 'nullable|string|max:255',
            'NCategorie' => 'nullable|string|max:255',
            'NSous_Categorie' => 'nullable|string|max:255',
            'NEchellon' => 'nullable|string|max:255',
            'NSBase' => 'nullable|numeric',
            'NTH' => 'nullable|numeric',
            'NInd_differentiel' => 'nullable|numeric',
            'NDate_effet' => 'nullable|date',
            'Note' => 'nullable|string|max:255',
        ]);

        Tableauavancement::create($validated);

        return redirect()->route('tableauavancements.index')
            ->with('success', 'Avancement ajouté avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
}
