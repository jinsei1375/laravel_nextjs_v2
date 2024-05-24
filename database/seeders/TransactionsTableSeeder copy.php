<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'user_id'       => 1,
                'category_id'   => 22,
                'amount'        => '500',
                'title'         => '買い出し',
                'date'          => today(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
            [
                'user_id'       => 1,
                'category_id'   => 22,
                'amount'        => '1000',
                'title'         => 'お菓子',
                'date'          => today(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ],
        ];

        DB::table('transactions')->insert($data);
    }
}
