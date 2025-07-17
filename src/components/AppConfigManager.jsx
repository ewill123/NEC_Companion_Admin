import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import { ThemeContext } from "../themeContext";

export default function AppConfigManager() {
  const { theme } = useContext(ThemeContext);
  const [configs, setConfigs] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [editingValue, setEditingValue] = useState("");
  const [status, setStatus] = useState(null);

  const fetchConfigs = async () => {
    const { data, error } = await supabase
      .from("app_config")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch configs:", error.message);
    } else {
      setConfigs(data);
    }
  };

  const updateConfig = async () => {
    if (!editingKey) return;

    const { error } = await supabase
      .from("app_config")
      .upsert([{ key: editingKey, value: editingValue }]);

    if (error) {
      setStatus({ type: "error", message: "Update failed." });
    } else {
      setStatus({ type: "success", message: "Updated successfully!" });
      setEditingKey("");
      setEditingValue("");
      fetchConfigs();
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 800,
        margin: "auto",
        fontFamily: "'Inter', sans-serif",
        color: theme === "dark" ? "#eee" : "#222",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>⚙️ App Configuration Manager</h2>

      <div
        style={{
          marginBottom: 32,
          background: theme === "dark" ? "#1e1e1e" : "#f9f9f9",
          padding: 16,
          borderRadius: 8,
          boxShadow:
            theme === "dark"
              ? "0 0 8px rgba(255,255,255,0.05)"
              : "0 0 8px rgba(0,0,0,0.05)",
        }}
      >
        <input
          type="text"
          placeholder="Key (e.g. electionDate)"
          value={editingKey}
          onChange={(e) => setEditingKey(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
            backgroundColor: theme === "dark" ? "#2c2c2c" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        />
        <input
          type="text"
          placeholder="Value"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 12,
            borderRadius: 6,
            border: "1px solid #ccc",
            backgroundColor: theme === "dark" ? "#2c2c2c" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        />
        <button
          onClick={updateConfig}
          style={{
            background: "#0066ff",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          💾 Save Config
        </button>

        {status && (
          <p
            style={{
              marginTop: 12,
              color: status.type === "error" ? "crimson" : "green",
            }}
          >
            {status.message}
          </p>
        )}
      </div>

      <h3 style={{ marginBottom: 12 }}>🔍 Current Configurations</h3>
      {configs.map((cfg) => (
        <div
          key={cfg.id}
          style={{
            background: theme === "dark" ? "#2a2a2a" : "#fff",
            padding: 14,
            marginBottom: 10,
            borderRadius: 6,
            border: "1px solid #ddd",
            color: theme === "dark" ? "#fff" : "#333",
          }}
        >
          <strong>{cfg.key}</strong>: {cfg.value}
        </div>
      ))}
    </div>
  );
}
