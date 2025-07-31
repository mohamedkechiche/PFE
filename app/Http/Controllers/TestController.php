<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestController extends Controller
{
    public function adminUsers(): Response
    {
        return Inertia::render('Admin/Users');
    }

    public function adminSalaire(): Response
    {
        return Inertia::render('Admin/Salaire');
    }
}
