// Hand3D.jsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Hands({ sensorData }) {
    const leftFingerRefs = useRef([]);
    const rightFingerRefs = useRef([]);

    useFrame(() => {
        if (!sensorData || sensorData.length < 60) return;

        // Cada sensor son 6 valores: [ax, ay, az, gx, gy, gz]
        // L0–L4 → índices 0–4  (mano izquierda)
        // R0–R4 → índices 5–9  (mano derecha)

        // Mano izquierda
        for (let i = 0; i < 5; i++) {
            const baseIndex = i * 6;
            const ax = sensorData[baseIndex + 0];
            const ay = sensorData[baseIndex + 1];
            const az = sensorData[baseIndex + 2];

            const finger = leftFingerRefs.current[i];
            if (finger) {
                // Flexión del dedo usando az, filtrada
                finger.rotation.x = az / 40;
                finger.rotation.y = ay / 60;
                finger.rotation.z = ax / 60;
            }
        }

        // Mano derecha
        for (let i = 0; i < 5; i++) {
            const baseIndex = (i + 5) * 6;
            const ax = sensorData[baseIndex + 0];
            const ay = sensorData[baseIndex + 1];
            const az = sensorData[baseIndex + 2];

            const finger = rightFingerRefs.current[i];
            if (finger) {
                finger.rotation.x = az / 40;
                finger.rotation.y = -ay / 60;
                finger.rotation.z = -ax / 60;
            }
        }
    });

    return (
        <group>
            {/* MANO IZQUIERDA */}
            <group position={[-1.8, 0, 0]}>
                {/* Palma izquierda */}
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.9, 1.1, 0.3]} />
                    <meshStandardMaterial color="#4ecca3" />
                </mesh>

                {/* Dedos L0–L4 */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh
                        key={`L${i}`}
                        ref={(el) => (leftFingerRefs.current[i] = el)}
                        position={[-0.35 + i * 0.18, 0.65, 0]}
                    >
                        {/* segmento de dedo */}
                        <boxGeometry args={[0.14, 0.7, 0.14]} />
                        <meshStandardMaterial color="#2f9e8f" />
                    </mesh>
                ))}
            </group>

            {/* MANO DERECHA */}
            <group position={[1.8, 0, 0]}>
                {/* Palma derecha */}
                <mesh position={[0, -0.1, 0]}>
                    <boxGeometry args={[0.9, 1.1, 0.3]} />
                    <meshStandardMaterial color="#4ecca3" />
                </mesh>

                {/* Dedos R0–R4 */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <mesh
                        key={`R${i}`}
                        ref={(el) => (rightFingerRefs.current[i] = el)}
                        position={[-0.35 + i * 0.18, 0.65, 0]}
                    >
                        <boxGeometry args={[0.14, 0.7, 0.14]} />
                        <meshStandardMaterial color="#2f9e8f" />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

export function Hand3D({ sensorData }) {
    return (
        <div style={{ width: "360px", height: "280px", margin: "1.5rem auto" }}>
            <Canvas camera={{ position: [0, 0, 6] }}>
                <ambientLight intensity={1.2} />
                <directionalLight intensity={0.6} position={[4, 4, 4]} />
                <OrbitControls enablePan={false} />

                {/* Fondo sutil */}
                <mesh position={[0, 0, -2]}>
                    <planeGeometry args={[8, 5]} />
                    <meshStandardMaterial color="#101820" />
                </mesh>

                <Hands sensorData={sensorData} />
            </Canvas>
        </div>
    );
}
