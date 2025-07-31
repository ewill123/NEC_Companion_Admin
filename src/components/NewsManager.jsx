import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import {
  FiPlusCircle,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiLoader,
  FiFilter,
} from "react-icons/fi";
import { ThemeContext } from "../themeContext";

export default function NewsManager() {
  const { theme } = useContext(ThemeContext);
  const [news, setNews] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const isDark = theme === "dark";
  const textColor = isDark ? "#f4f4f4" : "#1f2937";
  const bgColor = isDark ? "#111827" : "#ffffff";
  const borderColor = isDark ? "#374151" : "#d1d5db";
  const cardColor = isDark ? "#1f2937" : "#f9fafb";
  const secondaryText = isDark ? "#9ca3af" : "#4b5563";

  const fetchNews = async () => {
    setLoading(true);
    let query = supabase
      .from("news")
      .select("id,title,description,created_at")
      .order("created_at", { ascending: false });

    if (filter === "today") {
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("created_at", `${today}T00:00:00Z`);
    } else if (filter === "week") {
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      query = query.gte("created_at", oneWeekAgo);
    } else if (filter === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      query = query.gte("created_at", oneMonthAgo.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      setStatus({ type: "error", message: "Failed to fetch news." });
    } else {
      setNews(data);
      setStatus(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, [filter]);

  const addNews = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      setStatus({
        type: "error",
        message: "Please enter both title and description.",
      });
      return;
    }

    setSaving(true);
    setStatus({ type: "info", message: "Adding news..." });

    const { data, error, status: insertStatus } = await supabase
      .from("news")
      .insert([
        {
          title: newTitle.trim(),
          description: newDescription.trim(),
        },
      ]);

    console.log("Insert result:", { insertStatus, error, data });

    if (error) {
      setStatus({ type: "error", message: "Error adding news." });
    } else {
      setNewTitle("");
      setNewDescription("");
      setStatus({ type: "success", message: "News added successfully!" });
      fetchNews();
    }

    setSaving(false);
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?"))
      return;

    setDeletingId(id);
    setStatus({ type: "info", message: "Deleting news..." });

    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      setStatus({ type: "error", message: "Failed to delete news." });
    } else {
      setStatus({ type: "success", message: "News deleted." });
      fetchNews();
    }
    setDeletingId(null);
  };

  const renderStatusIcon = () => {
    switch (status?.type) {
      case "success":
        return <FiCheckCircle style={{ color: "green", marginRight: 8 }} />;
      case "error":
        return <FiAlertTriangle style={{ color: "crimson", marginRight: 8 }} />;
      case "info":
        return <FiInfo style={{ color: "#3b82f6", marginRight: 8 }} />;
      default:
        return null;
    }
  };

  return (
    <main
      style={{
        maxWidth: 1200,
        margin: "3rem auto",
        padding: "0 1rem",
        fontFamily: "'Inter', sans-serif",
        color: textColor,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 30, fontWeight: 700 }}>📰 News Manager</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FiFilter size={20} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${borderColor}`,
              fontSize: 14,
              background: bgColor,
              color: textColor,
            }}
          >
            <option value="all">All</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      <section style={{ marginBottom: 40 }}>
        <input
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 14,
            marginBottom: 10,
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            fontSize: 16,
            background: bgColor,
            color: textColor,
          }}
        />
        <textarea
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 14,
            marginBottom: 14,
            borderRadius: 10,
            border: `1px solid ${borderColor}`,
            fontSize: 15,
            background: bgColor,
            color: textColor,
          }}
        />
        <button
          onClick={addNews}
          disabled={saving}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          {saving ? <FiLoader className="spin" /> : <FiPlusCircle />} Add News
        </button>
        {status && (
          <p
            style={{
              marginTop: 16,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color:
                status.type === "success"
                  ? "green"
                  : status.type === "error"
                  ? "crimson"
                  : "#2563eb",
            }}
          >
            {renderStatusIcon()} {status.message}
          </p>
        )}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 24,
        }}
      >
        {loading ? (
          <p style={{ fontSize: 18, textAlign: "center" }}>Loading news...</p>
        ) : news.length === 0 ? (
          <p style={{ fontSize: 18, textAlign: "center" }}>
            No news items found.
          </p>
        ) : (
          news.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: cardColor,
                padding: 20,
                borderRadius: 14,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <h4 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                {item.title}
              </h4>
              <p style={{ fontSize: 15, color: secondaryText }}>
                {item.description}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 16,
                }}
              >
                <time style={{ fontSize: 13, color: secondaryText }}>
                  {new Date(item.created_at).toLocaleString()}
                </time>
                <button
                  onClick={() => deleteNews(item.id)}
                  disabled={deletingId === item.id}
                  style={{
                    backgroundColor: "crimson",
                    color: "white",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  {deletingId === item.id ? (
                    <FiLoader className="spin" />
                  ) : (
                    <FiTrash2 />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      <style>
        {`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </main>
  );
}
