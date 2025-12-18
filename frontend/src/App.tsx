import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Admin } from './pages/Admin'
import { CreatorPage } from './pages/creator/CreatorPage'
import { MainMenu } from './components/game/MainMenu'
import { TruckSetup } from './components/game/TruckSetup'
import { GamePlay } from './components/game/GamePlay'
import { TruckCustomization } from './components/game/TruckCustomization'
import { DishLaboratorio } from './components/game/DishLaboratorio'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { player, isLoading } = useAuthStore()

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-crema flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚚</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

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
  const { checkAuth } = useAuthStore()

  // Check auth on app mount (restore session from localStorage)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Creator - Public (for Nacho!) */}
        <Route path="/creator" element={<CreatorPage />} />

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
        <Route
          path="/game/:gameId/lab"
          element={
            <ProtectedRoute>
              <DishLaboratorio />
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
