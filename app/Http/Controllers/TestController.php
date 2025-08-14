<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
    use App\Models\T_salaire;

class TestController extends Controller
{
    public function adminUsers(): Response
    {
        return Inertia::render('Admin/Users');
    }

    public function adminSalaire(): Response
    {
        $salaires = T_salaire::all();
        return Inertia::render('Admin/Salaire', [
            'salaires' => $salaires,
        ]);
    }

    public function updateSalaire(Request $request, $id)
    {
        $salaire = T_salaire::findOrFail($id);
        $salaire->update($request->all());
        return redirect()->back()->with('success', 'Salaire modifié avec succès');
    }
}
