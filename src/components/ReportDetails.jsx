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

  if (!report) {
    return (
      <p
        style={{
          marginTop: 50,
          fontSize: 16,
          color: theme === "dark" ? "#888" : "#777",
          userSelect: "none",
          textAlign: "center",
          flexGrow: 1,
        }}
      >
        Select a report to view details
      </p>
    );
  }

  const isDark = theme === "dark";

  return (
    <div
      style={{
        flexBasis: "40%",
        border: `1px solid ${isDark ? "#444" : "#ddd"}`,
        borderRadius: 8,
        padding: 20,
        overflowY: "auto",
        backgroundColor: isDark ? "#1c1c1c" : "#fafafa",
        color: isDark ? "#f1f1f1" : "#222",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        fontSize: 15.5,
        lineHeight: 1.5,
        transition: "all 0.3s ease",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontWeight: "700",
          fontSize: 20,
          color: isDark ? "#4bb2d6" : "#0077b6",
        }}
      >
        Report #{report.id}
      </h2>

      <div>
        <strong>Name:</strong> {report.name || <em>N/A</em>}
      </div>
      <div>
        <strong>Email:</strong> {report.email || <em>N/A</em>}
      </div>
      <div>
        <strong>Phone:</strong> {report.phone || <em>N/A</em>}
      </div>

      <div>
        <strong>Description:</strong>
        <div
          style={{
            backgroundColor: isDark ? "#111" : "#fff",
            color: isDark ? "#ddd" : "#222",
            padding: 14,
            borderRadius: 8,
            border: `1px solid ${isDark ? "#333" : "#ccc"}`,
            marginTop: 6,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            overflowY: "auto",
            maxHeight: 200,
            fontSize: 15,
          }}
        >
          {report.description || "No description provided."}
        </div>
      </div>

      <div>
        <strong>Assigned Department:</strong>{" "}
        {report.assigned_department ? (
          <span style={{ fontWeight: 600 }}>{report.assigned_department}</span>
        ) : (
          <em style={{ color: isDark ? "#aaa" : "#999" }}>Unassigned</em>
        )}
      </div>

      <div>
        <strong>Status:</strong>{" "}
        <span
          style={{
            color:
              report.status === "Assigned"
                ? "#38a169"
                : isDark
                  ? "#e2e8f0"
                  : "#444",
            fontWeight: 600,
          }}
        >
          {report.status || "New"}
        </span>
      </div>

      <div>
        <strong>Created:</strong> {new Date(report.created_at).toLocaleString()}
      </div>

      <hr
        style={{
          marginTop: 16,
          marginBottom: 8,
          borderColor: isDark ? "#333" : "#ccc",
        }}
      />

      <div>
        <label
          htmlFor="assign-dept"
          style={{
            display: "block",
            fontWeight: "600",
            marginBottom: 6,
          }}
        >
          Assign to Department:
        </label>
        <select
          id="assign-dept"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          disabled={assigning}
          style={{
            padding: "10px 12px",
            borderRadius: 6,
            border: `1px solid ${isDark ? "#444" : "#ccc"}`,
            backgroundColor: isDark ? "#1a1a1a" : "#fff",
            color: isDark ? "#eee" : "#222",
            fontSize: 15,
            width: "100%",
            cursor: assigning ? "not-allowed" : "pointer",
            outline: "none",
          }}
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
            marginTop: 12,
            width: "100%",
            backgroundColor: assigning ? "#999" : "#4bb2d6",
            color: "white",
            border: "none",
            padding: 12,
            borderRadius: 6,
            fontWeight: "600",
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor:
              assigning || !selectedDepartment ? "not-allowed" : "pointer",
            transition: "background 0.2s ease",
          }}
        >
          {assigning ? (
            "Assigning..."
          ) : (
            <>
              <FiCheckCircle style={{ marginRight: 6 }} /> Assign Department
            </>
          )}
        </button>
      </div>
    </div>
  );
}
