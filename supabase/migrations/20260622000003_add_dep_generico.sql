-- Migration: Add dep_generico column for dynamic PSMs' "Fibras dependentes"
--
-- Problem: dep_isistel was being reused as a generic column for dynamic PSMs,
-- creating ambiguity (a row with psm='TELCABO' and dep_isistel=5 is misleading).
--
-- Solution: dedicated dep_generico column for all non-static PSMs.
-- Static PSMs (ISISTEL, FIBRASOL, ANGLOBAL) keep their own columns.
-- Dynamic PSMs use dep_generico for "Fibras dependentes da [PSM]".

ALTER TABLE psm_data
  ADD COLUMN IF NOT EXISTS dep_generico INT NOT NULL DEFAULT 0;

-- Move dynamic PSM fibras data from dep_isistel → dep_generico, then clear dep_isistel
UPDATE psm_data
SET
  dep_generico = dep_isistel,
  dep_isistel  = 0
WHERE psm NOT IN ('ISISTEL', 'FIBRASOL', 'ANGLOBAL')
  AND dep_isistel != 0;
