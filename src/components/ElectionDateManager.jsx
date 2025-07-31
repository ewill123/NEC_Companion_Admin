import React, { useState, useEffect, useContext } from "react";
import { supabase } from "../supabaseClient";
import {
  FiCalendar,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { ThemeContext } from "../themeContext";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function ElectionDateManager() {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const [date, setDate] = useState(null);
  const [electionDayMessage, setElectionDayMessage] = useState("");
  const [electionAfterMessage, setElectionAfterMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", [
          "election_date",
          "electionDayMessage",
          "electionAfterMessage",
        ]);

      if (error) {
        setStatus({ type: "error", message: "Failed to load config" });
      } else {
        const config = Object.fromEntries(data.map((d) => [d.key, d.value]));
        if (config.election_date) setDate(new Date(config.election_date));
        setElectionDayMessage(config.electionDayMessage || "");
        setElectionAfterMessage(config.electionAfterMessage || "");
        setStatus(null);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!date) {
      setStatus({ type: "error", message: "Please select an election date" });
      return;
    }
    setSaving(true);
    setStatus({ type: "info", message: "Saving..." });

    const updates = [
      { key: "election_date", value: date.toISOString().split("T")[0] },
      { key: "electionDayMessage", value: electionDayMessage },
      { key: "electionAfterMessage", value: electionAfterMessage },
    ];

    const { error } = await supabase.from("app_config").upsert(updates, {
      onConflict: "key",
    });

    setSaving(false);
    setStatus(
      error
        ? { type: "error", message: "Failed to save" }
        : { type: "success", message: "Configurations saved" }
    );
  };

  // Calculate days left and progress percentage (max 60 days)
  const now = new Date();
  const maxDays = 60;
  const daysLeft = date
    ? Math.max(Math.ceil((date - now) / (1000 * 60 * 60 * 24)), 0)
    : null;
  const progressPercent =
    daysLeft !== null
      ? Math.min(((maxDays - daysLeft) / maxDays) * 100, 100)
      : 0;

  const StatusIcon = () => {
    if (!status) return null;
    const color =
      status.type === "success"
        ? "limegreen"
        : status.type === "error"
          ? "crimson"
          : "#3b82f6";
    const Icon =
      status.type === "success"
        ? FiCheckCircle
        : status.type === "error"
          ? FiAlertCircle
          : FiInfo;
    return <Icon size={18} color={color} />;
  };

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "3rem auto",
        padding: "2rem 2.5rem",
        backgroundColor: isDark ? "#121827" : "#fff",
        borderRadius: 12,
        boxShadow: isDark
          ? "0 6px 30px rgba(0,0,0,0.7)"
          : "0 6px 30px rgba(0,0,0,0.1)",
        color: isDark ? "#e0e7ff" : "#334155",
        fontFamily: "'Inter', sans-serif",
        userSelect: "none",
      }}
      aria-live="polite"
      aria-busy={loading || saving}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
          color: isDark ? "#cbd5e1" : "#1e293b",
        }}
      >
        <FiCalendar />
        Set Election Date & Messages
      </h2>

      {loading ? (
        <p
          style={{
            fontStyle: "italic",
            fontSize: 16,
            color: isDark ? "#9ca3af" : "#6b7280",
          }}
        >
          Loading settings...
        </p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            {/* Calendar */}
            <section style={{ flex: "1 1 280px" }}>
              <label
                htmlFor="election-date-picker"
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  marginBottom: 12,
                  display: "block",
                  color: isDark ? "#cbd5e1" : "#334155",
                }}
              >
                Select Election Date
              </label>

              <DayPicker
                mode="single"
                selected={date}
                onSelect={setDate}
                className={isDark ? "rdp-dark" : ""}
                modifiersClassNames={{
                  selected: "rdp-selected",
                  today: "rdp-today",
                }}
              />

              {/* Show selected date with countdown progress bar */}
              {date && (
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: isDark ? "#1e293b" : "#f9fafb",
                    boxShadow: isDark ? "0 0 12px #2563eb" : "0 0 12px #3b82f6",
                  }}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 600,
                      fontSize: 15,
                      color: isDark ? "#d1d5db" : "#334155",
                    }}
                  >
                    Election Date:{" "}
                    <time dateTime={date.toISOString()}>
                      {date.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </p>

                  <p
                    style={{
                      margin: "8px 0 10px",
                      color: isDark ? "#a5b4fc" : "#2563eb",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {daysLeft === 0
                      ? "Today is Election Day! 🎉"
                      : daysLeft > maxDays
                        ? `Election is in more than ${maxDays} days`
                        : `Days Left: ${daysLeft}`}
                  </p>

                  {/* Progress bar container */}
                  <div
                    style={{
                      height: 12,
                      width: "100%",
                      backgroundColor: isDark ? "#334155" : "#d1d5db",
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow: isDark
                        ? "inset 0 0 5px rgba(0,0,0,0.5)"
                        : "inset 0 0 5px rgba(0,0,0,0.1)",
                    }}
                    aria-label={`Time left to election: ${daysLeft} days`}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={maxDays}
                    aria-valuenow={daysLeft !== null ? maxDays - daysLeft : 0}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPercent}%`,
                        backgroundColor: isDark ? "#2563eb" : "#3b82f6",
                        transition: "width 0.5s ease-in-out",
                      }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Messages */}
            <section style={{ flex: "1 1 400px", minWidth: 280 }}>
              <label
                htmlFor="electionDayMessage"
                style={{
                  marginTop: 0,
                  fontWeight: 600,
                  fontSize: 16,
                  color: isDark ? "#cbd5e1" : "#334155",
                  display: "block",
                }}
              >
                Election Day Message
              </label>
              <textarea
                id="electionDayMessage"
                rows={3}
                value={electionDayMessage}
                onChange={(e) => setElectionDayMessage(e.target.value)}
                placeholder="Displayed on election day"
                style={textAreaStyle(isDark)}
              />

              <label
                htmlFor="electionAfterMessage"
                style={{
                  marginTop: 24,
                  fontWeight: 600,
                  fontSize: 16,
                  color: isDark ? "#cbd5e1" : "#334155",
                  display: "block",
                }}
              >
                After Election Message
              </label>
              <textarea
                id="electionAfterMessage"
                rows={3}
                value={electionAfterMessage}
                onChange={(e) => setElectionAfterMessage(e.target.value)}
                placeholder="Displayed after election"
                style={textAreaStyle(isDark)}
              />

              <button
                onClick={handleSave}
                disabled={saving}
                style={buttonStyle(isDark, saving)}
                aria-label="Save Election Configurations"
              >
                <FiSave size={20} />
                {saving ? "Saving..." : "Save Configurations"}
              </button>

              {status && (
                <p
                  role="alert"
                  style={{
                    marginTop: 20,
                    fontWeight: 600,
                    fontSize: 15,
                    color:
                      status.type === "success"
                        ? "limegreen"
                        : status.type === "error"
                          ? "crimson"
                          : "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    userSelect: "text",
                  }}
                >
                  <StatusIcon /> {status.message}
                </p>
              )}
            </section>
          </div>
        </>
      )}

      {/* Dark mode styles for react-day-picker */}
      <style>{`
        /* Dark theme overrides for react-day-picker */
        .rdp-dark {
          --rdp-background-color: #1e293b;
          --rdp-accent-color: #2563eb;
          --rdp-accent-hover-color: #1e40af;
          --rdp-text-color: #e0e7ff;
          --rdp-day-hover-background: #2563eb;
          --rdp-day-hover-text-color: white;
          --rdp-day-selected-background: #2563eb;
          --rdp-day-selected-text-color: white;
          --rdp-day-today-border-color: #3b82f6;
          --rdp-day-disabled-opacity: 0.3;
          border-radius: 10px;
          box-shadow: ${isDark ? "0 0 20px #3b82f6" : "none"};
        }

        .rdp-selected {
          border-radius: 10px !important;
        }

        .rdp-today {
          font-weight: 700;
        }
      `}</style>
    </main>
  );
}

const textAreaStyle = (dark) => ({
  width: "100%",
  padding: 12,
  fontSize: 15,
  borderRadius: 8,
  border: `1.5px solid ${dark ? "#475569" : "#cbd5e1"}`,
  backgroundColor: dark ? "#1e293b" : "#f9fafb",
  color: dark ? "#e0e7ff" : "#334155",
  resize: "vertical",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif",
});

const buttonStyle = (dark, disabled) => ({
  marginTop: 30,
  backgroundColor: dark ? "#2563eb" : "#2563eb",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  padding: "12px 28px",
  borderRadius: 10,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
  boxShadow: dark
    ? "0 4px 16px rgba(37, 99, 235, 0.7)"
    : "0 4px 16px rgba(37, 99, 235, 0.7)",
  transition: "background-color 0.3s ease",
});
