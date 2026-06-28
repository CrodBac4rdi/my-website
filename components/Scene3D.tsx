'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function Box({ position, color }: { position: [number, number, number], color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.01;
    meshRef.current.rotation.y += 0.005;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </Float>
  );
}

function FloatingShapes() {
  const shapes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 15; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10 - 5
        ] as [number, number, number],
        color: ['#2563eb', '#db2777', '#facc15', '#22c55e'][Math.floor(Math.random() * 4)]
      });
    }
    return temp;
  }, []);

  return (
    <>
      {shapes.map((s, i) => (
        <Box key={i} position={s.position} color={s.color} />
      ))}
    </>
  );
}

export default function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#060711] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        <FloatingShapes />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060711]/80 pointer-events-none"></div>
    </div>
  );
}