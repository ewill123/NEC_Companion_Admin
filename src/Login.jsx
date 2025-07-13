import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

const codeSnippets = [
  "const fetchData = async () => {",
  "  const response = await fetch(url);",
  "  const data = await response.json();",
  "  return data;",
  "}",
  "function sum(a, b) { return a + b; }",
  "for(let i=0; i<10; i++) { console.log(i); }",
  "// TODO: optimize this function",
  "let user = { name: 'admin', role: 'superuser' };",
  "if(isAuthenticated) { navigate('/dashboard'); }",
  "async function login() { await supabase.auth.signInWithPassword(...) }",
  "const config = { debug: true, version: '1.2.3' };",
];

// Repeat snippets for continuous scrolling
function getRepeatedSnippets() {
  return Array(3).fill(codeSnippets).flat().join("   •••   ");
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // We'll store refs for each line of code scroll divs
  const scrollRefs = useRef([]);

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
      setError("Login failed. Check your email or password.");
    } else {
      onLogin();
    }
  };

  useEffect(() => {
    let frameId;
    const speeds = [0.7, 0.5, 0.9, 0.4, 0.6, 0.8]; // speed variations for lines
    // Store scrollX for each line
    const scrollX = new Array(codeSnippets.length).fill(0);

    function animate() {
      scrollRefs.current.forEach((el, idx) => {
        if (!el) return;
        const direction = idx % 2 === 0 ? -1 : 1; // even lines: left, odd lines: right
        scrollX[idx] += speeds[idx % speeds.length] * direction;

        // Reset when scrolling fully
        if (direction === -1 && scrollX[idx] < -el.scrollWidth / 3) {
          scrollX[idx] = 0;
        }
        if (direction === 1 && scrollX[idx] > el.scrollWidth / 3) {
          scrollX[idx] = 0;
        }

        el.style.transform = `translateX(${scrollX[idx]}px)`;
      });

      frameId = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "#121212",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        fontFamily: "'Fira Code', monospace",
        position: "relative",
        color: "#d4d4d4",
      }}
    >
      {/* Multiple scrolling code lines */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          userSelect: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {codeSnippets.map((_, idx) => (
          <div
            key={idx}
            ref={(el) => (scrollRefs.current[idx] = el)}
            style={{
              position: "absolute",
              whiteSpace: "nowrap",
              fontSize: 20,
              fontWeight: "600",
              color: "#33ffaa",
              filter: "blur(1.5px)",
              opacity: 0.12,
              lineHeight: 1.5,
              paddingLeft: 50,
              paddingRight: 50,
              textShadow: "0 0 5px #33ffaa, 0 0 10px #33ffaa, 0 0 20px #33ffaa",
              top: `${(idx + 1) * 4}rem`, // vertical spacing
              width: "300%",
              transform: "translateX(0)",
              willChange: "transform",
              transformStyle: "preserve-3d",
            }}
          >
            {getRepeatedSnippets()}
          </div>
        ))}
      </div>

      {/* Glassmorphic login form */}
      <form
        onSubmit={handleLogin}
        style={{
          position: "relative",
          zIndex: 10,
          background: "rgba(18, 18, 18, 0.55)",
          borderRadius: 25,
          padding: "50px 60px",
          boxShadow:
            "0 8px 32px 0 rgba(31, 38, 135, 0.7), 0 0 15px 3px rgba(255, 64, 129, 0.5)",
          backdropFilter: "blur(18px)",
          border: "1.5px solid rgba(255, 255, 255, 0.15)",
          width: "100%",
          maxWidth: 460,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "#fff",
        }}
      >
        <h1
          style={{
            marginBottom: 36,
            fontWeight: "700",
            fontSize: 28,
            color: "#ff79c6",
            letterSpacing: "0.05em",
            userSelect: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span role="img" aria-label="lock">
            🔒
          </span>
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 28,
            borderRadius: 14,
            border: "none",
            fontSize: 16,
            fontWeight: "600",
            background: "rgba(255, 255, 255, 0.12)",
            color: "#d4d4d4",
            outline: "none",
            boxShadow:
              "inset 2px 2px 6px rgba(255,255,255,0.2), inset -2px -2px 6px rgba(0,0,0,0.6)",
            transition: "background 0.3s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.22)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")
          }
        />

        <input
          type="password"
          placeholder="Password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: 16,
            marginBottom: 36,
            borderRadius: 14,
            border: "none",
            fontSize: 16,
            fontWeight: "600",
            background: "rgba(255, 255, 255, 0.12)",
            color: "#d4d4d4",
            outline: "none",
            boxShadow:
              "inset 2px 2px 6px rgba(255,255,255,0.2), inset -2px -2px 6px rgba(0,0,0,0.6)",
            transition: "background 0.3s",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.22)")
          }
          onBlur={(e) =>
            (e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)")
          }
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 18,
            fontSize: 18,
            fontWeight: "700",
            color: "#fff",
            backgroundColor: loading ? "#aa3057" : "#ff4081",
            border: "none",
            borderRadius: 16,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 6px 20px #ff4081",
            transition: "background-color 0.3s",
            userSelect: "none",
            letterSpacing: "0.05em",
          }}
          onMouseEnter={(e) =>
            !loading && (e.currentTarget.style.backgroundColor = "#ff79c6")
          }
          onMouseLeave={(e) =>
            !loading && (e.currentTarget.style.backgroundColor = "#ff4081")
          }
        >
          {loading ? "Logging in..." : "Log In"}
        </button>

        {error && (
          <p
            style={{
              marginTop: 28,
              color: "#ff6b6b",
              fontWeight: "600",
              fontSize: 14,
              userSelect: "none",
            }}
          >
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
