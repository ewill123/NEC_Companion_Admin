import React from "react";

export default function ReportTable({
  reports,
  selectedReport,
  setSelectedReport,
  markAsRead,
  deleteReport,
  loading,
}) {
  return (
    <div
      style={{
        flexBasis: "60%",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
      role="region"
      aria-label="Reports table"
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead
          style={{
            backgroundColor: "#4bb2d6",
            color: "#fff",
            userSelect: "none",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <tr>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>ID</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>Name</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>
              Department
            </th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "12px 8px", textAlign: "left" }}>
              Created At
            </th>
            <th
              style={{ padding: "12px 8px", textAlign: "center" }}
              aria-label="Unread"
            >
              Unread
            </th>
            <th
              style={{ padding: "12px 8px", textAlign: "center" }}
              aria-label="Actions"
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                Loading reports...
              </td>
            </tr>
          ) : reports.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                No reports found.
              </td>
            </tr>
          ) : (
            reports.map((report) => (
              <tr
                key={report.id}
                style={{
                  backgroundColor:
                    selectedReport?.id === report.id
                      ? "#d0f0fd"
                      : "transparent",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
                onClick={() => {
                  setSelectedReport(report);
                  if (!report.is_read) markAsRead(report.id);
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedReport(report);
                    if (!report.is_read) markAsRead(report.id);
                  }
                }}
                aria-selected={selectedReport?.id === report.id}
                role="row"
              >
                <td style={{ padding: "10px 8px" }}>{report.id}</td>
                <td style={{ padding: "10px 8px" }}>{report.name || "-"}</td>
                <td style={{ padding: "10px 8px" }}>
                  {report.assigned_department ? (
                    report.assigned_department
                  ) : (
                    <em style={{ color: "#999" }}>Unassigned</em>
                  )}
                </td>
                <td style={{ padding: "10px 8px" }}>{report.status || "-"}</td>
                <td style={{ padding: "10px 8px" }}>
                  {new Date(report.created_at).toLocaleString()}
                </td>
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "center",
                    color: report.is_read ? "#aaa" : "#f5a700",
                    fontWeight: report.is_read ? "normal" : "700",
                  }}
                >
                  {report.is_read ? "✓" : "•"}
                </td>
                <td
                  style={{
                    padding: "10px 8px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReport(report);
                    }}
                    style={{
                      backgroundColor: "#f44336",
                      border: "none",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: "700",
                    }}
                    title="Delete Report"
                    aria-label={`Delete report ID ${report.id}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
