import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function FlashingHaringLine({ position, lineType, baseColor, index }: {
  position: [number, number, number],
  lineType: 'curve' | 'bigwave' | 'doublewave' | 'verticalcurve',
  baseColor: string,
  index: number
}) {
  const groupRef = useRef<THREE.Group>(null);
  const fixedColor = baseColor;

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.rotation.z = Math.sin(time * 0.5 + index) * 0.1;
    groupRef.current.position.x = position[0] + Math.sin(time * 0.3 + index) * 0.2;
    groupRef.current.position.y = position[1] + Math.cos(time * 0.4 + index) * 0.2;
  });

  const createLineGeometry = (type: string) => {
    const points = [];
    const scale = 28;

    switch (type) {
      case 'curve':
        for (let i = 0; i <= 30; i++) {
          const t = i / 30;
          const x = (t - 0.5) * scale;
          const y = Math.sin(t * Math.PI * 2) * 4;
          points.push(new THREE.Vector3(x, y, 0));
        }
        break;

      case 'bigwave':
        for (let i = 0; i <= 40; i++) {
          const t = i / 40;
          const x = (t - 0.5) * scale;
          const y = Math.sin(t * Math.PI * 1.5) * 6;
          points.push(new THREE.Vector3(x, y, 0));
        }
        break;

      case 'doublewave':
        for (let i = 0; i <= 35; i++) {
          const t = i / 35;
          const x = (t - 0.5) * scale;
          const y = Math.sin(t * Math.PI * 4) * 3 + Math.cos(t * Math.PI * 2) * 2;
          points.push(new THREE.Vector3(x, y, 0));
        }
        break;

      case 'verticalcurve':
        for (let i = 0; i <= 30; i++) {
          const t = i / 30;
          const y = (t - 0.5) * scale * 0.8;
          const x = Math.sin(t * Math.PI * 3) * 4;
          points.push(new THREE.Vector3(x, y, 0));
        }
        break;

      default:
        for (let i = 0; i <= 25; i++) {
          const t = i / 25;
          const x = (t - 0.5) * scale;
          const y = Math.sin(t * Math.PI) * 5;
          points.push(new THREE.Vector3(x, y, 0));
        }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  };

  const geometry = useMemo(() => createLineGeometry(lineType), [lineType]);

  return (
    <group ref={groupRef} position={position}>
      <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: fixedColor, linewidth: 3 }))} />
    </group>
  );
}

function MinimalParticles({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const haringColors = [
      new THREE.Color('#FF0000'),
      new THREE.Color('#00FF00'),
      new THREE.Color('#0000FF'),
      new THREE.Color('#FFFF00'),
      new THREE.Color('#FF00FF'),
      new THREE.Color('#00FFFF'),
      new THREE.Color('#FFFFFF')
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const color = haringColors[Math.floor(Math.random() * haringColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return [positions, colors];
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      positions[i3 + 1] += Math.sin(time * 2 + i * 0.1) * 0.01;
      positions[i3] += Math.cos(time * 1.5 + i * 0.1) * 0.008;
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
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </Points>
  );
}

function CameraController() {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    camera.position.x = Math.sin(time * 0.1) * 2;
    camera.position.y = Math.cos(time * 0.15) * 1.5;
    camera.position.z = 15 + Math.sin(time * 0.08) * 3;

    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Scene({ isMobile }: { isMobile: boolean }) {
  const haringShapes = useMemo(() => [
    { position: [-8, 6, -1] as [number, number, number], lineType: 'curve' as const, color: "#FF0000" },
    { position: [8, -6, 0] as [number, number, number], lineType: 'bigwave' as const, color: "#00FF00" },
    { position: [0, 0, 1] as [number, number, number], lineType: 'doublewave' as const, color: "#0000FF" },
    { position: [-6, -8, -1] as [number, number, number], lineType: 'verticalcurve' as const, color: "#FFFF00" },
    { position: [6, 8, 0] as [number, number, number], lineType: 'curve' as const, color: "#FF00FF" },
    { position: [-4, 2, 1] as [number, number, number], lineType: 'bigwave' as const, color: "#00FFFF" },
    { position: [4, -2, -1] as [number, number, number], lineType: 'doublewave' as const, color: "#FFA500" },
    { position: [0, -10, 0] as [number, number, number], lineType: 'verticalcurve' as const, color: "#FFFFFF" },
  ], []);

  const particleCount = isMobile ? 100 : 200;

  return (
    <>
      <CameraController />
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#FFFFFF" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#FF0000" />

      <MinimalParticles key={isMobile ? 'mobile' : 'desktop'} count={particleCount} />

      {haringShapes.map((shape, index) => (
        <FlashingHaringLine
          key={index}
          position={shape.position}
          lineType={shape.lineType}
          baseColor={shape.color}
          index={index}
        />
      ))}
    </>
  );
}

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
        camera={{ position: [0, 0, 15], fov: 85 }}
        style={{ background: '#000000' }}
        gl={{
          powerPreference: "high-performance",
          antialias: !isMobile,
          preserveDrawingBuffer: true,
        }}
      >
        <Scene isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default ThreeBackground; 