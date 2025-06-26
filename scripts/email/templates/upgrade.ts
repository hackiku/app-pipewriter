// scripts/email/templates/upgrade.ts
export const upgradeTemplate = {
	id: 'upgrade',
	name: 'Upgrade Email',
	subject: "How Sarah increased her project rates by 40% 💰",
	previewText: 'True story: One wireframe changed everything...',

	text: `
Hey {{name || 'there'}}!

True story time.

Sarah is a UX writer in Portland who was charging $3,500 for landing page projects. Good money, but she wanted more.

The problem? Her deliverables looked like this:
→ 15-page Word doc with copy
→ Separate wireframe mockups in Figma
→ Endless revision cycles because clients couldn't visualize the connection

Then she discovered Pipewriter.

Now her deliverables look like this:
→ Single Google Doc with wireframes + copy
→ Clients can comment directly on layouts
→ Zero confusion, faster approvals

Result: She raised her rates to $4,900 per project.

40% increase. Same work. Better process.

Here's what she told me:

"Clients finally see me as a strategist, not just a copywriter. The wireframes make them realize I'm thinking about the whole user experience, not just words."

Want the same results?

Your 14-day trial is waiting: https://workspace.google.com/marketplace/app/pipewriter

Pro features include:
→ 90+ wireframe elements (vs 24 free)
→ Dark mode for client presentations
→ Advanced table styling
→ Priority email support

The math is simple: One $500 rate increase pays for Pipewriter for 4+ years.

Ready to level up?

Start your trial: https://workspace.google.com/marketplace/app/pipewriter

Cheering you on,
Ivan

P.S. Sarah now books 2 months out and turns down projects under $5K. The wireframes changed how clients see her expertise. Could be you next.

---
© 2025 Pipewriter | You're receiving this because you signed up for updates.
Unsubscribe: https://pipewriter.io/unsubscribe?email={{email}}
  `.trim(),

	html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>How Sarah increased her rates by 40%</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2d3748; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%); color: white; padding: 20px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .arrow { color: #3644FE; font-weight: bold; margin-right: 8px; }
    .before-after { display: flex; gap: 20px; margin: 20px 0; }
    .before, .after { flex: 1; padding: 15px; border-radius: 8px; }
    .before { background: #fef2f2; border: 1px solid #fecaca; }
    .after { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .quote { background: #f8fafc; border-left: 4px solid #3644FE; padding: 20px; margin: 20px 0; border-radius: 4px; font-style: italic; }
    .highlight { color: #3644FE; font-weight: 600; }
    .price-change { font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; }
    .features-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    @media (max-width: 600px) { .before-after { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Success Story</h1>
      <p>How one writer increased her rates by 40%</p>
    </div>
    <div class="content">
      <h2>How Sarah increased her project rates by 40%</h2>
      
      <p><strong>True story time.</strong></p>

      <p>Sarah is a UX writer in Portland who was charging $3,500 for landing page projects. Good money, but she wanted more.</p>

      <p><strong>The problem?</strong> Her deliverables looked like this:</p>

      <div class="before-after">
        <div class="before">
          <h4 style="margin-top: 0; color: #dc2626;">❌ Before Pipewriter</h4>
          <p><span class="arrow">→</span>15-page Word doc with copy<br>
          <span class="arrow">→</span>Separate wireframe mockups in Figma<br>
          <span class="arrow">→</span>Endless revision cycles because clients couldn't visualize the connection</p>
        </div>
        
        <div class="after">
          <h4 style="margin-top: 0; color: #16a34a;">✅ After Pipewriter</h4>
          <p><span class="arrow">→</span>Single Google Doc with wireframes + copy<br>
          <span class="arrow">→</span>Clients can comment directly on layouts<br>
          <span class="arrow">→</span>Zero confusion, faster approvals</p>
        </div>
      </div>

      <div class="price-change">
        <span style="color: #dc2626;">$3,500</span> → <span style="color: #16a34a;">$4,900</span>
        <div style="font-size: 16px; color: #6b7280; font-weight: normal;">40% increase. Same work. Better process.</div>
      </div>

      <div class="quote">
        <p>"Clients finally see me as a strategist, not just a copywriter. The wireframes make them realize I'm thinking about the whole user experience, not just words."</p>
        <p style="margin-bottom: 0;"><strong>— Sarah K., Portland</strong></p>
      </div>

      <p><strong>Want the same results?</strong></p>

      <p>Your 14-day trial is waiting. Pro features include:</p>

      <div class="features-box">
        <p><span class="arrow">→</span><strong>90+ wireframe elements</strong> (vs 24 free)<br>
        <span class="arrow">→</span><strong>Dark mode</strong> for client presentations<br>
        <span class="arrow">→</span><strong>Advanced table styling</strong><br>
        <span class="arrow">→</span><strong>Priority email support</strong></p>
      </div>

      <p><span class="highlight">The math is simple:</span> One $500 rate increase pays for Pipewriter for 4+ years.</p>

      <div style="text-align: center;">
        <a href="https://workspace.google.com/marketplace/app/pipewriter" class="cta-button">Start Your Trial</a>
      </div>
      
      <p>Cheering you on,<br><strong>Ivan</strong></p>
      
      <p><strong>P.S.</strong> Sarah now books 2 months out and turns down projects under $5K. The wireframes changed how clients see her expertise. Could be you next.</p>
      
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
		tags: ['onboarding', 'social-proof', 'upgrade', 'sequence', 'case-study'],
		category: 'onboarding',
		version: '1.0'
	},
	templateEngine: 'mustache',
	estimatedReadTime: '3 minutes',
	usage: 0,
	lastSentAt: null,
	createdAt: new Date(),
	updatedAt: new Date()
};