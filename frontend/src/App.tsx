import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Admin } from './pages/Admin'
import { MainMenu } from './components/game/MainMenu'
import { TruckSetup } from './components/game/TruckSetup'
import { GamePlay } from './components/game/GamePlay'
import { TruckCustomization } from './components/game/TruckCustomization'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { player } = useAuthStore()

  if (!player) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { player } = useAuthStore()

  if (!player) {
    return <Navigate to="/login" replace />
  }

  if (!player.is_admin) {
    return <Navigate to="/game" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <MainMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId/setup"
          element={
            <ProtectedRoute>
              <TruckSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId/play"
          element={
            <ProtectedRoute>
              <GamePlay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId/customize"
          element={
            <ProtectedRoute>
              <TruckCustomization />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
