<?php

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/users', [UserController::class, 'index']);

Route::get('/test', function () {
    return view('test');
});

Route::get('/{user}/category', [CategoryController::class, 'index']);
Route::get('/{user}/category/incomeexpense', [CategoryController::class, 'getIncomeAndExpenseCategories']);
Route::post('/{user}/category', [CategoryController::class, 'store']);
Route::put('/{user}/category/{category}', [CategoryController::class, 'edit']);
Route::delete('/{user}/category/{category}', [CategoryController::class, 'destroy']);

Route::get('/{user}/transaction', [TransactionController::class, 'getTransactions']);
Route::post('/{user}/transaction', [TransactionController::class, 'store']);
Route::put('/{user}/transaction/{transaction}', [TransactionController::class, 'edit']);
Route::delete('/{user}/transaction/{transaction}', [TransactionController::class, 'destroy']);
