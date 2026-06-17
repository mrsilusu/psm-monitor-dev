import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Settings, ChevronRight, Shield, MapPin, Plus, ArrowLeft } from 'lucide-react';
import UserList from './Users/UserList.jsx';
import UserForm from './Users/UserForm.jsx';
import AuditLog from './Audit/AuditLog.jsx';
import AppSettings from './Settings/AppSettings.jsx';
import RouteManager from './Routes/RouteManager.jsx';
import { useUsers } from './Users/useUsers.js';
import { useRouteConfig } from '../../hooks/state/useRouteConfig.js';

const NAV_ITEMS = [
  { id: 'users', label: 'Utilizadores', icon: Users },
  { id: 'routes', label: 'Rotas', icon: MapPin },
  { id: 'audit', label: 'Auditoria', icon: ClipboardList },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

const BackofficeLayout = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('users');
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const addRouteRef = useRef(null);

  const { users, loading, createUser, updateUser, deactivateUser } = useUsers();
  const { allPsms, operatorToProvinces } = useRouteConfig();

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleSave = async (formData) => {
    setFormLoading(true);
    let result;
    if (editingUser) {
      result = await updateUser(editingUser.id, formData);
    } else {
      result = await createUser(formData);
    }
    setFormLoading(false);
    if (!result.error) {
      setShowUserForm(false);
      setEditingUser(null);
    }
    return result;
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Desativar este utilizador?')) return;
    await deactivateUser(id);
  };

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Backoffice</p>
              <p className="text-xs text-gray-400">Administração</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-3 w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Visão Geral
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeSection === id
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {activeSection === id && (
                <ChevronRight className="w-3 h-3 ml-auto" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </h1>
          </div>
          {activeSection === 'users' && (
            <button
              onClick={handleNewUser}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              Novo Utilizador
            </button>
          )}
          {activeSection === 'routes' && (
            <button
              onClick={() => addRouteRef.current?.()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Rota
            </button>
          )}
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeSection === 'users' && (
            <UserList
              users={users}
              loading={loading}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
            />
          )}
          {activeSection === 'routes' && (
            <RouteManager
              onAddRoute={addRouteRef}
              allPsms={allPsms}
              operatorToProvinces={operatorToProvinces}
            />
          )}
          {activeSection === 'audit' && <AuditLog />}
          {activeSection === 'settings' && <AppSettings />}
        </div>
      </main>

      {showUserForm && (
        <UserForm
          user={editingUser}
          onSave={handleSave}
          onCancel={() => { setShowUserForm(false); setEditingUser(null); }}
          loading={formLoading}
          allPsms={allPsms}
        />
      )}
    </div>
  );
};

export default BackofficeLayout;
