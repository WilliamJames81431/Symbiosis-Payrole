import { Link, useLocation } from 'react-router';
import { LayoutDashboard, Users, Clock, Calendar, Wallet, Settings, ShieldAlert, FileText, MapPin, Landmark, CircleDollarSign, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

const navigation = [
  // Employer / Admin / HR Routes
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'HR'] },
  { name: 'Employees', href: '/employees', icon: Users, roles: ['Admin', 'HR'] },
  { name: 'Locations', href: '/locations', icon: MapPin, roles: ['Admin', 'HR'] },
  { name: 'Attendance', href: '/attendance', icon: Clock, roles: ['Admin', 'HR'] },
  { name: 'Payroll', href: '/payroll', icon: Wallet, roles: ['Admin', 'HR'] },
  { name: 'Bank Transfer', href: '/bank-transfer', icon: Landmark, roles: ['Admin', 'HR'] },
  { name: 'Statutory', href: '/statutory', icon: ShieldAlert, roles: ['Admin', 'HR'] },
  { name: 'Wages', href: '/wages', icon: CircleDollarSign, roles: ['Admin', 'HR'] },
  { name: 'Leaves', href: '/leave', icon: Calendar, roles: ['Admin', 'HR'] },
  { name: 'Reports', href: '/reports', icon: FileText, roles: ['Admin', 'HR'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['Admin'] },

  // Employee Self-Service Routes
  { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['Employee'] },
  { name: 'My Payslips', href: '/payslips', icon: Wallet, roles: ['Employee'] },
  { name: 'My Leaves', href: '/my-leaves', icon: Calendar, roles: ['Employee'] },
  { name: 'My Profile', href: '/profile', icon: User, roles: ['Employee'] },
];

export default function Sidebar() {
  const location = useLocation();
  const userRole = useAuthStore((state) => state.userRole);
  
  const filteredNav = navigation.filter(item => item.roles.includes(userRole));

  return (
    // Forced dark mode colors on the sidebar for premium enterprise feel
    <div className="hidden md:flex w-64 flex-col bg-[#0C0C0F] text-zinc-300 border-r border-white/10 h-full transition-all duration-300 relative z-20 shadow-2xl shadow-black/50">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-white">
          <div className="w-8 h-8 bg-brand-500 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          Symbiosis
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
        <nav className="space-y-1">
          {filteredNav.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group relative flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out',
                  isActive
                    ? 'bg-[#1A1A24] text-white'
                    : 'text-zinc-400 hover:bg-[#1A1A24]/60 hover:text-zinc-200'
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 w-1 h-5 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200',
                    isActive ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 bg-[#0A0A0D]">
        <div className="flex items-center gap-3 hover:bg-[#1A1A24] p-2 rounded-lg cursor-pointer transition-colors">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-white font-semibold text-sm shadow-inner border border-white/10">
            JD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">John Doe</span>
            <span className="text-xs text-zinc-500">Super Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
