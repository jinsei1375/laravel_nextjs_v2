<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/users', [UserController::class, 'index']);

Route::get('/{user}/category', [CategoryController::class, 'index']);
Route::get('/{user}/category/incomeexpense', [CategoryController::class, 'getIncomeAndExpenseCategories']);
Route::post('/{user}/category', [CategoryController::class, 'store']);
