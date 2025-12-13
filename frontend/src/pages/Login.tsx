// Login Page - CalleViva

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function Login() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/game')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral via-papaya to-mango flex items-center justify-center p-5">
      {/* Decoración */}
      <div className="absolute top-[10%] left-[5%] text-6xl opacity-20 -rotate-12 select-none">🌮</div>
      <div className="absolute bottom-[15%] right-[8%] text-5xl opacity-20 rotate-12 select-none">🍦</div>

      <div className="bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl w-full max-w-md">
        {/* Header */}
        <Link to="/" className="block text-center mb-8">
          <div className="text-5xl mb-2">🚚</div>
          <h1 className="font-nunito text-3xl font-black text-carbon">
            Calle<span className="text-coral">Viva</span>
          </h1>
        </Link>

        <h2 className="text-2xl font-bold text-carbon text-center mb-6">
          Iniciar Sesión
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-carbon mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-carbon mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary-lg"
          >
            {isLoading ? 'Entrando...' : '🎮 Entrar al Juego'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-coral font-bold hover:underline">
              Registrate gratis
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-coral">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
