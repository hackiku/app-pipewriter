// src/lib/server/email/templates/welcome.ts

export function generateWelcomeEmail(email: string): {
	subject: string;
	html: string;
	text: string;
} {
	const subject = "You're in! (And yes, I used urgency in this subject line) 🎯";

	const text = `
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
Unsubscribe: https://pipewriter.io/unsubscribe?email=${encodeURIComponent(email)}
`;

	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset and base styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    
    /* Main styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2d3748;
      background-color: #f7fafc;
      margin: 0;
      padding: 0;
      width: 100% !important;
      min-width: 100%;
    }
    
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #ffffff;
    }
    
    .tagline {
      opacity: 0.9;
      font-size: 16px;
      color: #ffffff;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    h1 {
      color: #1a202c;
      margin: 0 0 20px 0;
      font-size: 24px;
      font-weight: 600;
      line-height: 1.3;
    }
    
    p {
      margin: 0 0 16px 0;
      color: #4a5568;
      font-size: 16px;
      line-height: 1.6;
    }
    
    .highlight {
      background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      font-weight: 600;
      color: #3644FE; /* Fallback for non-webkit browsers */
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3644FE 0%, #B345ED 100%);
      color: #ffffff !important;
      padding: 16px 32px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
      font-size: 16px;
    }
    
    .meta-note {
      background: #f8f9fa;
      border-left: 4px solid #3644FE;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      font-style: italic;
      color: #6b7280;
    }
    
    .next-steps {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 24px 0;
    }
    
    .arrow {
      color: #3644FE;
      font-weight: bold;
      margin-right: 8px;
    }
    
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    .footer a {
      color: #6b7280;
      text-decoration: underline;
    }
    
    /* Mobile responsive */
    @media screen and (max-width: 600px) {
      .email-container {
        margin: 10px auto;
        border-radius: 0;
      }
      .content {
        padding: 30px 20px;
      }
      .header {
        padding: 25px 20px;
      }
      .cta-button {
        padding: 14px 28px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">✍️ Pipewriter</div>
      <div class="tagline">UX App for Writers in Google Docs</div>
    </div>
    
    <div class="content">
      <h1>You're in! (And yes, I used urgency in this subject line) 🎯</h1>
      
      <p>Welcome to Pipewriter - you just joined <span class="highlight">200+ writers</span> who are tired of delivering copy in Word docs that clients judge.</p>
      
      <div class="meta-note">
        <strong>Quick confession:</strong> I'm using every copywriting trick in the book on you in these emails. Why? Because you'll appreciate the meta-ness of it. Plus, you'll see exactly how good copy converts (hint: it's working right now).
      </div>
      
      <div class="next-steps">
        <p><strong>Here's what happens next:</strong></p>
        <p><span class="arrow">→</span>You'll get access to our Google Docs add-on (14-day free trial)</p>
        <p><span class="arrow">→</span>I'll show you how to turn $12/month into $500+ project premiums</p>
        <p><span class="arrow">→</span>You'll see why clients stop asking for revisions when they see wireframes</p>
      </div>
      
      <p>Ready to wireframe where you already write?</p>
      
      <div style="text-align: center;">
        <a href="https://workspace.google.com/marketplace/app/pipewriter" class="cta-button">
          Start Your Free Trial
        </a>
      </div>
      
      <div class="signature">
        <p>To better wireframes (and higher rates),<br>
        <strong>Ivan</strong></p>
        
        <p><strong>P.S.</strong> Yes, I just used a P.S. It increases readership by 79%. See what I mean about the meta thing?</p>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 Pipewriter. You're receiving this because you signed up for updates.</p>
      <p><a href="https://pipewriter.io/unsubscribe?email=${encodeURIComponent(email)}">Unsubscribe</a> | <a href="https://pipewriter.io">Visit Website</a></p>
    </div>
  </div>
</body>
</html>
  `;

	return { subject, html, text };
}