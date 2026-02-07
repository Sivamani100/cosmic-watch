import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, OrbitControls } from '@react-three/drei';

function AnimatedSphere() {
    const meshRef = useRef(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Sphere args={[1, 100, 200]} scale={2.4} ref={meshRef}>
            <MeshDistortMaterial
                color="#4F46E5"
                attach="material"
                distort={0.5}
                speed={1.5}
                roughness={0.2}
                metalness={0.8}
            />
        </Sphere>
    );
}

export function AuthIllustration() {
    return (
        <div className="w-full h-full min-h-[500px] bg-black/50 relative overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-900/20 z-0" />
            <Canvas className="z-10">
                <ambientLight intensity={0.5} />
                <directionalLight position={[2, 5, 2]} intensity={1} />
                <AnimatedSphere />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
                <h3 className="text-2xl font-bold mb-2">Explore the Cosmos</h3>
                <p className="text-white/70">
                    Join thousands of astronomers tracking near-Earth objects in real-time.
                </p>
            </div>
        </div>
    );
}
