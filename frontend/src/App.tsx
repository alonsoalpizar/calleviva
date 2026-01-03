import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
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
import { Market } from './components/game/Market'
import { LocationsPreview } from './pages/LocationsPreview'
import { GameSimulationDemo } from './components/simulation'
import { Game3DDemo, CharacterViewer, GameScene3D } from './components/game3d'
import AnimatedCharacterTest from './pages/AnimatedCharacterTest'
import AnimatedFullBodyTest from './pages/AnimatedFullBodyTest'
import CustomizedCharacterTest from './pages/CustomizedCharacterTest'
import SkinnedCharacterTest from './pages/SkinnedCharacterTest'
import SavedCharactersTest from './pages/SavedCharactersTest'

// Wrapper for GameScene3D with URL params
function GameScene3DWrapper() {
  const { zoneId } = useParams<{ zoneId: string }>()
  return <GameScene3D zoneId={zoneId || 'business'} />
}

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
  // Auth is automatically checked on Zustand hydration (see authStore.ts)
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Creator - Public (for Nacho!) */}
        <Route path="/creator" element={<CreatorPage />} />

        {/* Locations Preview - Public (for dev) */}
        <Route path="/locations" element={<LocationsPreview />} />

        {/* Simulation Demo - Public (for dev) */}
        <Route path="/simulation" element={<GameSimulationDemo />} />
        <Route path="/simulation/:locationCode" element={<GameSimulationDemo />} />

        {/* 3D Game Demo - Public (for dev) */}
        <Route path="/game3d" element={<Game3DDemo />} />

        {/* Character Viewer - Public (for dev) */}
        <Route path="/character-viewer" element={<CharacterViewer />} />

        {/* 3D City Zone Scene - Public (for dev) */}
        <Route path="/scene3d" element={<GameScene3D />} />
        <Route path="/scene3d/:zoneId" element={<GameScene3DWrapper />} />

        {/* Animated Character Test - Public (for dev) */}
        <Route path="/animated-character" element={<AnimatedCharacterTest />} />

        {/* Animated Full Body Test - Public (for dev) */}
        <Route path="/animated-fullbody" element={<AnimatedFullBodyTest />} />

        {/* Customized Character Test - Public (for dev) */}
        <Route path="/customized-character" element={<CustomizedCharacterTest />} />

        {/* Skinned Character Test - Public (for dev) */}
        <Route path="/skinned-character" element={<SkinnedCharacterTest />} />

        {/* Saved Characters Test - Public (for dev) */}
        <Route path="/saved-characters" element={<SavedCharactersTest />} />

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
          path="/game/:gameId/market"
          element={
            <ProtectedRoute>
              <Market />
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
