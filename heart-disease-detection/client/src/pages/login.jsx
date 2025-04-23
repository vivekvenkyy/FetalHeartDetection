import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import BackgroundImage from "../assets/Background.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home"); // ✅ Redirect on success
    } catch (error) {
      setErrorMsg("Invalid email or password");
      console.error("Login Error:", error);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 sm:p-12 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-pink-800 mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-pink-600 mb-8 text-sm">
          Please login to your account
        </p>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="block text-pink-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-pink-700 font-medium mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMsg && (
            <p className="text-red-600 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pink-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-pink-800 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
