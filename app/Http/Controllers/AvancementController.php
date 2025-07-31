<?php

namespace App\Http\Controllers;

use App\Models\Avancement;
use App\Models\Havancements;
use App\Models\Sanction;
use App\Models\T_salaire;
use App\Models\t_personnels;
use App\Models\Tableauavancement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Collection; // à ajouter en haut si besoin

use function Pest\Laravel\get;

class AvancementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {

        $query = t_personnels::with('Avancement')
            ->whereNull('Date_Sortie_Etab')
            ->orderByRaw('CAST(Mle AS UNSIGNED) ASC');


        // Comptage des personnels sans avancement
        $count = t_personnels::whereNull('Date_Sortie_Etab')
            ->where(function ($q) {
                $q->whereDoesntHave('Avancement')
                    ->orWhereHas('Avancement', function ($q2) {
                        $q2->whereNull('categorie');
                    });
            })
            ->count();


        // Comptage des personnels avec date prochain avancement dépassée
        $countAvancementdepassee = t_personnels::whereNull('Date_Sortie_Etab')
            ->whereHas('Avancement', function ($q) {
                $q->whereNotNull('Date_Prochain_Av')
                    ->where('Date_Prochain_Av', '<', now());
            })
            ->count();



        // Handle search
        if (request()->has('search')) {
            $search = request('search');
            $query->where(function ($q) use ($search) {
                $q->where('t_personnels.Mle', 'like', "%{$search}%");
            });
        }

        // Handle completion filter
        if (request()->has('filter') && request('filter') !== 'all') {
            if (request('filter') === 'H') {
                $query->whereHas('Avancement', function ($q) {
                    $q->where('TH', '!=', 0);
                });
            } elseif (request('filter') === 'M') {
                $query->whereHas('Avancement', function ($q) {
                    $q->where('SBase', '!=', 0);
                });
            } elseif (request('filter') === 'sans_avancement') {
                $query->whereDoesntHave('Avancement')
                    ->orWhereHas('Avancement', function ($q) {
                        $q->whereNull('SBase')->whereNull('TH');
                    });
            } elseif (request('filter') === 'Avancement_depassee') {
                $query->whereHas('Avancement', function ($q) {
                    $q->whereNotNull('Date_Prochain_Av')
                        ->where('Date_Prochain_Av', '<', now());
                });
            }
        }

        // Handle date filter
        $date = request('date'); // format: 2025-05
        if ($date) {
            [$year, $month] = explode('-', $date);
            $query->whereHas('Avancement', function ($q) use ($year, $month) {
                $q->whereYear('Date_Prochain_Av', $year)
                    ->whereMonth('Date_Prochain_Av', $month);
            });
        }


        $Personnels = $query->paginate(1000);
        // dd($Personnels->toArray());
        if (request()->has('HMle')) {
            $HAvancements = Havancements::where('Mle', request('HMle'))->get();
        } else {
            $HAvancements = [];
        }


        $Sanction = Sanction::all();
        $Salaire = T_salaire::all();


        // dd($HAvancements);
        return Inertia::render('Avancement/Index', [
            'personnels' => $Personnels,
            'count' => $count,
            'countAvancementdepassee' => $countAvancementdepassee,
            'HAvancements' => $HAvancements,
            'allSanctions' => $Sanction,
            'grilleSalaire' => $Salaire,
            'filters' => [
                'search' => request('search', ''),
                // 'filter' => request('filter', 'all'),
                'M' => request('M', 'all'),
                'H' => request('H', 'all'),
                'sans_avancement' => request('sans_avancement', 'all')
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
            'Mle' => 'required',
            'NomPrenom' => 'required',
            'Qualification' => 'required',
            'Categorie' => 'required',
            'Sous_Categorie' => 'nullable',
            'Echellon' => 'required',
            'SBase' => 'nullable',
            'TH' => 'nullable',
            'Ind_differentiel' => 'nullable',
            'Date_effet' => 'required|date',
            'Date_Prochain_Av' => 'nullable|date',
            'Observation' => 'nullable'
        ]);

        Avancement::create($validated);
        return redirect()->route('avancement.index')->with('success', 'Avancement created successfully!');
    }



    /**
     * Display the specified resource.
     */
    public function show()
    {
        return Inertia::render('Avancement/Show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Avancement $avancement)
    {
        // dd($request);
        $validated = $request->validate([
            'Mle' => 'required',
            'NomPrenom' => 'required',
            'Qualification' => 'required',
            'Categorie' => 'required',
            'Sous_Categorie' => 'nullable',
            'Echellon' => 'required',
            'SBase' => 'nullable',
            'TH' => 'nullable',
            'Ind_differentiel' => 'nullable',
            'Date_effet' => 'required|date',
            'Date_Prochain_Av' => 'nullable|date',
            'Observation' => 'nullable'
        ]);

        $avancement->update($validated);
        return redirect()->route('personnel.index')->with('success', 'Avancement updated successfully!');
    }

    public function massUpdate(Request $request)
    {
        // Tu peux maintenant accéder directement au tableau :
        $avancements = $request->avancements;
        // dd($avancements); // tu dois voir ton tableau ici
        $validated = $request->validate([
            'avancements' => 'required|array',
            'avancements.*.id' => 'required|exists:avancements,id',
            // Ajoute ici les autres validations si besoin
        ]);

        foreach ($avancements as $data) {
            $avancement = Avancement::find($data['id']);
            if ($avancement) {
                $avancement->update($data);
            }
            // Tableauavancement::create($data);

        }

        return redirect()->route('personnel.index')->with('success', 'Avancements mis à jour avec succès !');
    }

    public function massUpdate57ans(Request $request)
    {
        // Tu peux maintenant accéder directement au tableau :
        $avancements = $request->avancements;
        // dd($avancements); // tu dois voir ton tableau ici
        $validated = $request->validate([
            'avancements' => 'required|array',
            'avancements.*.id' => 'required|exists:avancements,id',
            // Ajoute ici les autres validations si besoin
        ]);

        foreach ($avancements as $data) {
            $avancement = Avancement::find($data['id']);
            if ($avancement) {
                $avancement->update($data);
            }
            // Tableauavancement::create($data);

        }

        return redirect()->route('personnel.index')->with('success', 'Avancements mis à jour avec succès !');
    }


    public function massAdd(Request $request)
    {

        $avancements = $request->avancements;
        // dd($avancements); // tu dois voir ton tableau ici

        foreach ($avancements as $data) {
            Tableauavancement::create($data);
        }

        return redirect()->route('historique.index')->with('success', 'Avancements créés avec succès !');
    }

    public function massAdd57ans(Request $request)
    {

        $avancements = $request->avancements;
        // dd($avancements); // tu dois voir ton tableau ici

        foreach ($avancements as $data) {
            Tableauavancement::create($data);
        }

        return redirect()->route('historique.index')->with('success', 'Avancements créés avec succès !');
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Avancement $avancement)
    {
        // dd($avancement);
        // Avancement::where('Mle', $t_personnels->Mle)->delete();
        $avancement->delete();
        return redirect()->route('personnel.index')->with('success', 'Avancement deleted successfully!');
    }

    /**
     * Récupère les personnels avec avancement et, si demandé, les sanctions sur une période.
     *
     * @param array $params ['Smle' => string|null, 'Sdate' => string|null]
     * @return array ['personnels' => Collection, 'sanctions' => Collection]
     */
    public function getPersonnelsEtSanctions(array $params = [])
    {
        // Récupération des personnels avec avancement
        $personnels = t_personnels::with('Avancement')
            ->whereNull('Date_Sortie_Etab')
            ->orderByRaw('CAST(Mle AS UNSIGNED) ASC')
            ->get();

        // Récupération des sanctions si paramètres présents
        $sanctions = collect();
        if (!empty($params['Smle']) && !empty($params['Sdate'])) {
            $date = $params['Sdate'];
            $dateMoins18Mois = Carbon::createFromFormat('Y-m-d', $date)
                ->subMonths(18)
                ->startOfMonth()
                ->format('Y-m-d');

            $sanctions = Sanction::where('mle', $params['Smle'])
                ->whereBetween('d_debut', [$dateMoins18Mois, $date])
                ->get();
        }

        return [
            'personnels' => $personnels,
            'sanctions' => $sanctions,
        ];
    }
}
