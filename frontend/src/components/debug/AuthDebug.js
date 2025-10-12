import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { simulateAdminLogin, clearMockAuth } from '../../utils/testAuth';

const AuthDebug = () => {
  const { user, token, hasRole, isAuthenticated } = useAuth();

  const handleSimulateAdmin = () => {
    simulateAdminLogin();
    window.location.reload(); // Reload to trigger useEffect in AuthContext
  };

  const handleClearAuth = () => {
    clearMockAuth();
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold text-sm mb-2">Auth Debug Panel</h3>
      
      <div className="text-xs space-y-1 mb-3">
        <div><strong>Authenticated:</strong> {isAuthenticated() ? 'Yes' : 'No'}</div>
        <div><strong>Email:</strong> {user?.email || 'None'}</div>
        <div><strong>Roles:</strong> {JSON.stringify(user?.roles || [])}</div>
        <div><strong>Has ADMIN role:</strong> {hasRole('ADMIN') ? 'Yes' : 'No'}</div>
        <div><strong>Token exists:</strong> {token ? 'Yes' : 'No'}</div>
      </div>

      <div className="space-y-2">
        <button 
          onClick={handleSimulateAdmin}
          className="w-full bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Simulate Admin Login
        </button>
        <button 
          onClick={handleClearAuth}
          className="w-full bg-red-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear Auth
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        <div><strong>localStorage user:</strong></div>
        <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-auto max-h-20">
          {localStorage.getItem('user') || 'None'}
        </pre>
      </div>
    </div>
  );
};

export default AuthDebug;