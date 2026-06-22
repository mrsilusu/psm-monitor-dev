-- Migration: Remove psm_data rows where route doesn't belong to the PSM
--
-- Problem: dynamic PSMs had routes from static PSMs (e.g. FIBRASOL) saved
-- in psm_data due to missing PSM-route validation at save time.
-- Fix: delete any row in psm_data where there is no matching (psm, route_name)
-- entry in route_config — the authoritative source for PSM-route membership.
--
-- Safe to run multiple times (idempotent via NOT EXISTS).

DELETE FROM psm_data
WHERE NOT EXISTS (
  SELECT 1
  FROM route_config rc
  WHERE rc.psm        = psm_data.psm
    AND rc.route_name = psm_data.route
);

-- Same cleanup for psm_distribuicao_reparacoes
DELETE FROM psm_distribuicao_reparacoes
WHERE NOT EXISTS (
  SELECT 1
  FROM route_config rc
  WHERE rc.psm        = psm_distribuicao_reparacoes.psm
    AND rc.route_name = psm_distribuicao_reparacoes.route
);
