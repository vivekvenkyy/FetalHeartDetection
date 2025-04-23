import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Adjust path as needed
import BackgroundImage from "../assets/Background.png";

export default function Signup() {
  const [preview, setPreview] = useState(null);
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // Redirect after successful signup
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: `url(${BackgroundImage})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 sm:p-12 rounded-2xl shadow-2xl max-w-xl w-full">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-pink-800 mb-6">
          Create Account
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSignup}>
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-pink-100 border-4 border-pink-300 flex items-center justify-center overflow-hidden shadow-md">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-pink-600 text-sm text-center px-2">
                    Upload
                  </span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <p className="text-sm text-pink-600 mt-2">Profile Picture</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-pink-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              required
            />
          </div>

          {/* Gender and Age */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-pink-700 font-medium mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                required
              >
                <option value="">Select</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-pink-700 font-medium mb-1">Age</label>
              <input
                type="number"
                placeholder="20"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-pink-700 font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-pink-700 font-medium mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-pink-700 font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
              required
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-pink-600">
          Already have an account?{" "}
          <Link to="/" className="text-pink-800 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
