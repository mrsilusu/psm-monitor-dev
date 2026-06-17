import { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deactivateUser } from '../../../services/userService.js';
import { logAction } from '../../../services/auditService.js';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getUsers();
    if (err) {
      setError(err.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (userData) => {
    const { data, error: err } = await createUser(userData);
    if (err) return { error: err };
    await logAction({ action: 'CREATE', entity: 'user_profile', entityId: data?.[0]?.id, newValue: userData });
    await loadUsers();
    return { data };
  };

  const handleUpdateUser = async (id, updates) => {
    const prev = users.find(u => u.id === id);
    const { data, error: err } = await updateUser(id, updates);
    if (err) return { error: err };
    await logAction({ action: 'UPDATE', entity: 'user_profile', entityId: id, oldValue: prev, newValue: updates });
    await loadUsers();
    return { data };
  };

  const handleDeactivateUser = async (id) => {
    const { data, error: err } = await deactivateUser(id);
    if (err) return { error: err };
    await logAction({ action: 'DEACTIVATE', entity: 'user_profile', entityId: id });
    await loadUsers();
    return { data };
  };

  return {
    users,
    loading,
    error,
    reload: loadUsers,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deactivateUser: handleDeactivateUser,
  };
};
