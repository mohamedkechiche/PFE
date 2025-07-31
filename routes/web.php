<?php

use App\Http\Controllers\AvancementController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TpersonnelController;
use App\Http\Controllers\HavancementsController;
use App\Http\Controllers\TableauavancementController;
use App\Http\Controllers\DecisionsController;
use App\Http\Controllers\TestController;
use App\Http\Middleware\RoleMiddleware;
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::resource('havancement', HavancementsController::class);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('avancement', AvancementController::class);

    Route::put('avancement/mass-update', [AvancementController::class, 'massUpdate'])->name('avancement.massUpdate');
    Route::put('avancement/mass-update-57', [AvancementController::class, 'massUpdate57ans'])->name('avancement.massUpdate57ans');
    Route::post('avancement/mass-add', [AvancementController::class, 'massAdd'])->name('avancement.massAdd');
    Route::post('avancement/mass-add-57', [AvancementController::class, 'massAdd57ans'])->name('avancement.massAdd57ans');
    Route::delete('/avancement/destroy-by-date/{date_effet}', [TableauavancementController::class, 'destroyByDate'])->name('avancement.destroyByDate');

    Route::resource('decision', DecisionsController::class);



    Route::resource('personnel', TpersonnelController::class);
    Route::resource('historique', TableauavancementController::class);
});

// Route::get('Decisions', function (\Illuminate\Http\Request $request) {
//     return Inertia::render('Decisions', [
//         'date_effet' => $request->query('date_effet'),
//     ]);
// })->name('decisions.index');
Route::middleware(['auth', 'verified', 'role:admin'])->group(function () {
Route::get('/admin/users', [TestController::class, 'adminUsers']);
Route::get('/admin/salaire', [TestController::class, 'adminSalaire']);
});
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
