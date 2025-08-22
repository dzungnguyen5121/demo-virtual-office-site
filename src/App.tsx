import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import { Overview } from './pages/dashboard/Overview'
import ManageCallsPage from './pages/dashboard/ManageCalls'
import ManageDocumentsPage from './pages/dashboard/ManageDocuments'
import { SettingsPage } from './pages/dashboard/SettingsPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'

function App() {
  return (
    <Router future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}>
      <AuthProvider>
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
      </AuthProvider>
    </Router>
  )
}

export default App
