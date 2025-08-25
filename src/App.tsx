import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage'));
const Dashboard = lazy(() => import('./pages/client/Dashboard'));
const Overview = lazy(() => import('./pages/client/dashboard/Overview').then(m => ({ default: m.Overview })));
const ManageCallsPage = lazy(() => import('./pages/client/dashboard/ManageCalls'));
const ManageDocumentsPage = lazy(() => import('./pages/client/dashboard/ManageDocuments'));
const SettingsPage = lazy(() => import('./pages/client/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));
const BillingPage = lazy(() => import('./pages/client/dashboard/Billing'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/client/ProfilePage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminChatPage = lazy(() => import('./pages/admin/AdminChatPage'));
const AdminApprovalPage = lazy(() => import('./pages/admin/AdminApprovalPage'));
const AdminCommissionsPage = lazy(() => import('./pages/admin/AdminCommissions.tsx'));
const AdminPromotionsPage = lazy(() => import('./pages/admin/AdminPromotions.tsx'));
const AdminReminderPage = lazy(() => import('./pages/admin/AdminReminder.tsx'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettings.tsx'));
const PaymentPageOld = lazy(() => import('./pages/client/dashboard/settings/payment_old'));


import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import AdminPrivateRoute from './components/AdminPrivateRoute'

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <AuthProvider>
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <AdminPrivateRoute>
                  <AdminDashboardPage />
                </AdminPrivateRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
              <Route path="users" element={<AdminChatPage />} />
              <Route path="approvals" element={<AdminApprovalPage />} />
              <Route path="commissions" element={<AdminCommissionsPage />} />
              <Route path="promotions" element={<AdminPromotionsPage />} />
              <Route path="reminder" element={<AdminReminderPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="calls" element={<ManageCallsPage />} />
              <Route path="docs" element={<ManageDocumentsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="billing" element={<BillingPage />} />
            </Route>
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Dashboard>
                    <ProfilePage />
                  </Dashboard>
                </PrivateRoute>
              }
            />
            <Route path="/payment-old" element={<PaymentPageOld />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  )
}

export default App
