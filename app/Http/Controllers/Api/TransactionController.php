<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function store(Request $request, User $user)
    {
        $transaction = new Transaction;
        $transaction->user_id = $user->id;
        $transaction->title = $request->title;
        $transaction->category_id = $request->category;
        $transaction->amount = $request->amount;
        $transaction->date = $request->date;
        $transaction->save();

        return response()->json($transaction);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Transaction $transaction)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user, Transaction $transaction)
    {
        \Log::info($transaction);
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully'
        ]);
    }

    public function getTransactions(Request $request, User $user)
    {
        $transactions = Transaction::with('category')->where('user_id', $user->id)->orderBy('date', 'asc')->get();
        return $transactions;
    }
}
