import React from 'react';
import usePermissions from './usePermissions.js';

const RoleGuard = ({ roles = [], children, fallback = null }) => {
  const { hasAny } = usePermissions();
  if (!roles || roles.length === 0) return children;
  return hasAny(roles) ? children : fallback;
};

export default RoleGuard;
