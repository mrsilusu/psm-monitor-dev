CREATE TABLE IF NOT EXISTS route_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  psm TEXT NOT NULL CHECK (psm IN ('FIBRASOL', 'ISISTEL', 'ANGLOBAL')),
  route_name TEXT NOT NULL,
  province TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_psm_route UNIQUE(psm, route_name)
);
