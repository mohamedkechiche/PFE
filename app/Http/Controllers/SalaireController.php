<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\T_salaire;

class SalaireController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $salaires = T_salaire::all();
        return view('salaire.index', compact('salaires'));
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
        $salaire = T_salaire::findOrFail($id);
        return view('salaire.edit', compact('salaire'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $salaire = T_salaire::findOrFail($id);
        $salaire->update($request->all());
        return redirect()->route('salaire.index')->with('success', 'Salaire modifié avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
