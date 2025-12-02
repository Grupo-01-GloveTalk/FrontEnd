import React, { useEffect, useState } from "react";
import "./calibration.css";

export function Calibration() {
    const [ws, setWs] = useState(null);
    const [fps, setFps] = useState(0);
    const [latency, setLatency] = useState(0);
    const [sensors, setSensors] = useState([]);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8000/ws");
        setWs(socket);

        socket.onopen = () => {
            console.log("🟢 WebSocket conectado");
            sendPing(socket);  // Enviar ping al conectar
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            // === FPS ===
            if (msg.type === "fps") {
                setFps(msg.value.toFixed(1));
            }

            // === LATENCIA REAL ===
            if (msg.type === "latency") {
                const now = Date.now();
                setLatency(now - msg.timestamp);
            }

            // === ESTADO DE SENSORES ===
            if (msg.type === "mpuStatus") {
                setSensors(msg.sensors);
            }
        };

        socket.onclose = () => {
            console.log("🔴 WebSocket desconectado");
        };

        return () => socket.close();
    }, []);

    // Enviar ping con timestamp
    const sendPing = () => {
        if (ws) {
            const now = Date.now();
            ws.send(JSON.stringify({
                type: "ping",
                timestamp: now
            }));
        }
    };

    // Botón de calibrar
    const calibrar = () => {
        if (ws) {
            ws.send(JSON.stringify({ type: "calibrate" }));
            alert("Calibrando sensores...");
        }
    };

    return (
        <div className="calibracion-container">

            <h1 className="titulo">🧤 Diagnóstico del Guante Inteligente</h1>

            {/* Estado de Sensores */}
            <div className="panel">
                <h2>Estado de Sensores MPU6050</h2>
                <div className="sensors-grid">

                    {/* MANO IZQUIERDA */}
                    <div className="hand-column">
                        <h3 className="hand-title">✋ Mano Izquierda</h3>

                        {sensors
                            .filter(s => s.hand === "L")
                            .sort((a, b) => a.finger - b.finger)
                            .map((s) => (
                                <div
                                    key={`L${s.finger}`}
                                    className={`sensor-box ${s.connected ? "ok" : "fail"}`}
                                >
                                    <span>L{s.finger}</span>
                                    <div className={`status-dot ${s.connected ? "green" : "red"}`}></div>
                                </div>
                            ))}
                    </div>

                    {/* MANO DERECHA */}
                    <div className="hand-column">
                        <h3 className="hand-title">🤚 Mano Derecha</h3>

                        {sensors
                            .filter(s => s.hand === "R")
                            .sort((a, b) => a.finger - b.finger)
                            .map((s) => (
                                <div
                                    key={`R${s.finger}`}
                                    className={`sensor-box ${s.connected ? "ok" : "fail"}`}
                                >
                                    <span>R{s.finger}</span>
                                    <div className={`status-dot ${s.connected ? "green" : "red"}`}></div>
                                </div>
                            ))}
                    </div>

                </div>
            </div>

            {/* Indicadores */}
            <div className="panel indicadores">
                <h2>Indicadores del Sistema</h2>
                <p><strong>Velocidad de traducción (FPS):</strong> {fps}</p>
                <p><strong>Latencia WebSocket:</strong> {latency} ms</p>

                <button className="btn-ping" onClick={sendPing}>
                    🔄 Medir Latencia
                </button>
            </div>

            <button className="btn-calibrar" onClick={calibrar}>
                ⚙️ Calibrar Sensores
            </button>
        </div>
    );
}
