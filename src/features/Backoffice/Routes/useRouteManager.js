import { useState, useEffect, useCallback } from 'react';
import { getAllRoutes, createRoute, updateRoute, deleteRoute } from '../../../services/routeConfigService.js';
import { logAction } from '../../../services/auditService.js';

export const useRouteManager = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getAllRoutes();
    if (err) {
      setError(err.message || 'Erro ao carregar rotas');
    } else {
      setRoutes(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (routeData) => {
    const { data, error: err } = await createRoute(routeData);
    if (!err) {
      await logAction({ action: 'CREATE', entity: 'route_config', newValue: routeData });
      await load();
    }
    return { data, error: err };
  };

  const handleUpdate = async (id, updates) => {
    const old = routes.find(r => r.id === id);
    const { data, error: err } = await updateRoute(id, updates);
    if (!err) {
      await logAction({ action: 'UPDATE', entity: 'route_config', entityId: id, oldValue: old, newValue: updates });
      await load();
    }
    return { data, error: err };
  };

  const handleDelete = async (id) => {
    const old = routes.find(r => r.id === id);
    const { error: err } = await deleteRoute(id);
    if (err) {
      // FK violation (código 23503): a rota tem dados históricos em psm_data
      if (err.code === '23503') {
        return {
          error: {
            ...err,
            message: `Não é possível eliminar a rota "${old?.route_name}" porque tem dados históricos registados. Desactive-a em vez de eliminar.`,
          },
        };
      }
      return { error: err };
    }
    await logAction({ action: 'DELETE', entity: 'route_config', entityId: id, oldValue: old });
    await load();
    return { error: null };
  };

  const toggleActive = async (id, currentActive) => {
    return handleUpdate(id, { is_active: !currentActive });
  };

  return {
    routes,
    loading,
    error,
    reload: load,
    createRoute: handleCreate,
    updateRoute: handleUpdate,
    deleteRoute: handleDelete,
    toggleActive,
  };
};
