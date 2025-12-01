import React, { useState } from "react";
import "./navbar.css";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handlerLogoutClick = () => {
        navigate("/login");
        setMenuOpen(false);
    };

    const handlerHistoryClick = () => {
        navigate("/history");
        setMenuOpen(false);
    };

    const handlerTraductorClick = () => {
        navigate("/home");
        setMenuOpen(false);
    };

    const handlerCalibrationClick = () => {
        navigate("/calibration");
        setMenuOpen(false);
    };

    const toggleMenu = () => setMenuOpen(!menuOpen);

    return (
        <nav className="navbar">
            <div className="navbar-logo">GloveTalk</div>
            <button className="navbar-burger" onClick={toggleMenu}>
                <span />
                <span />
                <span />
            </button>
            <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
                <li>
                    <a href="#traductor" onClick={handlerTraductorClick}>
                        Traductor
                    </a>
                </li>
                <li>
                    <a href="#traductor" onClick={handlerCalibrationClick}>
                        Calibración
                    </a>
                </li>
                <li>
                    <a href="#historial" onClick={handlerHistoryClick}>
                        Historial
                    </a>
                </li>
                <button className="logout" onClick={handlerLogoutClick}>
                    LogOut
                </button>
            </ul>
        </nav>
    );
};

export default Navbar;