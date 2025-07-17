import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function NewsManager() {
  const [news, setNews] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [status, setStatus] = useState(null);

  const fetchNews = async () => {
    const { data, error } = await supabase
      .from("news")
      .select("id,title,description,created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus({ type: "error", message: "Failed to fetch news." });
      console.error(error);
    } else {
      setNews(data);
      setStatus(null);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const addNews = async () => {
    if (!newTitle || !newDescription) {
      setStatus({
        type: "error",
        message: "Please enter title and description.",
      });
      return;
    }

    const { error } = await supabase.from("news").insert({
      title: newTitle,
      description: newDescription,
    });

    if (error) {
      setStatus({ type: "error", message: "Error adding news." });
      console.error(error);
    } else {
      setNewTitle("");
      setNewDescription("");
      setStatus({ type: "success", message: "News added successfully!" });
      fetchNews();
    }
  };

  const deleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?"))
      return;

    const { error } = await supabase.from("news").delete().eq("id", id);

    if (error) {
      setStatus({ type: "error", message: "Failed to delete news." });
    } else {
      setStatus({ type: "success", message: "News deleted." });
      fetchNews();
    }
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "2rem auto",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 16 }}>📰 News Manager</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 8,
            borderRadius: 6,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        <textarea
          placeholder="Description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            minHeight: 100,
            border: "1px solid #ccc",
            fontSize: 14,
            resize: "vertical",
          }}
        />
        <button
          onClick={addNews}
          style={{
            marginTop: 12,
            backgroundColor: "#0066ff",
            color: "white",
            padding: "10px 16px",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          Add News
        </button>
        {status && (
          <p
            style={{
              marginTop: 8,
              color: status.type === "error" ? "crimson" : "green",
              fontWeight: "600",
            }}
          >
            {status.message}
          </p>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        {news.map((item) => (
          <div
            key={item.id}
            style={{
              background: "#f9f9f9",
              padding: 16,
              borderRadius: 6,
              marginBottom: 12,
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
            }}
          >
            <h4 style={{ marginBottom: 6, color: "#222", fontWeight: "700" }}>
              {item.title}
            </h4>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.5 }}>
              {item.description}
            </p>
            <button
              onClick={() => deleteNews(item.id)}
              style={{
                marginTop: 10,
                background: "crimson",
                color: "white",
                border: "none",
                padding: "6px 12px",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
