// MainMenu.tsx
// Pantalla principal de CalleViva

export function MainMenu() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mango via-papaya to-coral flex flex-col items-center justify-center p-5 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-[10%] left-[5%] text-7xl opacity-30 -rotate-12">🌮</div>
      <div className="absolute bottom-[15%] right-[8%] text-6xl opacity-30 rotate-12">🍦</div>
      <div className="absolute top-[20%] right-[15%] text-5xl opacity-30">☀️</div>
      
      {/* Logo */}
      <div className="bg-white rounded-3xl px-12 py-10 shadow-2xl text-center mb-10">
        <div className="text-6xl mb-3">🚚</div>
        <h1 className="font-nunito text-5xl font-black text-carbon mb-2 tracking-tight">
          Calle<span className="text-coral">Viva</span>
        </h1>
        <p className="font-nunito text-lg font-bold text-terracota">
          ¡La calle está viva! 🔥
        </p>
      </div>
      
      {/* Botones */}
      <div className="flex flex-col gap-4">
        <button className="btn-primary text-lg px-10 py-4">
          🎮 Nueva Partida
        </button>
        <button className="btn-secondary text-lg px-10 py-4">
          📂 Continuar
        </button>
        <button className="btn-warning text-lg px-10 py-4">
          ⚙️ Opciones
        </button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-5 text-center">
        <p className="text-white font-semibold opacity-90">
          🇨🇷 Hecho con amor en Costa Rica
        </p>
        <p className="text-white font-semibold opacity-70 text-sm mt-1">
          ✨ Inspirado por Nacho ✨
        </p>
      </div>
    </div>
  )
}
