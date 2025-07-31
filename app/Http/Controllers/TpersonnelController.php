<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\t_personnels;
use App\Models\Avancement;
use App\Models\Havancements;
use App\Models\T_salaire;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TpersonnelController extends Controller
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

        $pages = request('pages', 10); // Default to 10 if not specified

        $Personnels = $query->paginate($pages);
        $Salaire = T_salaire::all();

        $query_sans_avancement = $query->whereDoesntHave('Avancement')
                    ->orWhereHas('Avancement', function ($q) {
                        $q->whereNull('SBase')->whereNull('TH');
                    });

        $PersonnelsAll = $query_sans_avancement->paginate(10000);

        // dd($PersonnelsAll);
        if (request()->has('HMle')) {
            $HAvancements = Havancements::where('Mle', request('HMle'))->get();
        } else {
            $HAvancements = [];
        }
        // dd($HAvancements);
        return Inertia::render('Personnel/Index', [
            'personnels' => $Personnels,
            'personnelsAll' => $PersonnelsAll,
            'count' => $count,
            'countAvancementdepassee' => $countAvancementdepassee,
            'HAvancements' => $HAvancements,
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
        //
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
    public function update(Request $request, t_personnels $t_personnels)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(t_personnels $t_personnels)
    {
        //
    }
}
