<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>{{ $organization->name ?? 'Workspace' }} · Margexa</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Margexa design tokens -->
  <link rel="stylesheet" href="{{ asset('js/margexa/tokens.css') }}">
  <style>* { box-sizing: border-box; } body { margin: 0; }</style>
</head>
<body>

{{-- Root mount point (matches app-entry.jsx) --}}
<div id="root"></div>

{{-- Laravel context injected into window.MARGEXA --}}
<script>
  window.MARGEXA = {
    user: {!! json_encode([
      'id'    => auth()->id(),
      'name'  => auth()->user()?->name,
      'email' => auth()->user()?->email,
    ]) !!},
    organization: {!! json_encode([
      'id'        => $organization->id ?? null,
      'name'      => $organization->name ?? null,
      'plan'      => $organization->plan ?? 'free',
      'proxy_url' => url('/api/v1'),
    ]) !!},
    csrfToken: '{{ csrf_token() }}',
    routes: {
      logout:        '{{ route("logout") }}',
      dashboard:     '{{ url("/api/dashboard/overview") }}',
      analytics:     '{{ url("/api/analytics") }}',
      providers:     '{{ url("/api/providers/status") }}',
      policies:      '{{ url("/api/policies") }}',
      policyTriggers:'{{ url("/api/policy-triggers") }}',
      liveRequests:  '{{ url("/api/analytics/live-requests") }}',
      stripeSync:    '{{ url("/api/stripe/sync") }}',
      onboarding:    '{{ url("/api/onboarding") }}',
    },
  };
</script>

{{-- React 18 UMD (same mechanism as standalone Margexa) --}}
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>

{{-- Margexa components — ?v= bust cache on every change in dev --}}
@php $v = app()->environment('production') ? config('app.version', '1') : time(); @endphp
<script type="text/babel" src="{{ asset('js/margexa/components.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/fx.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-shell.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-dashboard.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-gateway.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-policies.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-prompts.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-leaks.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-alerts.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-analytics.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-team.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-billing.jsx') }}?v={{ $v }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/app-docs.jsx') }}?v={{ $v }}"></script>

{{-- App entry --}}
<script type="text/babel" src="{{ asset('js/margexa/app-entry.jsx') }}?v={{ $v }}"></script>

</body>
</html>
