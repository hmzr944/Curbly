<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You're invited to Margexa</title>
    <style>
        body { margin: 0; padding: 0; background: #f8f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wrapper { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.06); }
        .header  { background: linear-gradient(135deg, #5B5BD6, #8B5CF6); padding: 36px 40px 32px; }
        .header-logo { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.03em; }
        .header-title { margin-top: 20px; font-size: 22px; font-weight: 600; color: #fff; line-height: 1.3; }
        .body    { padding: 32px 40px; }
        .text    { font-size: 15px; line-height: 1.65; color: #374151; margin: 0 0 16px; }
        .role-badge { display: inline-block; background: #ede9fe; color: #5B5BD6; border-radius: 99px; padding: 3px 12px; font-size: 13px; font-weight: 600; margin: 0 0 24px; }
        .cta     { display: inline-block; background: linear-gradient(135deg, #5B5BD6, #8B5CF6); color: #fff; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 8px 0 24px; }
        .footer-text { font-size: 12px; color: #9CA3AF; line-height: 1.6; border-top: 1px solid #f3f4f6; padding-top: 20px; margin-top: 8px; }
        .footer-text a { color: #6B7280; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="header">
            <div class="header-logo">Margexa</div>
            <div class="header-title">You've been invited to<br><?php echo e($organizationName); ?></div>
        </div>
        <div class="body">
            <p class="text">
                <strong><?php echo e($inviterName); ?></strong> has invited you to join <strong><?php echo e($organizationName); ?></strong> on Margexa — the AI margin control platform.
            </p>
            <div class="role-badge"><?php echo e($role); ?></div>
            <p class="text">
                Click below to accept your invitation and set up your account. The link expires on <?php echo e($expiresAt ?? '7 days from now'); ?>.
            </p>
            <a href="<?php echo e($acceptUrl); ?>" class="cta">Accept invitation →</a>
            <p class="text" style="font-size:13px; color:#6B7280;">
                Or copy this link into your browser:<br>
                <a href="<?php echo e($acceptUrl); ?>" style="color:#5B5BD6; word-break:break-all;"><?php echo e($acceptUrl); ?></a>
            </p>
            <p class="footer-text">
                If you didn't expect this invitation, you can safely ignore this email.<br>
                This email was sent from Margexa &mdash; <a href="<?php echo e(url('/')); ?>">margexa.io</a>
            </p>
        </div>
    </div>
</body>
</html>
<?php /**PATH C:\Users\Admin\Desktop\MarginPilot\resources\views/emails/invitation.blade.php ENDPATH**/ ?>