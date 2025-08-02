import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function FloatingOrb({ position, color, speed = 1 }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
                color={color}
                transparent
                opacity={0.6}
                emissive={color}
                emissiveIntensity={0.2}
            />
        </mesh>
    );
}

