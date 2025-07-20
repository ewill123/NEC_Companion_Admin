import React, { useContext } from "react";
import { ThemeContext } from "../themeContext";
import { MoonStar, SunMedium, LogOut } from "lucide-react";

export default function Header({ newCount, onLogout }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <header
      role="banner"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        backgroundColor: isDark ? "#12171d" : "#fff",
        borderBottom: isDark ? "1px solid #2c2f38" : "1px solid #e2e8f0",
        boxShadow: isDark
          ? "none"
          : "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen",
        userSelect: "none",
        zIndex: 1000,
      }}
    >
      {/* Logo & Title */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 1,
          minWidth: 0,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: isDark ? "#f9fafb" : "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          NEC Reports
        </h1>

        {newCount > 0 && (
          <span
            role="status"
            aria-live="polite"
            aria-atomic="true"
            title={`${newCount} new reports`}
            style={{
              backgroundColor: "#ef4444",
              color: "#fff",
              fontSize: "0.75rem",
              padding: "0.125rem 0.5rem",
              borderRadius: 9999,
              fontWeight: 700,
              lineHeight: 1,
              minWidth: 24,
              textAlign: "center",
              boxShadow: "0 0 6px 2px rgba(239, 68, 68, 0.5)",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          >
            {newCount}
          </span>
        )}
      </div>

      {/* Controls */}
      <nav
        aria-label="Primary navigation"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          title={`Switch to ${isDark ? "light" : "dark"} mode`}
          type="button"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: isDark ? "#facc15" : "#374151",
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            padding: 8,
            borderRadius: 8,
            transition: "color 0.3s ease",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
          }}
        >
          {isDark ? <SunMedium size={24} /> : <MoonStar size={24} />}
        </button>

        {/* Logout button */}
        <button
          onClick={onLogout}
          type="button"
          title="Logout"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#ef4444",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(239, 68, 68, 0.5)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#dc2626")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#ef4444")
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.8;
          }
        }
        button:focus {
          outline: 3px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>
    </header>
  );
}
