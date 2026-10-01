import React from 'react';

export function ProtectedRoute({ children }) {
  // Direct open access: always allow rendering dashboard
  return children;
}

export default ProtectedRoute;
