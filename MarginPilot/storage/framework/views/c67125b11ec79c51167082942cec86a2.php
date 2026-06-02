<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">
  <title><?php echo e($organization->name ?? 'Workspace'); ?> · Margexa</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;450;500;600;700&family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Margexa design tokens -->
  <link rel="stylesheet" href="<?php echo e(asset('js/margexa/tokens.css')); ?>">
  <style>* { box-sizing: border-box; } body { margin: 0; }</style>
</head>
<body>


<div id="root"></div>


<script>
  window.MARGEXA = {
    user: <?php echo json_encode([
      'id'    => auth()->id(),
      'name'  => auth()->user()?->name,
      'email' => auth()->user()?->email,
    ]); ?>,
    organization: <?php echo json_encode([
      'id'        => $organization->id ?? null,
      'name'      => $organization->name ?? null,
      'plan'      => $organization->plan ?? 'free',
      'proxy_url' => url('/api/v1'),
    ]); ?>,
    csrfToken: '<?php echo e(csrf_token()); ?>',
    routes: {
      logout:        '<?php echo e(route("logout")); ?>',
      dashboard:     '<?php echo e(url("/api/dashboard/overview")); ?>',
      analytics:     '<?php echo e(url("/api/analytics")); ?>',
      providers:     '<?php echo e(url("/api/providers/status")); ?>',
      policies:      '<?php echo e(url("/api/policies")); ?>',
      policyTriggers:'<?php echo e(url("/api/policy-triggers")); ?>',
      liveRequests:  '<?php echo e(url("/api/analytics/live-requests")); ?>',
      stripeSync:    '<?php echo e(url("/api/stripe/sync")); ?>',
      onboarding:    '<?php echo e(url("/api/onboarding")); ?>',
    },
  };
</script>


<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>


<?php $v = app()->environment('production') ? config('app.version', '1') : time(); ?>
<script type="text/babel" src="<?php echo e(asset('js/margexa/components.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/fx.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-shell.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-dashboard.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-gateway.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-policies.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-prompts.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-leaks.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-alerts.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-analytics.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-team.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-billing.jsx')); ?>?v=<?php echo e($v); ?>"></script>
<script type="text/babel" src="<?php echo e(asset('js/margexa/app-docs.jsx')); ?>?v=<?php echo e($v); ?>"></script>


<script type="text/babel" src="<?php echo e(asset('js/margexa/app-entry.jsx')); ?>?v=<?php echo e($v); ?>"></script>

</body>
</html>
<?php /**PATH C:\Users\Admin\Desktop\MarginPilot\resources\views/margexa-app.blade.php ENDPATH**/ ?>