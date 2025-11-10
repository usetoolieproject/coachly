import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AdminThemeProvider } from '../../contexts/AdminThemeContext';

const AdminLayout: React.FC = () => {
  return (
    <AdminThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64">
          <Outlet />
        </div>
      </div>
    </AdminThemeProvider>
  );
};

export default AdminLayout;
