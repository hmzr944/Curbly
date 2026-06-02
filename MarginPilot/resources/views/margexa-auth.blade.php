<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Sign in · Margexa</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Margexa design tokens -->
  <link rel="stylesheet" href="{{ asset('js/margexa/tokens.css') }}">
  <style>* { box-sizing: border-box; } body { margin: 0; }</style>
</head>
<body>

<div id="root"></div>

{{-- Laravel context injected into window.MARGEXA --}}
<script>
  window.MARGEXA = {
    csrfToken:  '{{ csrf_token() }}',
    authView:   '{{ $authView ?? "login" }}',
    authStatus: '{{ session("status") }}',
    authErrors: {!! json_encode($errors->toArray()) !!},
    routes: {
      login:    '{{ route("login") }}',
      register: '{{ route("register") }}',
      logout:   '{{ route("logout") }}',
      app:      '{{ route("app.index") }}',
      passwordRequest: '{{ route("password.request") }}',
    },
  };
</script>

{{-- React 18 UMD + Babel Standalone --}}
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>

{{-- Shared design system --}}
<script type="text/babel" src="{{ asset('js/margexa/components.jsx') }}"></script>
<script type="text/babel" src="{{ asset('js/margexa/fx.jsx') }}"></script>

{{-- Auth pages (contains AuthRoot) --}}
<script type="text/babel" src="{{ asset('js/margexa/auth-pages.jsx') }}"></script>

<script type="text/babel">
  ReactDOM.createRoot(document.getElementById('root')).render(<AuthRoot initialView={window.MARGEXA.authView} />);
</script>

</body>
</html>
