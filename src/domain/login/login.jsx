import React, { useState } from "react";
import "./login.css";
import { useNavigate } from "react-router-dom";

export function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Replace with your backend API call
        console.log("Login submitted:", { email, password });
    };

    const handlerLoginClick = () => {
        navigate("/home");
    }

    const handlerRegisterCLick = () => {
        navigate("/register");
    }

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>Login</h1>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="login-button" onClick={handlerLoginClick}>Login</button>
                <button type="submit" className="register-button" onClick={handlerRegisterCLick} >Register</button>
                <button type="submit" className="guess-button" onClick={handlerLoginClick}>Invitado</button>

            </form>
        </div>
    );

}

