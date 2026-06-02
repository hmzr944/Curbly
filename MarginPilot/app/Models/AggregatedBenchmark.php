<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AggregatedBenchmark extends Model
{
    protected $fillable = [
        'sector',
        'metric',
        'period_week',
        'p25',
        'p50',
        'p75',
        'sample_size',
    ];

    protected function casts(): array
    {
        return [
            'p25'         => 'float',
            'p50'         => 'float',
            'p75'         => 'float',
            'sample_size' => 'integer',
        ];
    }
}
