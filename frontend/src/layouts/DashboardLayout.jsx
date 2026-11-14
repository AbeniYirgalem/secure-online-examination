import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, Bell, User, ShieldCheck } from 'lucide-react';
import Sidebar from '../components/common/Sidebar';

export default function DashboardLayout({
  navItems = [],
  userRole = 'Portal',
  userName = 'Authorized User',
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Reusable Sidebar */}
      <Sidebar
        items={navItems}
        userRole={userRole}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
              <Link to="/" className="hover:text-blue-600">SOES</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">{userRole} Workspace</span>
            </div>
          </div>

          {/* User & Notifications Placeholder */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

            <div className="flex items-center space-x-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs border border-blue-200">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{userName}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{userRole}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Page View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
