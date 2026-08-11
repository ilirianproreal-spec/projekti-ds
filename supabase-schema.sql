-- Tabela për regjistrimet e eventeve të Trust Music
-- Ekzekutoje këtë SQL në SQL Editor të Supabase Dashboard

CREATE TABLE IF NOT EXISTS event_registrations (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  tickets    INTEGER NOT NULL DEFAULT 1,
  message    TEXT,
  event_name TEXT NOT NULL DEFAULT 'Trust Music Live',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks për kërkime
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_name);

-- Aktivizo Row Level Security
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Policy: çdokush mund të shtojë regjistrime (INSERT me anon key)
CREATE POLICY "Allow anonymous insert"
ON event_registrations
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: çdokush mund të lexojë numrin e regjistrimeve (SELECT me anon key)
CREATE POLICY "Allow anonymous select"
ON event_registrations
FOR SELECT
TO anon
USING (true);
