import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ElectionDateManager() {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchDate = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_config")
        .select("value")
        .eq("key", "election_date")
        .single();

      if (error) {
        console.error("Fetch error:", error.message);
        setStatus({ type: "error", message: "Error fetching date" });
      } else {
        setDate(data?.value ?? "");
        setStatus(null);
      }
      setLoading(false);
    };

    fetchDate();
  }, []);

  const handleSave = async () => {
    if (!date) {
      setStatus({ type: "error", message: "Please select a date." });
      return;
    }

    setStatus({ type: "info", message: "Saving..." });

    const { error } = await supabase
      .from("app_config")
      .upsert({ key: "election_date", value: date }, { onConflict: "key" });

    if (error) {
      console.error("Save error:", error.message);
      setStatus({ type: "error", message: "Failed to save date." });
    } else {
      setStatus({ type: "success", message: "Election date updated!" });
    }
  };

  return (
    <div
      className="card"
      style={{
        background: "#fff",
        padding: "2rem",
        maxWidth: 500,
        margin: "2rem auto",
        borderRadius: 12,
        boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <h2 style={{ marginBottom: 10 }}>🗓️ Election Date</h2>

      {loading ? (
        <p>Loading election date...</p>
      ) : (
        <>
          <label
            htmlFor="election-date"
            style={{ fontSize: 14, fontWeight: 500 }}
          >
            Select Election Date:
          </label>

          <input
            id="election-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem",
              fontSize: 16,
              marginTop: 6,
              border: "1px solid #ccc",
              borderRadius: 6,
            }}
          />

          <button
            onClick={handleSave}
            style={{
              marginTop: 20,
              backgroundColor: "#0066ff",
              color: "#fff",
              border: "none",
              padding: "0.6rem 1.2rem",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              transition: "0.3s",
            }}
          >
            Save Date
          </button>

          {status && (
            <p
              style={{
                marginTop: 12,
                fontSize: 14,
                color:
                  status.type === "success"
                    ? "green"
                    : status.type === "error"
                      ? "crimson"
                      : "#333",
              }}
            >
              {status.message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
