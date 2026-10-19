import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ItemsProvider } from './context/ItemsContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DemoBanner } from './components/layout/DemoBanner';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { ToastContainer } from './components/ui/Toast';

import { HomePage } from './pages/HomePage';
import { ReportLostPage } from './pages/ReportLostPage';
import { ReportFoundPage } from './pages/ReportFoundPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { LostItemsPage } from './pages/LostItemsPage';
import { MatchResultsPage } from './pages/MatchResultsPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ContactRequestsPage } from './pages/ContactRequestsPage';
import { MessagesPage } from './pages/MessagesPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfilePage } from './pages/ProfilePage';
import { SetupGuidePage } from './pages/SetupGuidePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ItemsProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 selection:text-brand-900">
              <DemoBanner />
              <Navbar />

              <main className="flex-1">
                <Routes>
                  {/* Public Core Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/found-items" element={<FoundItemsPage />} />
                  <Route path="/lost-items" element={<LostItemsPage />} />
                  <Route path="/items/:id" element={<ItemDetailPage />} />
                  <Route path="/report-lost" element={<ReportLostPage />} />
                  <Route path="/report-found" element={<ReportFoundPage />} />
                  <Route path="/matches/:id" element={<MatchResultsPage />} />
                  <Route path="/setup" element={<SetupGuidePage />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />

                  {/* User Dashboard & Inquiries */}
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/requests" element={<ContactRequestsPage />} />
                  <Route path="/messages/:id" element={<MessagesPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Admin Moderation Console */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requireAdmin>
                        <AdminPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
              <ToastContainer />
            </div>
          </ItemsProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
