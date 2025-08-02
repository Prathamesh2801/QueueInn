import React from 'react'
import FloatingOrb from './FloatingOrb'

export default function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <FloatingOrb position={[-2, 0, -2]} color="#3b82f6" speed={0.8} />
      <FloatingOrb position={[2, -1, -3]} color="#8b5cf6" speed={1.2} />
      <FloatingOrb position={[0, 2, -1]} color="#06b6d4" speed={0.6} />
    </>
  )
}
