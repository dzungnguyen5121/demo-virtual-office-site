import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const HomePage = lazy(() => import('./pages/HomePage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Overview = lazy(() => import('./pages/dashboard/Overview').then(m => ({ default: m.Overview })));
const ManageCallsPage = lazy(() => import('./pages/dashboard/ManageCalls'));
const ManageDocumentsPage = lazy(() => import('./pages/dashboard/ManageDocuments'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage').then(m => ({ default: m.SettingsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

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
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  )
}

export default App
