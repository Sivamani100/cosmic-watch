import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html, Line } from '@react-three/drei';
import { useRef, useMemo, Suspense } from 'react';
import * as THREE from 'three';
import type { Asteroid } from '@/types/asteroid';

interface Scene3DProps {
  asteroids?: Asteroid[];
  selectedAsteroid?: Asteroid | null;
  onSelectAsteroid?: (asteroid: Asteroid | null) => void;
}

function Earth() {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group>
      {/* Earth Core with gradient */}
      <Sphere ref={meshRef} args={[1, 128, 128]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="#1e3a8a"
          emissive="#0a1f5c"
          emissiveIntensity={0.2}
          shininess={25}
          specular="#4488ff"
        />
      </Sphere>

      {/* Cloud layer */}
      <Sphere args={[1.01, 64, 64]} position={[0, 0, 0]}>
        <meshPhongMaterial
          color="#ffffff"
          transparent
          opacity={0.1}
          shininess={100}
        />
      </Sphere>

      {/* Inner atmosphere glow */}
      <Sphere args={[1.05, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Outer atmosphere glow */}
      <Sphere ref={atmosphereRef} args={[1.15, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Label */}
      <Html position={[0, 1.8, 0]} center>
        <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-md px-3 py-1.5 rounded-lg text-sm font-semibold border border-blue-400/30 shadow-lg shadow-blue-500/20">
          🌍 Earth
        </div>
      </Html>
    </group>
  );
}

interface AsteroidObjectProps {
  asteroid: Asteroid;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

function AsteroidObject({ asteroid, index, isSelected, onSelect }: AsteroidObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Calculate position based on real miss distance data
  // Scale: 1 unit = 2,000,000 km (Earth radius is ~0.003 units, so we scale Earth slightly for visibility)
  const position = useMemo(() => {
    // Default to 10M km if no data
    let missDistanceKm = 10_000_000;

    if (asteroid.close_approach_data && asteroid.close_approach_data.length > 0) {
      missDistanceKm = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
    }

    // Convert km to scene units (1 unit = 1M km for better spread)
    const distanceUnits = Math.max(2, missDistanceKm / 1_000_000);

    // Spread asteroids in a circle with some random inclination
    const angle = (index / 20) * Math.PI * 2;
    // Use some orbital data for inclination if available, else random tilt
    const inclination = asteroid.orbital_data?.inclination
      ? (parseFloat(asteroid.orbital_data.inclination) * Math.PI) / 180
      : (Math.random() - 0.5) * 0.5;

    return new THREE.Vector3(
      Math.cos(angle) * distanceUnits,
      Math.sin(angle) * Math.sin(inclination) * distanceUnits,
      Math.sin(angle) * Math.cos(inclination) * distanceUnits
    );
  }, [asteroid, index]);

  // Size based on actual diameter (scaled for visibility)
  const size = useMemo(() => {
    const avgDiameter = (asteroid.diameter_min_km || 0.1 + (asteroid.diameter_max_km || 0.1)) / 2;
    // Scale size: 0.1 units = 1km (much larger than scale for distance to keep them visible)
    return Math.max(0.08, Math.min(0.4, avgDiameter * 0.2));
  }, [asteroid]);

  // Color based on risk level
  const color = useMemo(() => {
    switch (asteroid.risk_level) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#f59e0b';
      default: return '#10b981';
    }
  }, [asteroid.risk_level]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position.y + Math.sin(state.clock.elapsedTime + index) * 0.1;
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <icosahedronGeometry args={[size, 1]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.3}
          shininess={isSelected ? 100 : 50}
          specular={color}
        />
      </mesh>

      {/* Glow effect for selected asteroid */}
      {isSelected && (
        <mesh position={position}>
          <icosahedronGeometry args={[size * 1.3, 1]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* Orbit line */}
      <Line
        points={Array.from({ length: 129 }, (_, i) => {
          const orbitAngle = (i / 128) * Math.PI * 2;
          const dist = position.length();

          // Use the same inclination for the entire orbit path
          // Note: position.length() is the 3D distance, but we spread on a radius.
          // In the position memo, distanceUnits is the radius on the tilted plane.
          // Let's extract distanceUnits and inclination from the position memo logic.
          let missDistanceKm = 10_000_000;
          if (asteroid.close_approach_data && asteroid.close_approach_data.length > 0) {
            missDistanceKm = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
          }
          const radius = Math.max(2, missDistanceKm / 1_000_000);
          const inc = asteroid.orbital_data?.inclination
            ? (parseFloat(asteroid.orbital_data.inclination) * Math.PI) / 180
            : 0;

          return [
            Math.cos(orbitAngle) * radius,
            Math.sin(orbitAngle) * Math.sin(inc) * radius,
            Math.sin(orbitAngle) * Math.cos(inc) * radius
          ];
        })}
        color={color}
        opacity={isSelected ? 0.4 : 0.15}
        transparent
        lineWidth={isSelected ? 2 : 1}
      />

      {/* Enhanced label on selection */}
      {isSelected && (
        <Html position={[position.x, position.y + 0.8, position.z]} center>
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md px-4 py-3 rounded-xl text-sm border-2 border-primary/40 shadow-2xl shadow-primary/20 min-w-[180px]">
            <p className="font-bold text-base truncate bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {asteroid.name}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-xs flex items-center gap-2">
                <span className="text-muted-foreground">Risk:</span>
                <span className={`font-semibold ${asteroid.risk_level === 'CRITICAL' ? 'text-red-400' :
                  asteroid.risk_level === 'HIGH' ? 'text-orange-400' :
                    asteroid.risk_level === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                  }`}>
                  {asteroid.risk_level}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Ø {((asteroid.diameter_min_km || 0 + (asteroid.diameter_max_km || 0)) / 2).toFixed(2)} km
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="text-primary animate-pulse">Loading 3D Scene...</div>
    </Html>
  );
}

function SceneContent({ asteroids, selectedAsteroid, onSelectAsteroid }: Scene3DProps) {
  const controlsRef = useRef<any>(null);

  // Update controls target smoothly when selection changes
  useFrame(() => {
    if (controlsRef.current) {
      if (selectedAsteroid) {
        const index = asteroids?.findIndex(a => a.neo_id === selectedAsteroid.neo_id) ?? -1;
        if (index !== -1) {
          // Re-calculate position
          let missDistanceKm = 10_000_000;
          if (selectedAsteroid.close_approach_data?.[0]) {
            missDistanceKm = parseFloat(selectedAsteroid.close_approach_data[0].miss_distance.kilometers);
          }
          const radius = Math.max(2, missDistanceKm / 1_000_000);
          const angle = (index / 20) * Math.PI * 2;
          const inc = selectedAsteroid.orbital_data?.inclination
            ? (parseFloat(selectedAsteroid.orbital_data.inclination) * Math.PI) / 180
            : 0;

          const targetPos = new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * Math.sin(inc) * radius,
            Math.sin(angle) * Math.cos(inc) * radius
          );

          controlsRef.current.target.lerp(targetPos, 0.05);
        }
      } else {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.05);
      }
      controlsRef.current.update();
    }
  });

  return (
    <>
      {/* Ambient base lighting */}
      <ambientLight intensity={0.2} color="#ffffff" />

      {/* Main sun light */}
      <directionalLight
        position={[15, 10, 15]}
        intensity={1.5}
        color="#ffffff"
        castShadow
      />

      {/* Fill lights for depth */}
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#fef3c7" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#6366f1" />
      <pointLight position={[0, -15, 0]} intensity={0.6} color="#8b5cf6" />

      {/* Rim light for Earth */}
      <pointLight position={[-5, 0, -5]} intensity={0.5} color="#3b82f6" />

      <Stars
        radius={150}
        depth={80}
        count={8000}
        factor={6}
        saturation={0}
        fade
        speed={0.5}
      />

      <Earth />

      {asteroids?.slice(0, 50).map((asteroid, index) => (
        <AsteroidObject
          key={asteroid.neo_id}
          asteroid={asteroid}
          index={index}
          isSelected={selectedAsteroid?.neo_id === asteroid.neo_id}
          onSelect={() => onSelectAsteroid?.(
            selectedAsteroid?.neo_id === asteroid.neo_id ? null : asteroid
          )}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={80}
        autoRotate={!selectedAsteroid}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export function Scene3D({ asteroids = [], selectedAsteroid, onSelectAsteroid }: Scene3DProps) {
  return (
    <div className="w-full h-full min-h-[500px] bg-gradient-to-b from-gray-950 via-blue-950/20 to-purple-950/30 rounded-xl overflow-hidden shadow-2xl border border-primary/10">
      <Canvas
        camera={{ position: [0, 10, 20], fov: 65 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent
            asteroids={asteroids}
            selectedAsteroid={selectedAsteroid}
            onSelectAsteroid={onSelectAsteroid}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
