import React, { useContext } from "react";
import { ThemeContext } from "../themeContext";
import { FiCheckCircle } from "react-icons/fi";

export default function ReportDetails({
  report,
  departments,
  selectedDepartment,
  setSelectedDepartment,
  assignToDepartment,
  assigning,
}) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  if (!report) {
    return (
      <div
        style={{
          flexBasis: "40%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isDark ? "#888" : "#666",
          fontSize: 18,
          fontWeight: "500",
          fontStyle: "italic",
          userSelect: "none",
          padding: 20,
          height: "100%",
          backgroundColor: isDark ? "#222" : "#fafafa",
          borderRadius: 12,
          boxShadow: isDark
            ? "0 4px 12px rgba(0,0,0,0.7)"
            : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        Select a report to view details
      </div>
    );
  }

  const AssignedIcon = ({ assigned }) => (
    <span
      aria-label={assigned ? "Assigned" : "Unassigned"}
      title={assigned ? "Assigned" : "Unassigned"}
      style={{
        color: assigned ? "#38a169" : "#e53e3e",
        fontWeight: "bold",
        fontSize: 20,
        marginLeft: 6,
        userSelect: "none",
      }}
    >
      {assigned ? "✔" : "✖"}
    </span>
  );

  return (
    <section
      style={{
        flexBasis: "40%",
        backgroundColor: isDark ? "#121212" : "#fff",
        borderRadius: 14,
        boxShadow: isDark
          ? "0 6px 18px rgba(0, 0, 0, 0.8)"
          : "0 6px 18px rgba(0, 0, 0, 0.12)",
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        color: isDark ? "#e0e0e0" : "#222",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <header
        style={{
          borderBottom: `2px solid ${isDark ? "#333" : "#ddd"}`,
          paddingBottom: 12,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: isDark ? "#4bb2d6" : "#0077b6",
            letterSpacing: 0.8,
          }}
        >
          {report.name
            ? `Report by ${report.name}`
            : `Report #${String(report.id).slice(0, 8)}`}
        </h2>
        <span
          style={{
            fontWeight: "600",
            fontSize: 14,
            padding: "4px 12px",
            borderRadius: 20,
            backgroundColor:
              report.status === "Assigned"
                ? "#38a169"
                : isDark
                  ? "#555"
                  : "#ccc",
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            userSelect: "none",
          }}
        >
          {report.status || "New"}
        </span>
      </header>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: 600,
          fontSize: 16,
          color: isDark ? "#9bbbd4" : "#444",
          marginBottom: 12,
          gap: 8,
        }}
      >
        <span>Submitted To:</span>
        <span
          style={{
            color: isDark ? "#d0d0d0" : "#222",
            fontWeight: "normal",
          }}
        >
          {report.submitted_department || "N/A"}
        </span>
        <AssignedIcon assigned={!!report.assigned_department} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Name", value: report.name },
          { label: "Email", value: report.email },
          { label: "Phone", value: report.phone },
          {
            label: "Created",
            value: new Date(report.created_at).toLocaleString(),
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <label
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: isDark ? "#9bbbd4" : "#444",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                marginBottom: 6,
                display: "block",
              }}
            >
              {label}
            </label>
            <p style={{ fontSize: 16, color: isDark ? "#d0d0d0" : "#222" }}>
              {value || <em>N/A</em>}
            </p>
          </div>
        ))}
      </div>

      <section>
        <label
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 8,
            display: "block",
            color: isDark ? "#4bb2d6" : "#0077b6",
          }}
        >
          Description
        </label>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            backgroundColor: isDark ? "#1a1a1a" : "#f5f9ff",
            border: `1px solid ${isDark ? "#333" : "#ccd6f6"}`,
            borderRadius: 10,
            padding: 18,
            fontFamily: "monospace, monospace",
            fontSize: 15,
            color: isDark ? "#cbd5e1" : "#334155",
            maxHeight: 180,
            overflowY: "auto",
            userSelect: "text",
          }}
        >
          {report.description || "No description provided."}
        </pre>
      </section>

      {report.attachment_url && (
        <section>
          <label
            style={{
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 8,
              display: "block",
              color: isDark ? "#4bb2d6" : "#0077b6",
            }}
          >
            Attached Image
          </label>
          <a
            href={report.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: isDark
                ? "0 6px 16px rgba(75, 178, 214, 0.5)"
                : "0 6px 16px rgba(0, 119, 182, 0.3)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <img
              src={report.attachment_url}
              alt="Attached Report"
              style={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                display: "block",
              }}
            />
          </a>
        </section>
      )}

      <section style={{ marginTop: 20 }}>
        <label
          htmlFor="assign-dept"
          style={{
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 6,
            display: "block",
            color: isDark ? "#9bbbd4" : "#555",
          }}
        >
          Assign to Department
        </label>
        <select
          id="assign-dept"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          disabled={assigning}
          style={{
            width: "100%",
            padding: "12px 14px",
            fontSize: 15,
            borderRadius: 8,
            border: `1.8px solid ${isDark ? "#4bb2d6" : "#0077b6"}`,
            backgroundColor: isDark ? "#121212" : "#f0f8ff",
            color: isDark ? "#e0e0e0" : "#222",
            cursor: assigning ? "not-allowed" : "pointer",
            outline: "none",
            transition: "border-color 0.3s ease",
          }}
          onFocus={(e) =>
            (e.currentTarget.style.borderColor = isDark ? "#8dd2ff" : "#3399ff")
          }
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = isDark ? "#4bb2d6" : "#0077b6")
          }
        >
          <option value="">Select department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <button
          onClick={assignToDepartment}
          disabled={assigning || !selectedDepartment}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "14px 0",
            fontSize: 17,
            fontWeight: "700",
            borderRadius: 10,
            border: "none",
            backgroundColor: assigning
              ? "#999"
              : isDark
                ? "#3399ff"
                : "#0077b6",
            color: "#fff",
            cursor:
              assigning || !selectedDepartment ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background-color 0.3s ease",
            boxShadow: assigning
              ? "none"
              : isDark
                ? "0 4px 12px rgba(51, 153, 255, 0.6)"
                : "0 4px 12px rgba(0, 119, 182, 0.6)",
          }}
          onMouseEnter={(e) => {
            if (!assigning && selectedDepartment) {
              e.currentTarget.style.backgroundColor = isDark
                ? "#1a78e1"
                : "#005fa3";
              e.currentTarget.style.boxShadow = isDark
                ? "0 6px 20px rgba(26, 120, 225, 0.8)"
                : "0 6px 20px rgba(0, 95, 163, 0.8)";
            }
          }}
          onMouseLeave={(e) => {
            if (!assigning && selectedDepartment) {
              e.currentTarget.style.backgroundColor = isDark
                ? "#3399ff"
                : "#0077b6";
              e.currentTarget.style.boxShadow = isDark
                ? "0 4px 12px rgba(51, 153, 255, 0.6)"
                : "0 4px 12px rgba(0, 119, 182, 0.6)";
            }
          }}
        >
          {assigning ? (
            "Assigning..."
          ) : (
            <>
              <FiCheckCircle size={20} /> Assign Department
            </>
          )}
        </button>
      </section>
    </section>
  );
}
