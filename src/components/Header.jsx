import React, { useContext } from "react";
import { ThemeContext } from "../themeContext";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";

export default function Header({ newCount, onLogout }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 8,
        borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #ddd",
      }}
    >
      <h1 style={{ margin: 0, fontWeight: "700", fontSize: 24 }}>
        NEC Reports{" "}
        <span
          style={{
            backgroundColor: "#e53e3e",
            color: "#fff",
            borderRadius: "50%",
            padding: "2px 8px",
            fontSize: 14,
            fontWeight: "600",
            verticalAlign: "middle",
          }}
          aria-label={`${newCount} new reports`}
          title={`${newCount} new reports`}
        >
          {newCount}
        </span>
      </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          style={{
            cursor: "pointer",
            background: "none",
            border: "none",
            color: theme === "dark" ? "#f9fafb" : "#1a202c",
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            padding: 4,
            borderRadius: 4,
            transition: "color 0.3s ease",
          }}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{
            cursor: "pointer",
            backgroundColor: theme === "dark" ? "#e53e3e" : "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "6px 14px",
            fontWeight: "600",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            transition: "background-color 0.3s ease",
          }}
          title="Logout"
        >
          <FiLogOut style={{ verticalAlign: "middle", marginRight: 6 }} />
          Logout
        </button>
      </div>
    </header>
  );
}
