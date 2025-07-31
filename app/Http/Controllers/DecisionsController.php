<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use \App\Models\Tableauavancement;
use App\Models\Decision;

class DecisionsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $decisionsByMonth = Decision::query()
            ->selectRaw("DATE_FORMAT(date, '%Y-%m') as month, COUNT(*) as total")
            ->groupByRaw("DATE_FORMAT(date, '%Y-%m')")
            ->orderByRaw("DATE_FORMAT(date, '%Y-%m') desc")
            ->paginate(1000);

        $decisions = Decision::query()
            ->orderBy('date', 'desc')
            ->paginate(1000);
        // dd($decisions->toArray());

        return Inertia::render('Decision/Index', [
            'decisionsByMonth' => $decisionsByMonth,
            'decisions' => $decisions,
            'filters' => [
                'annee' => request('annee', ''),
            ],
            'flash' => [
                'success' => session('success'),
                'error' => session('error')
            ]
        ]);
    }
    /**
     * Show the form for creating a new resource.
     */

    public function create(Request $request)
    {
        $date_effet = $request->query('date_effet');
        [$annee, $mois] = explode('-', $date_effet);
        $mois = str_pad($mois, 2, '0', STR_PAD_LEFT);

        $avancements = Tableauavancement::whereYear('NDate_effet', $annee)
            ->whereMonth('NDate_effet', $mois)
            ->where(function ($query) {
                $query->whereNull('Observation')
                    ->orWhere('Observation', 'like', '%57%');
            })
            ->get();

        // Récupérer tous les Mle concernés
        $mles = $avancements->pluck('Mle')->toArray();
        $lastDecisions = $this->getLastDecisionsByMle($mles);

        return Inertia::render('Decision/Create', [
            'date_effet' => $date_effet,
            'avancements' => $avancements,
            'lastDecisions' => $lastDecisions,
        ]);
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'idav' => 'required|integer',
            'Mle' => 'required|string',
            'NomPrenom' => 'required|string',
            'Qualification' => 'nullable|string',
            'date' => 'required',
            'objet' => 'nullable|string',
            'Trh' => 'nullable|string',
            'Tav' => 'nullable|string',
        ]);
        // dd($request->toArray());

        Decision::create($data);

        return Inertia::render('Decision/Success', [
            'message' => 'Décision enregistrée avec succès.',
        ]);
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
        $data = $request->validate([
            'idav' => 'required|integer',
            'Mle' => 'required|string',
            'NomPrenom' => 'required|string',
            'Qualification' => 'nullable|string',
            'date' => 'required',
            'objet' => 'nullable|string',
            'Trh' => 'nullable|string',
            'Tav' => 'nullable|string',
        ]);

        $decision = Decision::findOrFail($id);
        $decision->update($data);

        return redirect()->route('decision.index')->with('success', 'Décision mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function getLastDecisionsByMle(array $mles)
    {
        // Récupère la dernière décision pour chaque Mle donné
        return \App\Models\Decision::whereIn('Mle', $mles)
            ->selectRaw('*, ROW_NUMBER() OVER (PARTITION BY Mle ORDER BY date DESC) as rn')
            ->get()
            ->where('rn', 1)
            ->keyBy('Mle');
    }
}
