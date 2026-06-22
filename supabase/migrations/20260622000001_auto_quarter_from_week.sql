-- Migration: Auto-assign quarter based on week number
-- Q1: W1–W18 | Q2: W19–W35 | Q3: W36–W52
--
-- Problem: frontend was passing selectedQuarter from UI, which could be wrong
-- (e.g., saving W25 data while Q1 was selected in the filter).
-- Solution: trigger forces correct quarter on every INSERT/UPDATE.

-- ============================================================
-- 1. SHARED FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION assign_quarter_from_week()
RETURNS TRIGGER AS $$
DECLARE
  week_num INT;
BEGIN
  -- Extract numeric part from 'W1'..'W52'
  week_num := CAST(SUBSTRING(NEW.week FROM 2) AS INT);

  IF week_num BETWEEN 1 AND 18 THEN
    NEW.quarter := 'Q1';
  ELSIF week_num BETWEEN 19 AND 35 THEN
    NEW.quarter := 'Q2';
  ELSIF week_num BETWEEN 36 AND 52 THEN
    NEW.quarter := 'Q3';
  ELSE
    -- Invalid week number: keep whatever was sent (fail-safe)
    NEW.quarter := COALESCE(NEW.quarter, 'Q1');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. TRIGGER ON psm_data
-- ============================================================

DROP TRIGGER IF EXISTS set_quarter_on_psm_data ON psm_data;

CREATE TRIGGER set_quarter_on_psm_data
  BEFORE INSERT OR UPDATE ON psm_data
  FOR EACH ROW
  EXECUTE FUNCTION assign_quarter_from_week();

-- ============================================================
-- 3. TRIGGER ON psm_distribuicao_reparacoes
-- ============================================================

DROP TRIGGER IF EXISTS set_quarter_on_psm_distribuicao ON psm_distribuicao_reparacoes;

CREATE TRIGGER set_quarter_on_psm_distribuicao
  BEFORE INSERT OR UPDATE ON psm_distribuicao_reparacoes
  FOR EACH ROW
  EXECUTE FUNCTION assign_quarter_from_week();

-- ============================================================
-- 4. CORRECT EXISTING DATA
-- ============================================================

UPDATE psm_data
SET quarter = CASE
  WHEN CAST(SUBSTRING(week FROM 2) AS INT) BETWEEN 1  AND 18 THEN 'Q1'
  WHEN CAST(SUBSTRING(week FROM 2) AS INT) BETWEEN 19 AND 35 THEN 'Q2'
  WHEN CAST(SUBSTRING(week FROM 2) AS INT) BETWEEN 36 AND 52 THEN 'Q3'
  ELSE quarter
END;

UPDATE psm_distribuicao_reparacoes
SET quarter = CASE
  WHEN CAST(SUBSTRING(week FROM 2) AS INT) BETWEEN 1  AND 18 THEN 'Q1'
  WHEN CAST(SUBSTRING(week FROM 2) AS INT) BETWEEN 19 AND 35 THEN 'Q2'
  WHEN CAST(SUBSTRING(week FROM 2) AS INT) BETWEEN 36 AND 52 THEN 'Q3'
  ELSE quarter
END;
