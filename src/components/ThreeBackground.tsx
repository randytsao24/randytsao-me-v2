import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Floating Geometry Component
function FloatingGeometry({ position, geometry, color }: { position: [number, number, number], geometry: THREE.BufferGeometry, color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.3;
    });

    return (
        <mesh ref={meshRef} position={position}>
            <primitive object={geometry} />
            <meshStandardMaterial color={color} wireframe transparent opacity={0.6} />
        </mesh>
    );
}

// Animated Particles Component
function AnimatedParticles({ count = 2000 }: { count?: number }) {
    const pointsRef = useRef<THREE.Points>(null);
    const mousePosition = useRef({ x: 0, y: 0 });

    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.3 + 0.1, 0.7, 0.5); // Warm colors
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        return [positions, colors];
    }, [count]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
            mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;

        const time = state.clock.elapsedTime;
        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];

            // Add gentle floating motion
            positions[i3 + 1] = y + Math.sin(time + x * 0.1) * 0.01;

            // Add mouse interaction
            const mouseInfluence = 0.1;
            positions[i3] += (mousePosition.current.x * mouseInfluence - positions[i3]) * 0.02;
            positions[i3 + 2] += (mousePosition.current.y * mouseInfluence - positions[i3 + 2]) * 0.02;
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.rotation.y = time * 0.05;
    });

    return (
        <Points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={positions}
                    count={count}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    array={colors}
                    count={count}
                    itemSize={3}
                />
            </bufferGeometry>
            <PointMaterial
                size={0.02}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </Points>
    );
}

// Camera Controller
function CameraController() {
    const { camera } = useThree();

    useFrame((state) => {
        camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 2;
        camera.position.z = 5 + Math.cos(state.clock.elapsedTime * 0.1) * 1;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// Main Three.js Scene
function Scene({ isMobile }: { isMobile: boolean }) {
    const geometries = useMemo(() => [
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.SphereGeometry(0.3, 8, 6),
        new THREE.ConeGeometry(0.3, 0.6, 6),
        new THREE.TorusGeometry(0.3, 0.1, 6, 12),
    ], []);

    const shapes = useMemo(() => [
        { position: [-3, 2, -2] as [number, number, number], geometry: geometries[0], color: "#FF6B6B" },
        { position: [3, -1, -1] as [number, number, number], geometry: geometries[1], color: "#4ECDC4" },
        { position: [-2, -2, 1] as [number, number, number], geometry: geometries[2], color: "#45B7D1" },
        { position: [2, 1, 0] as [number, number, number], geometry: geometries[3], color: "#96CEB4" },
        { position: [0, 3, -3] as [number, number, number], geometry: geometries[0], color: "#FFEAA7" },
        { position: [-1, 0, 2] as [number, number, number], geometry: geometries[1], color: "#DDA0DD" },
    ], [geometries]);

    // Reduce particle count on mobile for better performance
    const particleCount = isMobile ? 800 : 1500;

    return (
        <>
            <CameraController />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ff6b6b" />

            {/* Use key to force complete remount when switching between mobile/desktop */}
            <AnimatedParticles key={isMobile ? 'mobile' : 'desktop'} count={particleCount} />

            {shapes.map((shape, index) => (
                <FloatingGeometry
                    key={index}
                    position={shape.position}
                    geometry={shape.geometry}
                    color={shape.color}
                />
            ))}
        </>
    );
}

// Main Component
const ThreeBackground: React.FC = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                style={{ background: 'transparent' }}
                gl={{
                    powerPreference: "high-performance",
                    antialias: !isMobile, // Disable antialiasing on mobile for better performance
                }}
            >
                <Scene isMobile={isMobile} />
            </Canvas>
        </div>
    );
};

export default ThreeBackground; 