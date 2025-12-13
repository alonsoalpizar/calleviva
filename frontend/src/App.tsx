import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Screens (por implementar)
import { MainMenu } from './components/game/MainMenu'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        {/* Futuras rutas */}
        {/* <Route path="/game/:id" element={<GameScreen />} /> */}
        {/* <Route path="/game/:id/map" element={<MapScreen />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
