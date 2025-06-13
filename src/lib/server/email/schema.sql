-- Simple database schema for email sequences
-- Use with Supabase, PlanetScale, or any PostgreSQL database

-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100) DEFAULT 'website',
  status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email sequences table (optional - you can hardcode sequences in your app)
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual emails in a sequence
CREATE TABLE sequence_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES email_sequences(id),
  order_index INTEGER NOT NULL,
  delay_hours INTEGER NOT NULL, -- Hours after subscription
  template_name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled emails (the queue)
CREATE TABLE scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id),
  sequence_id UUID REFERENCES email_sequences(id),
  sequence_email_id UUID REFERENCES sequence_emails(id),
  scheduled_for TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, sent, failed, cancelled
  sent_at TIMESTAMP NULL,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User journeys (track where users are in sequences)
CREATE TABLE user_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id),
  sequence_id UUID REFERENCES email_sequences(id),
  current_email_index INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scheduled_emails_status_time ON scheduled_emails(status, scheduled_for);
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_user_journeys_subscriber ON user_journeys(subscriber_id);

-- Sample data for welcome sequence
INSERT INTO email_sequences (name, description) VALUES 
('welcome', 'Welcome series for new subscribers');

INSERT INTO sequence_emails (sequence_id, order_index, delay_hours, template_name, subject) VALUES 
((SELECT id FROM email_sequences WHERE name = 'welcome'), 0, 0, 'welcome', 'You''re in! (And yes, I used urgency in this subject line) 🎯'),
((SELECT id FROM email_sequences WHERE name = 'welcome'), 1, 24, 'tutorial', 'Here''s how to wireframe in Google Docs (2-min read) 📋'),
((SELECT id FROM email_sequences WHERE name = 'welcome'), 2, 72, 'social-proof', 'How Sarah increased her project rates by 40% 💰'),
((SELECT id FROM email_sequences WHERE name = 'welcome'), 3, 168, 'upgrade', 'Ready to unlock the full wireframe library? 🔓');