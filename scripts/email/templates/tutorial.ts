// scripts/email/templates/tutorial.ts
export const tutorialTemplate = {
	id: 'tutorial',
	name: 'Tutorial Email',
	subject: "Here's how to wireframe in Google Docs (2-min read) 📋",
	previewText: 'Step-by-step guide to creating wireframes that clients love...',

	text: `
Hey {{name || 'there'}}!

Yesterday you joined Pipewriter. Today, I'll show you exactly how to wireframe in Google Docs (it's easier than you think).

Here's the 2-minute walkthrough:

STEP 1: Install the add-on
→ Go to workspace.google.com/marketplace/app/pipewriter
→ Click "Install" and authorize with Google
→ Open any Google Doc and look for Pipewriter in the sidebar

STEP 2: Drop your first element  
→ Click any wireframe element (start with "Hero" - it's free)
→ Watch it appear in your doc as a clean table
→ Edit the text directly in the table

STEP 3: Build your wireframe
→ Add more elements (cards, buttons, lists)
→ Stack them vertically like building blocks
→ Use the "Chain Mode" to drop multiple elements quickly

That's it! You just created a wireframe that clients can review, comment on, and approve - all in Google Docs.

Try it now: https://workspace.google.com/marketplace/app/pipewriter

Pro tip: Start with the "Hero + 3 Cards + Button" pattern. It works for 80% of landing pages.

Questions? Just reply to this email.

Talk soon,
Ivan

P.S. Tomorrow: I'll show you how Sarah used this technique to increase her project rates by 40% (true story).

---
© 2025 Pipewriter | You're receiving this because you signed up for updates.
Unsubscribe: https://pipewriter.io/unsubscribe?email={{email}}
  `.trim(),

	html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>How to wireframe in Google Docs</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%); color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .step { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .step-number { background: #3644FE; color: white; border-radius: 50%; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .arrow { color: #3644FE; font-weight: bold; margin-right: 8px; }
    .pro-tip { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Tutorial</h1>
      <p>Your 2-minute wireframing walkthrough</p>
    </div>
    <div class="content">
      <h2>Here's how to wireframe in Google Docs</h2>
      
      <p>Yesterday you joined Pipewriter. Today, I'll show you exactly how to wireframe in Google Docs (it's easier than you think).</p>
      
      <div class="step">
        <div style="display: flex; align-items: flex-start;">
          <div class="step-number">1</div>
          <div>
            <h3 style="margin-top: 0;">Install the add-on</h3>
            <p><span class="arrow">→</span>Go to workspace.google.com/marketplace/app/pipewriter<br>
            <span class="arrow">→</span>Click "Install" and authorize with Google<br>
            <span class="arrow">→</span>Open any Google Doc and look for Pipewriter in the sidebar</p>
          </div>
        </div>
      </div>

      <div class="step">
        <div style="display: flex; align-items: flex-start;">
          <div class="step-number">2</div>
          <div>
            <h3 style="margin-top: 0;">Drop your first element</h3>
            <p><span class="arrow">→</span>Click any wireframe element (start with "Hero" - it's free)<br>
            <span class="arrow">→</span>Watch it appear in your doc as a clean table<br>
            <span class="arrow">→</span>Edit the text directly in the table</p>
          </div>
        </div>
      </div>

      <div class="step">
        <div style="display: flex; align-items: flex-start;">
          <div class="step-number">3</div>
          <div>
            <h3 style="margin-top: 0;">Build your wireframe</h3>
            <p><span class="arrow">→</span>Add more elements (cards, buttons, lists)<br>
            <span class="arrow">→</span>Stack them vertically like building blocks<br>
            <span class="arrow">→</span>Use the "Chain Mode" to drop multiple elements quickly</p>
          </div>
        </div>
      </div>

      <p><strong>That's it!</strong> You just created a wireframe that clients can review, comment on, and approve - all in Google Docs.</p>
      
      <div style="text-align: center;">
        <a href="https://workspace.google.com/marketplace/app/pipewriter" class="cta-button">Try It Now</a>
      </div>

      <div class="pro-tip">
        <strong>💡 Pro tip:</strong> Start with the "Hero + 3 Cards + Button" pattern. It works for 80% of landing pages.
      </div>
      
      <p>Questions? Just reply to this email.</p>
      
      <p>Talk soon,<br><strong>Ivan</strong></p>
      
      <p><strong>P.S.</strong> Tomorrow: I'll show you how Sarah used this technique to increase her project rates by 40% (true story).</p>
      
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

	variables: ['email', 'name'],
	active: true,
	metadata: {
		tier: 'system',
		tags: ['onboarding', 'tutorial', 'sequence', 'how-to'],
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