import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { DEMO_PERSONAS } from '../../lib/constants';
import {
  Search,
  PlusCircle,
  Bell,
  User,
  Shield,
  Menu,
  X,
  Compass,
  FileText,
  Sliders,
  CheckCircle,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, logout, activePersona, switchPersona, isAdmin } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Browse Found', href: '/found-items', icon: Compass },
    { label: 'Lost Reports', href: '/lost-items', icon: FileText },
    { label: 'Dashboard', href: '/dashboard', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-navy-900">
                  LOSTANDFOUND
                </span>
                <span className="bg-brand-600 text-white font-bold text-[10px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-tight -mt-1 hidden sm:block">
                Visual Image Matching Platform
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="h-4 w-4 text-purple-600" />
                <span>Admin</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Action Buttons & Profile Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Quick CTA */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link to="/report-lost">
              <Button size="sm" variant="danger" className="gap-1.5 font-semibold">
                <Search className="h-3.5 w-3.5" />
                <span>Lost Item</span>
              </Button>
            </Link>

            <Link to="/report-found">
              <Button size="sm" variant="primary" className="gap-1.5 font-semibold">
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Found Item</span>
              </Button>
            </Link>
          </div>

          {/* Demo Persona Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setPersonaMenuOpen(!personaMenuOpen);
                setNotifMenuOpen(false);
              }}
              title="Switch demo persona for testing"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden lg:inline text-slate-500">Persona:</span>
              <span className="font-semibold text-navy-900 truncate max-w-[100px]">
                {activePersona ? activePersona.fullName.split(' ')[0] : 'Guest'}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-navy-900">Interactive Demo Personas</p>
                  <p className="text-[11px] text-slate-500">
                    Switch roles to test reporter, finder, and admin moderation flows instantly:
                  </p>
                </div>
                <div className="py-1 space-y-1">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setPersonaMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        activePersona?.id === p.id
                          ? 'bg-brand-50 border border-brand-200'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 truncate">{p.fullName}</p>
                          <Badge
                            variant={p.role === 'admin' ? 'navy' : 'secondary'}
                            className="text-[10px] px-1 py-0"
                          >
                            {p.role}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug line-clamp-1">
                          {p.description}
                        </p>
                      </div>
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      switchPersona(null);
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs font-medium text-slate-600 hover:bg-slate-50`}
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Browse as Unauthenticated Guest</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* In-App Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifMenuOpen(!notifMenuOpen);
                setPersonaMenuOpen(false);
              }}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-2 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-navy-900">Notifications</span>
                  <span className="text-[11px] text-brand-600 font-semibold">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 py-1">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-center text-slate-400">No notifications yet</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.linkUrl) navigate(n.linkUrl);
                          setNotifMenuOpen(false);
                        }}
                        className={`p-2.5 text-xs rounded-lg cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-blue-50/60 font-medium' : 'hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-semibold text-slate-900">{n.title}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile" className="flex items-center gap-1.5 group">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover border border-slate-200 ring-2 ring-transparent group-hover:ring-brand-500 transition-all"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs">
                    {user.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" variant="outline">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100">
            <Link to="/report-lost" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="danger" className="w-full justify-center">
                Lost Item
              </Button>
            </Link>
            <Link to="/report-found" onClick={() => setMobileMenuOpen(false)}>
              <Button size="sm" variant="primary" className="w-full justify-center">
                Found Item
              </Button>
            </Link>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-purple-700 bg-purple-50"
              >
                Admin Moderation
              </Link>
            )}

            <Link
              to="/setup"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Setup Guide & AI Config
            </Link>
          </div>

          {user && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{user.email}</span>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 text-xs text-rose-600 font-medium"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
