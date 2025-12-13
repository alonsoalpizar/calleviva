// Landing Page - CalleViva

import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export function Landing() {
  const { player } = useAuthStore()

  return (
    <div className="min-h-screen bg-crema">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-coral via-papaya to-mango min-h-[90vh] flex flex-col items-center justify-center p-5 overflow-hidden">
        {/* Decoración */}
        <div className="absolute top-[10%] left-[5%] text-8xl opacity-20 -rotate-12 select-none">🌮</div>
        <div className="absolute bottom-[15%] right-[8%] text-7xl opacity-20 rotate-12 select-none">🍦</div>
        <div className="absolute top-[20%] right-[15%] text-6xl opacity-20 select-none">☀️</div>
        <div className="absolute bottom-[30%] left-[12%] text-5xl opacity-20 rotate-6 select-none">🚚</div>

        {/* Logo */}
        <div className="bg-white/95 backdrop-blur rounded-3xl px-12 py-10 shadow-2xl text-center mb-8 z-10">
          <div className="text-7xl mb-4">🚚</div>
          <h1 className="font-nunito text-6xl font-black text-carbon mb-2 tracking-tight">
            Calle<span className="text-coral">Viva</span>
          </h1>
          <p className="font-nunito text-xl font-bold text-terracota">
            ¡La calle está viva!
          </p>
        </div>

        {/* Descripción */}
        <p className="text-white text-xl font-semibold text-center max-w-lg mb-8 z-10 drop-shadow-lg">
          Gestioná tu Food Truck, conquistá la ciudad y convertite en leyenda de la calle
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 z-10">
          {player ? (
            <Link to="/game" className="btn-primary text-lg px-10 py-4 shadow-xl">
              🎮 Jugar Ahora
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 shadow-xl">
                🎮 Empezar Gratis
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-8 py-4 shadow-xl">
                Ya tengo cuenta
              </Link>
            </>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 animate-bounce text-white text-3xl">
          ↓
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black text-carbon text-center mb-12">
            ¿Qué es CalleViva?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="🚚"
              title="Tu Food Truck"
              description="Elegí tu tipo de comida, diseñá tu menú y personalizá tu camión para destacar."
            />
            <FeatureCard
              emoji="🗺️"
              title="Ciudad Dinámica"
              description="Explorá ubicaciones, descubrí eventos y adaptate al clima y tendencias."
            />
            <FeatureCard
              emoji="👥"
              title="Clientes Autónomos"
              description="Cada cliente tiene personalidad única y comportamiento propio. ¡Sorprendete!"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-5 bg-crema">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-carbon mb-12">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            <Step number="1" title="Registrate" description="Creá tu cuenta gratis" />
            <Step number="2" title="Elegí tu mundo" description="Costa Rica, México, o más" />
            <Step number="3" title="Abrí tu Food Truck" description="Comprá ingredientes y cociná" />
            <Step number="4" title="Conquistá la calle" description="Ganá dinero y reputación" />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-5 bg-gradient-to-r from-agua to-hoja text-white text-center">
        <h2 className="text-3xl font-black mb-4">¿Listo para la aventura?</h2>
        <p className="text-xl mb-8 opacity-90">Empezá gratis hoy mismo</p>
        {!player && (
          <Link to="/register" className="bg-white text-agua font-bold text-lg px-10 py-4 rounded-xl shadow-xl hover:scale-105 transition-transform inline-block">
            🚚 Crear mi Food Truck
          </Link>
        )}
      </section>

      {/* Footer */}
      <footer className="py-8 px-5 bg-carbon text-white text-center">
        <p className="opacity-80">🇨🇷 Hecho en Costa Rica</p>
        <p className="opacity-60 text-sm mt-2">✨ Inspirado por Nacho ✨</p>
        <p className="opacity-40 text-xs mt-4">© 2025 CalleViva.club</p>
      </footer>
    </div>
  )
}

function FeatureCard({ emoji, title, description }: { emoji: string; title: string; description: string }) {
  return (
    <div className="bg-crema rounded-2xl p-8 text-center hover:shadow-lg transition-shadow">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-xl font-bold text-carbon mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-coral text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
        {number}
      </div>
      <h3 className="font-bold text-carbon mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  )
}
