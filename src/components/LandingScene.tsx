import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sphere, Stars, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function MovingAsteroids() {
    const groupRef = useRef<THREE.Group>(null);
    const { mouse } = useThree();

    const asteroids = useMemo(() => {
        return Array.from({ length: 30 }).map(() => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10,
            ] as [number, number, number],
            scale: Math.random() * 0.3 + 0.1,
            speed: Math.random() * 0.2 + 0.05,
            color: Math.random() > 0.7 ? "#b91c1c" : "#a16207", // Dark Red / Dark Yellow
        }));
    }, []);

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle rotation
            groupRef.current.rotation.y += 0.001;
            groupRef.current.rotation.x += 0.0005;

            // Mouse follow effect
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, mouse.x * 2, 0.1);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, mouse.y * 2, 0.1);
        }
    });

    return (
        <group ref={groupRef}>
            {asteroids.map((ast, i) => (
                <Float key={i} speed={ast.speed * 5} rotationIntensity={2} floatIntensity={2}>
                    <Sphere args={[ast.scale, 8, 8]} position={ast.position}>
                        <meshStandardMaterial
                            color={ast.color}
                            roughness={0.8}
                            emissive={ast.color}
                            emissiveIntensity={0.2}
                        />
                    </Sphere>
                </Float>
            ))}
        </group>
    );
}

function Earth() {
    const earthRef = useRef<THREE.Mesh>(null);
    const { mouse } = useThree();

    useFrame((state) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.002;

            // Subtle tilt responsive to mouse
            earthRef.current.rotation.x = THREE.MathUtils.lerp(earthRef.current.rotation.x, mouse.y * 0.2, 0.1);
            earthRef.current.rotation.z = THREE.MathUtils.lerp(earthRef.current.rotation.z, -mouse.x * 0.2, 0.1);
        }
    });

    return (
        <group position={[4, 0, 0]}>
            <Sphere ref={earthRef} args={[2.5, 64, 64]}>
                <meshStandardMaterial
                    color="#15803d" // Dark Green
                    roughness={0.5}
                    metalness={0.2}
                    wireframe={true}
                    transparent={true}
                    opacity={0.4}
                />
            </Sphere>
            {/* Atmosphere glow */}
            <Sphere args={[2.6, 64, 64]}>
                <meshBasicMaterial
                    color="#15803d"
                    transparent={true}
                    opacity={0.1}
                    side={THREE.BackSide}
                />
            </Sphere>
        </group>
    );
}

export function LandingScene() {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: 'transparent' }}>
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#15803d" />

                <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />

                <MovingAsteroids />
                <Earth />
            </Canvas>
        </div>
    );
}
