// CustomerQueue.tsx - Cola de clientes animada con GSAP
import React, { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { Customer, CustomerType } from './types'

interface CustomerQueueProps {
  customers: Customer[]
  maxVisible?: number
  onCustomerClick?: (customer: Customer) => void
}

// Default customer types para demo
export const DEFAULT_CUSTOMER_TYPES: CustomerType[] = [
  { id: 'student_f', emoji: '👩‍🎓', name: 'Estudiante', preferredProducts: ['empanada', 'cafe'], patience: 6, tipChance: 0.1 },
  { id: 'student_m', emoji: '👨‍🎓', name: 'Estudiante', preferredProducts: ['gallo_pinto', 'empanada'], patience: 5, tipChance: 0.15 },
  { id: 'office_m', emoji: '👨‍💼', name: 'Oficinista', preferredProducts: ['gallo_pinto', 'agua_dulce'], patience: 4, tipChance: 0.3 },
  { id: 'office_f', emoji: '👩‍💼', name: 'Ejecutiva', preferredProducts: ['agua_dulce', 'cafe'], patience: 3, tipChance: 0.4 },
  { id: 'senior_m', emoji: '👴', name: 'Don Pedro', preferredProducts: ['agua_dulce', 'gallo_pinto'], patience: 8, tipChance: 0.2 },
  { id: 'senior_f', emoji: '👵', name: 'Doña María', preferredProducts: ['gallo_pinto', 'empanada'], patience: 8, tipChance: 0.25 },
  { id: 'worker', emoji: '👷', name: 'Trabajador', preferredProducts: ['empanada', 'gallo_pinto'], patience: 4, tipChance: 0.2 },
  { id: 'chef', emoji: '🧑‍🍳', name: 'Chef', preferredProducts: ['gallo_pinto'], patience: 5, tipChance: 0.5 },
  { id: 'tourist', emoji: '🧳', name: 'Turista', preferredProducts: ['gallo_pinto', 'agua_dulce'], patience: 7, tipChance: 0.6 },
  { id: 'kid', emoji: '👦', name: 'Niño', preferredProducts: ['empanada'], patience: 3, tipChance: 0.05 },
]

export const CustomerQueue: React.FC<CustomerQueueProps> = ({
  customers,
  maxVisible = 6,
  onCustomerClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const customerRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Animar entrada de nuevos clientes
  useEffect(() => {
    customers.forEach((customer) => {
      const el = customerRefs.current.get(customer.id)
      if (el && customer.state === 'arriving') {
        gsap.fromTo(
          el,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(1.7)',
          }
        )
      }
    })
  }, [customers])

  // Solo mostrar los primeros maxVisible
  const visibleCustomers = customers.slice(0, maxVisible)

  return (
    <div
      ref={containerRef}
      className="flex items-end gap-3 min-w-[200px] h-24 justify-end"
    >
      {visibleCustomers.map((customer) => (
        <div
          key={customer.id}
          ref={(el) => {
            if (el) customerRefs.current.set(customer.id, el)
          }}
          className="customer text-5xl cursor-pointer"
          onClick={() => onCustomerClick?.(customer)}
        >
          <div
            className={`
              emoji-shadow hover:scale-110 transition-transform
              ${customer.state === 'waiting' ? 'animate-bounce-slow' : ''}
            `}
          >
            {customer.type.emoji}
          </div>

          {/* Indicador de paciencia (opcional) */}
          {customer.state === 'waiting' && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs">
              {customer.type.patience > 5 ? '😊' : customer.type.patience > 2 ? '😐' : '😤'}
            </div>
          )}
        </div>
      ))}

      {/* Indicador de más clientes esperando */}
      {customers.length > maxVisible && (
        <div className="text-sm text-gray-500 font-bold">
          +{customers.length - maxVisible}
        </div>
      )}
    </div>
  )
}

// Componente helper para crear pop-up de venta
export const createSalePopup = (
  targetElement: HTMLElement,
  amount: number,
  emoji: string = '😋'
) => {
  const rect = targetElement.getBoundingClientRect()

  // Pop-up de dinero
  const moneyEl = document.createElement('div')
  moneyEl.className = 'pop-text text-green-500 text-xl'
  moneyEl.textContent = `+₡${amount.toLocaleString()}`
  moneyEl.style.left = `${rect.left + rect.width / 2}px`
  moneyEl.style.top = `${rect.top}px`
  document.body.appendChild(moneyEl)

  gsap.to(moneyEl, {
    y: -60,
    opacity: 0,
    duration: 1.2,
    ease: 'power1.out',
    onComplete: () => moneyEl.remove(),
  })

  // Pop-up de emoji (con delay)
  setTimeout(() => {
    const emojiEl = document.createElement('div')
    emojiEl.className = 'pop-text text-3xl'
    emojiEl.textContent = emoji
    emojiEl.style.left = `${rect.left + rect.width / 2}px`
    emojiEl.style.top = `${rect.top - 20}px`
    document.body.appendChild(emojiEl)

    gsap.to(emojiEl, {
      y: -60,
      opacity: 0,
      duration: 1.2,
      ease: 'power1.out',
      onComplete: () => emojiEl.remove(),
    })
  }, 200)
}

// Helper para generar un cliente random
export const generateRandomCustomer = (): Customer => {
  const type = DEFAULT_CUSTOMER_TYPES[Math.floor(Math.random() * DEFAULT_CUSTOMER_TYPES.length)]
  const preferredProduct = type.preferredProducts[Math.floor(Math.random() * type.preferredProducts.length)]

  return {
    id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    arrivalTime: Date.now(),
    state: 'arriving',
    preferredProduct,
  }
}

export default CustomerQueue
