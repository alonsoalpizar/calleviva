// Customer3D.tsx - 3D Customer with walking animation
// Uses simple geometry, can be replaced with animated GLTF later

import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3 } from 'three'
import { Html } from '@react-three/drei'
import { Customer3DState } from './types'

interface Customer3DProps {
  customer: Customer3DState
  onReachTarget?: (id: string) => void
}

export const Customer3D: React.FC<Customer3DProps> = ({ customer, onReachTarget }) => {
  const groupRef = useRef<Group>(null)
  const currentPos = useRef(new Vector3(customer.position.x, customer.position.y, customer.position.z))
  const walkPhase = useRef(0)

  const targetPos = useMemo(
    () => new Vector3(customer.targetPosition.x, customer.targetPosition.y, customer.targetPosition.z),
    [customer.targetPosition]
  )

  useFrame((state, delta) => {
    if (!groupRef.current) return

    const speed = 1.5 // units per second

    // Move towards target
    if (customer.state === 'walking' || customer.state === 'leaving') {
      const direction = targetPos.clone().sub(currentPos.current)
      const distance = direction.length()

      if (distance > 0.1) {
        direction.normalize()
        const movement = direction.multiplyScalar(speed * delta)
        currentPos.current.add(movement)

        // Rotate to face direction
        const angle = Math.atan2(direction.x, direction.z)
        groupRef.current.rotation.y = angle

        // Walking animation
        walkPhase.current += delta * 10
      } else if (customer.state === 'walking') {
        onReachTarget?.(customer.id)
      }
    }

    // Apply position
    groupRef.current.position.copy(currentPos.current)

    // Idle bobbing when waiting
    if (customer.state === 'waiting' || customer.state === 'ordering') {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + customer.id.charCodeAt(0)) * 0.03
    }
  })

  const legOffset = Math.sin(walkPhase.current) * 0.15
  const armOffset = Math.sin(walkPhase.current + Math.PI) * 0.2
  const bodyColor = customer.type?.color || '#4FC3F7'

  return (
    <group ref={groupRef} position={[customer.position.x, customer.position.y, customer.position.z]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.3, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#FFDAB9" />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4A3728" />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.07, 0.15, legOffset]} castShadow>
        <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
        <meshStandardMaterial color="#2D3436" />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.07, 0.15, -legOffset]} castShadow>
        <capsuleGeometry args={[0.05, 0.2, 4, 8]} />
        <meshStandardMaterial color="#2D3436" />
      </mesh>

      {/* Left arm */}
      <mesh position={[-0.22, 0.5, armOffset * 0.5]} rotation={[armOffset, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.04, 0.15, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Right arm */}
      <mesh position={[0.22, 0.5, -armOffset * 0.5]} rotation={[-armOffset, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.04, 0.15, 4, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* Speech bubble when ordering */}
      {customer.state === 'ordering' && (
        <Html position={[0, 1.4, 0]} center>
          <div
            style={{
              background: 'white',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'Nunito, sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            Un pinto, por favor!
          </div>
        </Html>
      )}

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

export default Customer3D
