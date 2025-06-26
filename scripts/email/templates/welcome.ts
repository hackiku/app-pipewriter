// scripts/email/templates/welcome.ts
export const welcomeTemplate = {
	id: 'welcome',
	name: 'Welcome Email',
	subject: "You're in! (And yes, I used urgency in this subject line) 🎯",
	previewText: 'Welcome to Pipewriter - you just joined 200+ writers...',

	// Plain text version
	text: `
Hey there!

Welcome to Pipewriter - you just joined 200+ writers who are tired of delivering copy in Word docs that clients judge.

Quick confession: I'm using every copywriting trick in the book on you in these emails. 

Why? Because you'll appreciate the meta-ness of it. Plus, you'll see exactly how good copy converts (hint: it's working right now).

Here's what happens next:
→ You'll get access to our Google Docs add-on (14-day free trial)
→ I'll show you how to turn $12/month into $500+ project premiums  
→ You'll see why clients stop asking for revisions when they see wireframes

Ready to wireframe where you already write?

Start your free trial: https://workspace.google.com/marketplace/app/pipewriter

To better wireframes (and higher rates),
Ivan

P.S. Yes, I just used a P.S. It increases readership by 79%. See what I mean about the meta thing?

---
© 2025 Pipewriter | You're receiving this because you signed up for updates.
Unsubscribe: https://pipewriter.io/unsubscribe?email={{email}}
  `.trim(),

	// HTML version
	html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Pipewriter</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .highlight { color: #3644FE; font-weight: 600; }
    .meta-note { background: #f8f9fa; border-left: 4px solid #3644FE; padding: 15px; margin: 20px 0; border-radius: 4px; font-style: italic; }
    .arrow { color: #3644FE; font-weight: bold; margin-right: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✍️ Pipewriter</h1>
      <p>UX App for Writers in Google Docs</p>
    </div>
    <div class="content">
      <h2>You're in! (And yes, I used urgency in this subject line) 🎯</h2>
      
      <p>Welcome to Pipewriter - you just joined <span class="highlight">200+ writers</span> who are tired of delivering copy in Word docs that clients judge.</p>
      
      <div class="meta-note">
        <strong>Quick confession:</strong> I'm using every copywriting trick in the book on you in these emails. Why? Because you'll appreciate the meta-ness of it. Plus, you'll see exactly how good copy converts (hint: it's working right now).
      </div>
      
      <p><strong>Here's what happens next:</strong></p>
      <p><span class="arrow">→</span>You'll get access to our Google Docs add-on (14-day free trial)<br>
      <span class="arrow">→</span>I'll show you how to turn $12/month into $500+ project premiums<br>  
      <span class="arrow">→</span>You'll see why clients stop asking for revisions when they see wireframes</p>
      
      <p>Ready to wireframe where you already write?</p>
      
      <div style="text-align: center;">
        <a href="https://workspace.google.com/marketplace/app/pipewriter" class="cta-button">Start Your Free Trial</a>
      </div>
      
      <p>To better wireframes (and higher rates),<br><strong>Ivan</strong></p>
      
      <p><strong>P.S.</strong> Yes, I just used a P.S. It increases readability by 79%. See what I mean about the meta thing?</p>
      
      <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        © 2025 Pipewriter. You're receiving this because you signed up for updates.<br>
        <a href="https://pipewriter.io/unsubscribe?email={{email}}" style="color: #6b7280;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim(),

	// Template metadata
	variables: ['email', 'name', 'source'],
	active: true,
	metadata: {
		tier: 'system',
		tags: ['onboarding', 'welcome', 'sequence'],
		category: 'onboarding',
		version: '1.0'
	},
	templateEngine: 'mustache',
	estimatedReadTime: '2 minutes',
	usage: 0,
	lastSentAt: null,
	createdAt: new Date(),
	updatedAt: new Date()
};