// Hand3D.jsx
import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const metallic = {
    color: "#00e5ff",
    metalness: 0.92,
    roughness: 0.18
};

// ─────────────────────────────
// FALANGE
// ─────────────────────────────
function Bone({ size, pos }) {
    return (
        <mesh position={pos}>
            <boxGeometry args={size} />
            <meshStandardMaterial {...metallic} />
        </mesh>
    );
}

// ─────────────────────────────
// DEDO (3 falanges)
// ─────────────────────────────
function Finger({ fingerRef, basePos }) {
    return (
        <group ref={fingerRef} position={basePos}>
            <Bone size={[0.22, 0.35, 0.22]} pos={[0, 0.20, 0]} />
            <Bone size={[0.20, 0.30, 0.20]} pos={[0, 0.48, 0]} />
            <Bone size={[0.18, 0.26, 0.18]} pos={[0, 0.75, 0]} />
        </group>
    );
}

// ─────────────────────────────
// PULGAR (con inclinación natural)
// ─────────────────────────────
function Thumb({ thumbRef, basePos, flip }) {
    return (
        <group
            ref={thumbRef}
            position={basePos}
            rotation={[0, 0, flip ? -0.85 : 0.85]}
        >
            <Bone size={[0.26, 0.28, 0.26]} pos={[0, 0.12, 0]} />
            <Bone size={[0.22, 0.26, 0.22]} pos={[0, 0.40, 0]} />
        </group>
    );
}

// ─────────────────────────────
// MANOS COMPLETAS
// ─────────────────────────────
function Hands({ sensorData }) {

    const left = useRef([]);
    const right = useRef([]);
    const leftThumb = useRef();
    const rightThumb = useRef();

    // ─────────────────────────────
    // FUNCIÓN DE MOVIMIENTO SUAVE Y RÁPIDO
    // ─────────────────────────────
    const flexFinger = (ref, ax, ay, az, invert = false) => {
        if (!ref.current) return;

        const sign = invert ? -1 : 1;

        // Mucho más sensibles
        const flex = (ay / 25) * sign;
        const lean = (ax / 60) * sign;

        // Falanges
        const f1 = ref.current.children[0];
        const f2 = ref.current.children[1];
        const f3 = ref.current.children[2];

        // interpolación rápida → respuesta inmediata
        if (f1) f1.rotation.x += ((flex * 0.4) - f1.rotation.x) * 0.32;
        if (f2) f2.rotation.x += ((flex * 0.8) - f2.rotation.x) * 0.32;
        if (f3) f3.rotation.x += ((flex * 1.2) - f3.rotation.x) * 0.32;

        // Inclinación lateral muy suave
        ref.current.rotation.z += (lean - ref.current.rotation.z) * 0.25;
    };

    useFrame(() => {
        if (!sensorData || sensorData.length < 60) return;

        // ─────────── IZQUIERDA ───────────
        for (let i = 0; i < 4; i++) {
            const base = i * 6;
            flexFinger(
                { current: left.current[i] },
                sensorData[base],
                sensorData[base + 1],
                sensorData[base + 2],
                false
            );
        }

        // Pulgar izquierdo (más independiente)
        flexFinger(
            { current: leftThumb.current },
            sensorData[6],
            sensorData[7],
            sensorData[8],
            false
        );

        // ─────────── DERECHA ───────────
        for (let i = 0; i < 4; i++) {
            const base = (i + 5) * 6;
            flexFinger(
                { current: right.current[i] },
                sensorData[base],
                sensorData[base + 1],
                sensorData[base + 2],
                true
            );
        }

        // Pulgar derecho
        flexFinger(
            { current: rightThumb.current },
            sensorData[36],
            sensorData[37],
            sensorData[38],
            true
        );
    });

    // ─────────────────────────────
    // RENDER FINAL
    // ─────────────────────────────
    return (
        <group>

            {/* MANO IZQUIERDA */}
            <group position={[-2.4, -0.1, 0]}>
                <mesh>
                    <boxGeometry args={[1.6, 1.4, 0.45]} />
                    <meshStandardMaterial {...metallic} />
                </mesh>

                <Thumb thumbRef={leftThumb} basePos={[-1.05, -0.05, 0]} flip={false} />

                {[0, 1, 2, 3].map((i) => (
                    <Finger
                        key={`LF${i}`}
                        fingerRef={(el) => (left.current[i] = el)}
                        basePos={[-0.55 + i * 0.35, 0.75, 0]}
                    />
                ))}
            </group>

            {/* MANO DERECHA */}
            <group position={[2.4, -0.1, 0]}>
                <mesh>
                    <boxGeometry args={[1.6, 1.4, 0.45]} />
                    <meshStandardMaterial {...metallic} />
                </mesh>

                <Thumb thumbRef={rightThumb} basePos={[1.05, -0.05, 0]} flip={true} />

                {[0, 1, 2, 3].map((i) => (
                    <Finger
                        key={`RF${i}`}
                        fingerRef={(el) => (right.current[i] = el)}
                        basePos={[-0.55 + i * 0.35, 0.75, 0]}
                    />
                ))}
            </group>

        </group>
    );
}

// ─────────────────────────────
// ENVOLTORIO CANVAS
// ─────────────────────────────
export function Hand3D({ sensorData }) {
    return (
        <div style={{ width: "400px", height: "200px", margin: "1rem auto" }}>
            <Canvas camera={{ position: [0, 1.3, 8] }}>
                <ambientLight intensity={1.3} />
                <directionalLight intensity={1.6} position={[5, 5, 3]} />
                <OrbitControls enablePan={false} />
                <Hands sensorData={sensorData} />
            </Canvas>
        </div>
    );
}
