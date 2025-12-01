import React, { useEffect, useState } from "react";
import "./Calibracion.css";

export default function Calibracion() {
    const [ws, setWs] = useState(null);
    const [fps, setFps] = useState(0);
    const [latency, setLatency] = useState(0);
    const [sensors, setSensors] = useState([]);
    const [lastPingTime, setLastPingTime] = useState(null);

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8000/ws");
        setWs(socket);

        socket.onopen = () => {
            console.log("🟢 WebSocket conectado");
            sendPing();
        };

        socket.onmessage = (event) => {
            const msg = JSON.parse(event.data);

            if (msg.type === "fps") {
                setFps(msg.value.toFixed(1));
            }

            if (msg.type === "latency") {
                const now = Date.now();
                if (lastPingTime) {
                    setLatency(now - lastPingTime);
                }
            }

            if (msg.type === "mpuStatus") {
                setSensors(msg.sensors);
            }
        };

        socket.onclose = () => {
            console.log("🔴 WebSocket desconectado");
        };

        return () => socket.close();
    }, []);

    const sendPing = () => {
        if (ws) {
            setLastPingTime(Date.now());
            ws.send(JSON.stringify({ type: "ping" }));
        }
    };

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
                    {sensors.map((s) => (
                        <div key={s.id} className={`sensor-box ${s.connected ? "ok" : "fail"}`}>
                            <span>MPU {s.id}</span>
                            <div className={`status-dot ${s.connected ? "green" : "red"}`}></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Indicadores */}
            <div className="panel indicadores">
                <h2>Indicadores del Sistema</h2>
                <p><strong>Velocidad de traducción (FPS):</strong> {fps}</p>
                <p><strong>Latencia WebSocket:</strong> {latency} ms</p>
            </div>

            <button className="btn-calibrar" onClick={calibrar}>
                ⚙️ Calibrar Sensores
            </button>
        </div>
    );
}
