import React, { useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FiCalendar,
  FiSave,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";
import { ThemeContext } from "../themeContext";

export default function ElectionDateManager() {
  const { theme } = useContext(ThemeContext);

  const [date, setDate] = useState(null); // Date object for picker
  const [electionDayMessage, setElectionDayMessage] = useState("");
  const [electionAfterMessage, setElectionAfterMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true);
      const keys = [
        "election_date",
        "electionDayMessage",
        "electionAfterMessage",
      ];
      const { data, error } = await supabase
        .from("app_config")
        .select("key, value")
        .in("key", keys);

      if (error) {
        console.error("Fetch error:", error.message);
        setStatus({ type: "error", message: "Error fetching configurations." });
      } else {
        const configMap = {};
        data.forEach(({ key, value }) => {
          configMap[key] = value;
        });
        setDate(
          configMap.election_date ? new Date(configMap.election_date) : null
        );
        setElectionDayMessage(
          configMap.electionDayMessage || "Today is Election Day!"
        );
        setElectionAfterMessage(
          configMap.electionAfterMessage || "The election has concluded."
        );
        setStatus(null);
      }
      setLoading(false);
    };

    fetchConfigs();
  }, []);

  const handleSave = async () => {
    if (!date) {
      setStatus({ type: "error", message: "Please select an election date." });
      return;
    }
    setSaving(true);
    setStatus({ type: "info", message: "Saving configurations..." });

    const formattedDate = date.toISOString().split("T")[0];

    // Upsert all configs in a batch
    const updates = [
      { key: "election_date", value: formattedDate },
      { key: "electionDayMessage", value: electionDayMessage },
      { key: "electionAfterMessage", value: electionAfterMessage },
    ];

    // Supabase upsert with onConflict key for all keys
    const { error } = await supabase.from("app_config").upsert(updates, {
      onConflict: "key",
    });

    if (error) {
      console.error("Save error:", error.message);
      setStatus({ type: "error", message: "Failed to save configurations." });
    } else {
      setStatus({
        type: "success",
        message: "Configurations updated successfully!",
      });
    }
    setSaving(false);
  };

  // Status icon helper
  const renderStatusIcon = () => {
    switch (status?.type) {
      case "success":
        return <FiCheckCircle style={{ color: "green", marginRight: 6 }} />;
      case "error":
        return <FiAlertCircle style={{ color: "crimson", marginRight: 6 }} />;
      case "info":
        return <FiInfo style={{ color: "#3b82f6", marginRight: 6 }} />;
      default:
        return null;
    }
  };

  return (
    <main
      aria-live="polite"
      aria-busy={loading || saving}
      style={{
        maxWidth: 700,
        width: "90vw",
        margin: "3rem auto",
        padding: "3rem 2.5rem",
        backgroundColor: theme === "dark" ? "#1f2937" : "#fff",
        borderRadius: 12,
        boxShadow:
          theme === "dark"
            ? "0 8px 24px rgba(0,0,0,0.8)"
            : "0 8px 24px rgba(0,0,0,0.12)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen",
        color: theme === "dark" ? "#d1d5db" : "#1f2937",
        userSelect: "none",
        overflowWrap: "break-word",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          fontWeight: 700,
          fontSize: 28,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: theme === "dark" ? "#d1d5db" : "#111827",
        }}
      >
        <FiCalendar size={28} />
        Next Election Date & Messages
      </h2>

      {loading ? (
        <p
          style={{
            fontSize: 16,
            color: theme === "dark" ? "#9ca3af" : "#4b5563",
          }}
        >
          Loading configurations...
        </p>
      ) : (
        <>
          <label
            htmlFor="election-date-picker"
            style={{
              fontSize: 16,
              fontWeight: 600,
              display: "block",
              marginBottom: 8,
              color: theme === "dark" ? "#d1d5db" : "#374151",
            }}
          >
            Select Election Date:
          </label>

          <DatePicker
            id="election-date-picker"
            selected={date}
            onChange={(d) => setDate(d)}
            dateFormat="yyyy-MM-dd"
            placeholderText="Click to select a date"
            popperPlacement="bottom-start"
            calendarClassName={theme === "dark" ? "react-datepicker-dark" : ""}
            wrapperClassName="date-picker-wrapper"
            className="custom-date-picker-input"
            aria-label="Election date picker"
            isClearable
          />

          <label
            htmlFor="electionDayMessage"
            style={{
              marginTop: 24,
              fontWeight: 600,
              color: theme === "dark" ? "#d1d5db" : "#374151",
              display: "block",
            }}
          >
            Election Day Message:
          </label>
          <textarea
            id="electionDayMessage"
            rows={3}
            value={electionDayMessage}
            onChange={(e) => setElectionDayMessage(e.target.value)}
            placeholder="Message to show on the election day"
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              borderRadius: 8,
              border: `1.5px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
              backgroundColor: theme === "dark" ? "#374151" : "#fff",
              color: theme === "dark" ? "#f9fafb" : "#111827",
              fontSize: 15,
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
            }}
          />

          <label
            htmlFor="electionAfterMessage"
            style={{
              marginTop: 24,
              fontWeight: 600,
              color: theme === "dark" ? "#d1d5db" : "#374151",
              display: "block",
            }}
          >
            After Election Message:
          </label>
          <textarea
            id="electionAfterMessage"
            rows={3}
            value={electionAfterMessage}
            onChange={(e) => setElectionAfterMessage(e.target.value)}
            placeholder="Message to show after the election date has passed"
            style={{
              width: "100%",
              padding: 12,
              marginTop: 6,
              borderRadius: 8,
              border: `1.5px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"}`,
              backgroundColor: theme === "dark" ? "#374151" : "#fff",
              color: theme === "dark" ? "#f9fafb" : "#111827",
              fontSize: 15,
              fontFamily: "'Inter', sans-serif",
              resize: "vertical",
            }}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: 28,
              backgroundColor: theme === "dark" ? "#2563eb" : "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "14px 28px",
              borderRadius: 10,
              cursor: saving ? "not-allowed" : "pointer",
              fontWeight: 700,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow:
                theme === "dark"
                  ? "0 4px 12px rgba(37, 99, 235, 0.6)"
                  : "0 4px 12px rgba(59, 130, 246, 0.6)",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "dark" ? "#1e40af" : "#2563eb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "dark" ? "#2563eb" : "#3b82f6";
            }}
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
                fontSize: 15,
                color:
                  status.type === "success"
                    ? "green"
                    : status.type === "error"
                      ? "crimson"
                      : "#2563eb",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
                userSelect: "text",
              }}
            >
              {renderStatusIcon()}
              {status.message}
            </p>
          )}
        </>
      )}

      {/* Dark mode styles for datepicker */}
      <style>
        {`
          .react-datepicker__triangle {
            display: none;
          }
          .react-datepicker-dark .react-datepicker__header {
            background-color: #374151;
            border-bottom: none;
          }
          .react-datepicker-dark .react-datepicker__current-month,
          .react-datepicker-dark .react-datepicker__day-name,
          .react-datepicker-dark .react-datepicker__day,
          .react-datepicker-dark .react-datepicker__day--selected,
          .react-datepicker-dark .react-datepicker__day--keyboard-selected {
            color: #d1d5db;
          }
          .custom-date-picker-input {
            width: 100%;
            padding: 12px 14px;
            font-size: 16px;
            border-radius: 8px;
            border: 1.5px solid ${theme === "dark" ? "#4b5563" : "#d1d5db"};
            background-color: ${theme === "dark" ? "#374151" : "#fff"};
            color: ${theme === "dark" ? "#f9fafb" : "#111827"};
            outline: none;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
          }
          .custom-date-picker-input:focus {
            border-color: ${theme === "dark" ? "#3b82f6" : "#2563eb"};
          }
          .date-picker-wrapper {
            width: 100%;
          }
        `}
      </style>
    </main>
  );
}
