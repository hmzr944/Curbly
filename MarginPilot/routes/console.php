<?php

use App\Jobs\AggregateBenchmarksJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Scheduled Jobs
|--------------------------------------------------------------------------
|
| Margexa scheduled tasks:
|
|   AggregateBenchmarksJob  — runs every Sunday at 02:00 UTC.
|     Computes anonymous percentile benchmarks (p25/p50/p75) across all
|     organisations for the previous 7 days and writes to
|     aggregated_benchmarks. The /api/benchmarks endpoint reads from
|     this table so comparisons are instant and cross-org safe.
|
*/

Schedule::job(new AggregateBenchmarksJob)
    ->weekly()
    ->sundays()
    ->at('02:00')
    ->name('aggregate-benchmarks')
    ->withoutOverlapping();
