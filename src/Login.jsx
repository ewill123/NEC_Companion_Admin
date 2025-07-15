import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setError("Invalid credentials. Please try again.");
    } else {
      onLogin();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e3eaf2",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
        boxSizing: "border-box",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          borderRadius: 16,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          padding: "40px 50px",
          width: "100%",
          maxWidth: 420,
          color: "#222",
          display: "flex",
          flexDirection: "column",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        {/* Header with logo and description */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <img
            src="/NEC.jpeg"
            alt="NEC Logo"
            style={{
              width: 80,
              height: 80,
              objectFit: "contain",
              marginBottom: 15,
              filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.25))",
            }}
          />
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: "700",
              letterSpacing: "1.1px",
              color: "#111",
              textShadow: "0 1px 3px rgba(255,255,255,0.6)",
            }}
          >
            NEC Companion Admin Panel
          </h1>
          <p
            style={{
              marginTop: 6,
              fontSize: 14,
              color: "#444",
              fontWeight: "500",
            }}
          >
            Manage and monitor the NEC Mobile App backend securely
          </p>
        </div>

        {/* Email input */}
        <label
          htmlFor="email"
          style={{
            fontWeight: "600",
            fontSize: 14,
            marginBottom: 6,
            color: "#333",
          }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            marginBottom: 20,
            fontSize: 16,
            outline: "none",
            backgroundColor: "rgba(255,255,255,0.8)",
            transition: "border-color 0.3s",
            color: "#111",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.1)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0066cc")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
        />

        {/* Password input */}
        <label
          htmlFor="password"
          style={{
            fontWeight: "600",
            fontSize: 14,
            marginBottom: 6,
            color: "#333",
          }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
            marginBottom: 30,
            fontSize: 16,
            outline: "none",
            backgroundColor: "rgba(255,255,255,0.8)",
            transition: "border-color 0.3s",
            color: "#111",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.1)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#0066cc")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(0,0,0,0.15)")}
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "14px 0",
            backgroundColor: loading ? "#99c2ff" : "#0066cc",
            borderRadius: 12,
            border: "none",
            color: "white",
            fontWeight: "700",
            fontSize: 18,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 15px rgba(0, 102, 204, 0.6)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#004a99";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#0066cc";
          }}
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {/* Error message */}
        {error && (
          <p
            style={{
              marginTop: 20,
              color: "#d32f2f",
              fontWeight: "600",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
