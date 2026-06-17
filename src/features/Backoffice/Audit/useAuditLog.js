import { useState, useCallback } from 'react';
import { getAuditLog } from '../../../services/auditService.js';

const PAGE_SIZE = 50;

export const useAuditLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState({
    userId: null,
    entity: null,
    dateFrom: null,
    dateTo: null,
  });

  const load = useCallback(async (overrideFilters, overridePage) => {
    setLoading(true);
    setError(null);
    const activeFilters = overrideFilters !== undefined ? overrideFilters : filters;
    const activePage = overridePage !== undefined ? overridePage : page;
    const { data, error: err, count } = await getAuditLog({
      ...activeFilters,
      page: activePage,
      pageSize: PAGE_SIZE,
    });
    if (err) {
      setError(err.message);
    } else {
      setEntries(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [filters, page]);

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(0);
    load(newFilters, 0);
  };

  const goToPage = (newPage) => {
    setPage(newPage);
    load(undefined, newPage);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    entries,
    loading,
    error,
    total,
    page,
    totalPages,
    filters,
    load,
    applyFilters,
    goToPage,
  };
};
