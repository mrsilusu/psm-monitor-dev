import React from 'react';
import { Edit2, UserX, UserCheck } from 'lucide-react';

const UserCard = ({ user, onEdit, onDeactivate }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
    <div className="min-w-0">
      <p className="font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
      <p className="text-xs text-gray-500 truncate">{user.email}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
          user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
          user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {user.role || 'viewer'}
        </span>
        {user.is_active === false && (
          <span className="text-xs text-red-500">inativo</span>
        )}
      </div>
    </div>
    <div className="flex gap-1 ml-3 shrink-0">
      <button
        onClick={() => onEdit(user)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      {user.is_active !== false && (
        <button
          onClick={() => onDeactivate(user.id)}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <UserX className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

export default UserCard;
