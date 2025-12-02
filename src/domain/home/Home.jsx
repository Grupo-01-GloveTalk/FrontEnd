import React, { useState, useEffect } from "react";
import "./Home.css";
import Navbar from "../../infraestructure/ui/components/navbar/navbar.jsx";
import { Hand3D } from "../../components/hand3d/Hand3D.jsx";   // 👈 IMPORTANTE
import { translationService } from "../../infraestructure/services/translationService.js";

export function Home() {
    const [translation, setTranslation] = useState("");
    const [currentWord, setCurrentWord] = useState("");
    const [isTranslating, setIsTranslating] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("checking");
    const [lastSensorData, setLastSensorData] = useState(null);
    const [gestureCount, setGestureCount] = useState(0);

    const [sensorData, setSensorData] = useState(null);

    useEffect(() => {
        const checkGloveConnection = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/status");
                const json = await res.json();
                if (json.connected) {
                    setConnectionStatus("connected");
                } else {
                    setConnectionStatus("disconnected");
                }
            } catch (error) {
                setConnectionStatus("error");
            }
        };

        checkGloveConnection();
    }, []);

    const parseSensorDataLine = (rawLine) => {
        const tokens = rawLine.split(",");
        const parsed = [];

        for (let i = 0; i < tokens.length; i++) {
            const marker = tokens[i];
            const isLeftOrRight = marker === "L" || marker === "R";

            if (isLeftOrRight && (i + 8) < tokens.length) {
                try {
                    const ax = parseFloat(tokens[i + 3]);
                    const ay = parseFloat(tokens[i + 4]);
                    const az = parseFloat(tokens[i + 5]);
                    const gx = parseFloat(tokens[i + 6]);
                    const gy = parseFloat(tokens[i + 7]);
                    const gz = parseFloat(tokens[i + 8]);

                    parsed.push(ax, ay, az, gx, gy, gz);
                } catch (e) {
                    console.warn("⚠️ Error al parsear línea:", e);
                }
            }

            i += 8;
        }
        return parsed;
    };


    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8000/ws");

        socket.onopen = () => {
            console.log("🟢 WebSocket conectado");
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "sensorData") {
                const rawLine = message.data;
                const parsed = parseSensorDataLine(rawLine);

                if (parsed.length === 60) {
                    setLastSensorData(parsed);
                    setGestureCount(prev => prev + 1);

                    if (isTranslating) {
                        translateSensorDataToLetter(parsed);
                    }
                } else {
                    console.warn("❌ Datos incompletos recibidos:", parsed.length);
                }
            }
        };

        socket.onerror = (err) => {
            console.error("❌ WebSocket error:", err);
        };

        return () => socket.close();
    }, [isTranslating]);


    const translateSensorDataToLetter = async (sensorData) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: sensorData }),
            });

            const json = await response.json();

            if (json.prediction) {
                setCurrentWord((prev) => prev + json.prediction);
                setTranslation((prev) => prev + json.prediction);
            } else {
                setCurrentWord("?");
            }
        } catch (error) {
            setCurrentWord("❌ Error al traducir datos");
        }
    };


    const startTranslation = () => {
        setCurrentWord("");
        setIsTranslating(true);
    };

    const stopTranslation = () => {
        setIsTranslating(false);
        if (translation) {
            const utterance = new SpeechSynthesisUtterance(translation);
            utterance.lang = "es-PE";
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }
    };


    return (
        <>
            <Navbar />
            <div className="home">
                <h1>GloveTalk</h1>

                <div className="glove-status-section">
                    <div className={`connection-status ${connectionStatus}`}>
                        {connectionStatus === "checking" && "🔄 Verificando conexión..."}
                        {connectionStatus === "connected" && "🟢 Guante conectado"}
                        {connectionStatus === "disconnected" && "🔴 Guante no conectado"}
                        {connectionStatus === "error" && "⚠️ Error al verificar"}
                    </div>
                </div>


                <div className="control-buttons">
                    <button
                        onClick={startTranslation}
                        disabled={connectionStatus !== "connected" || isTranslating}
                        className="translate-btn primary"
                    >
                        🎯 Iniciar Traducción
                    </button>

                    {(translation || currentWord) && (
                        <button
                            onClick={() => {
                                setTranslation("");
                                setCurrentWord("");
                                setGestureCount(0);
                            }}
                            className="clear-btn"
                        >
                            🔄 Limpiar
                        </button>
                    )}

                    {isTranslating && (
                        <button
                            onClick={() => stopTranslation()}
                            className="translate-btn stop"
                        >
                            ⏹️ Detener y Reproducir Audio
                        </button>
                    )}
                </div>


                {/* 🧤 === VISTA 3D DEL GUANTE === */}
                {lastSensorData && (
                    <div className="hand3d-container">
                        <Hand3D sensorData={lastSensorData} />
                    </div>
                )}




                <div className="translation-section">
                    <label>💬 Traducción:</label>
                    <div className="translation-result-box">
                        {translation || "Las palabras traducidas aparecerán aquí"}
                    </div>
                </div>
            </div>
        </>
    );
}
