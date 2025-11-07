import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface BodyProps {
  url: string;
  rotate?: boolean;
}

function BodyModel({ url, rotate = true }: BodyProps) {
  const group = useRef<THREE.Group>(null!);
  const { scene } = useGLTF(url);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    // Normalize model scale to ~2 units tall for consistent display
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const targetHeight = 2.0;
    const scale = size.y > 0 ? targetHeight / size.y : 1;
    clone.scale.setScalar(scale);

    // Center the model on X/Z and place feet near y=0
    const centeredBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    centeredBox.getCenter(center);
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    // Move down so base sits at y≈0
    const min = centeredBox.min.y * scale;
    clone.position.y -= min;

    return clone;
  }, [scene]);

  useFrame((_, delta: number) => {
    if (rotate && group.current) {
      group.current.rotation.y += delta * 0.6; // smooth auto-rotation
    }
  });

  return <group ref={group} dispose={null}>{model && <primitive object={model} />}</group>;
}

interface HumanModel3DProps {
  modelUrl?: string; // default /models/human.glb
}

const HumanModel3D: React.FC<HumanModel3DProps> = ({ modelUrl = '/models/human.glb' }) => {
  return (
    <div className="w-full h-96 bg-white rounded-lg shadow mb-8 overflow-hidden">
      <Canvas camera={{ position: [0, 1.2, 3.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} />
        <BodyModel url={modelUrl} rotate />
        <Environment preset="city" />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};

export default HumanModel3D;

// Drei GLTF loader cache hint
useGLTF.preload('/models/human.glb');
