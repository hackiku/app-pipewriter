// src/lib/server/email/templates/template-delivery.ts
export function generateTemplateDeliveryEmail(email: string): {
	subject: string;
	html: string;
	text: string;
} {
	const subject = "Your Pipewriter templates are ready! 📦";

	const text = `
Your Pipewriter templates are ready!

Thanks for trying Pipewriter. Your template collection is being prepared and will be delivered via our secure portal.

Access your templates: https://app.pipewriter.io/templates

What's included:
→ 90+ wireframe elements
→ Light & dark mode versions  
→ Copy-paste ready components
→ Quick start guide

Need help? Just reply to this email.

Happy wireframing!
The Pipewriter Team
`;

	const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Same styles as welcome email */
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Pipewriter</div>
      <div class="tagline">Your templates are ready!</div>
    </div>
    
    <div class="content">
      <h1>Your templates are ready! 📦</h1>
      <!-- Rest of HTML content -->
    </div>
  </div>
</body>
</html>
  `;

	return { subject, html, text };
}