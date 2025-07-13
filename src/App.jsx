import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";

const codeSnippets = [
  "const fetchData = async () => {",
  "  const response = await fetch(url);",
  "  const data = await response.json();",
  "  return data;",
  "}",
  "function sum(a, b) { return a + b; }",
  "for(let i=0; i<10; i++) { console.log(i); }",
  "// TODO: optimize this function",
  "let user = { name: 'admin', role: 'superuser' };",
  "if(isAuthenticated) { navigate('/dashboard'); }",
];

function getRandomSnippet() {
  const index = Math.floor(Math.random() * codeSnippets.length);
  return codeSnippets[index];
}

export default function App() {
  const [session, setSession] = useState(null);
  const [reportsMap, setReportsMap] = useState(new Map());
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const lastReportIds = useRef(new Set());
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setSession(session));

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function fetchReports() {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Error fetching reports: " + error.message);
      return;
    }

    setLoadingReports(false);

    setReportsMap((prevMap) => {
      const newMap = new Map(prevMap);
      let newReports = 0;

      data.forEach((report) => {
        const existing = newMap.get(report.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(report)) {
          newMap.set(report.id, report);
          if (!report.is_read) newReports++;
        }
      });

      setNewCount(newReports);

      return newMap;
    });

    lastReportIds.current = new Set(data.map((r) => r.id));
  }

  async function markAsRead(id) {
    await supabase.from("issues").update({ is_read: true }).eq("id", id);
    setReportsMap((prevMap) => {
      const newMap = new Map(prevMap);
      const report = newMap.get(id);
      if (report) {
        newMap.set(id, { ...report, is_read: true });
      }
      return newMap;
    });
  }

  useEffect(() => {
    if (session) {
      fetchReports();
      const interval = setInterval(fetchReports, 15000);
      return () => clearInterval(interval);
    }
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSelectedReport(null);
  }

  const reportsArray = Array.from(reportsMap.values()).sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  if (!session)
    return (
      <Login
        onLogin={() =>
          supabase.auth
            .getSession()
            .then(({ data }) => setSession(data.session))
        }
      />
    );

  return (
    <>
      {/* Background code snippets faint overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          backgroundColor: "#121212",
          color: "#c5c8c6",
          fontFamily: "'Fira Code', monospace",
          fontSize: 14,
          lineHeight: 1.2,
          overflow: "hidden",
          opacity: 0.07,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          padding: 20,
          userSelect: "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          height: "100vh",
        }}
      >
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <div key={i} style={{ animation: `fadeInOut 15s linear infinite` }}>
              {getRandomSnippet()}
            </div>
          ))}
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: 32,
          fontFamily: "'Fira Code', monospace",
          color: "#d4d4d4",
          minHeight: "100vh",
          backgroundColor: "rgba(30,30,47, 0.9)",
          backdropFilter: "blur(6px)",
          maxWidth: 1200,
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 0 30px #ff4081",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h1 style={{ color: "#ff79c6", margin: 0, fontSize: "1.8rem" }}>
            NEC Companion Admin Dashboard
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{ position: "relative", cursor: "default" }}
              title={`${newCount} new unread report${newCount !== 1 ? "s" : ""}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="32"
                width="32"
                fill="#ff79c6"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="#ff79c6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {newCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "#ff79c6",
                    color: "#121212",
                    borderRadius: "50%",
                    padding: "2px 7px",
                    fontSize: 12,
                    fontWeight: "bold",
                    userSelect: "none",
                  }}
                >
                  {newCount}
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#ff4081",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                fontWeight: "bold",
                cursor: "pointer",
                userSelect: "none",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#ff79c6")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#ff4081")
              }
            >
              Logout
            </button>
          </div>
        </header>

        {loadingReports && <p>Loading reports...</p>}

        {!loadingReports && reportsArray.length === 0 && (
          <p>No reports found.</p>
        )}

        {!loadingReports && reportsArray.length > 0 && (
          <div className="table-wrapper" style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                userSelect: "none",
                fontSize: 14,
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#2a2a3d",
                    color: "#ff79c6",
                    userSelect: "none",
                  }}
                >
                  <th style={{ padding: "12px 16px" }}>ID</th>
                  <th style={{ padding: "12px 16px" }}>Name</th>
                  <th style={{ padding: "12px 16px" }}>Phone</th>
                  <th style={{ padding: "12px 16px" }}>Description</th>
                  <th style={{ padding: "12px 16px" }}>Date Submitted</th>
                  <th style={{ padding: "12px 16px", minWidth: 100 }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {reportsArray.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => {
                      setSelectedReport(report);
                      if (!report.is_read) markAsRead(report.id);
                    }}
                    style={{
                      cursor: "pointer",
                      borderBottom: "1px solid #3a3a4d",
                      backgroundColor:
                        selectedReport?.id === report.id
                          ? "#3a3a6d"
                          : report.is_read
                            ? "transparent"
                            : "rgba(255, 121, 198, 0.15)",
                      transition: "background-color 0.3s",
                    }}
                    title="Click to view details"
                  >
                    <td style={{ padding: "12px 16px" }}>{report.id}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {report.name || "Anonymous"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {report.phone || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "'Fira Code', monospace",
                      }}
                    >
                      {report.description || "No description"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      {new Date(report.created_at).toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        color: report.is_read ? "#888" : "#ff79c6",
                        fontWeight: report.is_read ? "normal" : "bold",
                      }}
                    >
                      {report.is_read ? "Read" : "New"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal / Detail panel */}
        {selectedReport && (
          <div
            onClick={() => setSelectedReport(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="modal-content"
              style={{
                backgroundColor: "#222239",
                padding: 24,
                borderRadius: 12,
                maxWidth: 600,
                width: "90vw",
                color: "#fff",
                fontFamily: "'Fira Code', monospace",
                boxShadow: "0 0 30px #ff4081",
                overflowY: "auto",
                maxHeight: "80vh",
              }}
            >
              <h2 style={{ marginBottom: 16, color: "#ff79c6" }}>
                Report Details (ID: {selectedReport.id})
              </h2>
              <p>
                <strong>Name:</strong> {selectedReport.name || "Anonymous"}
              </p>
              <p>
                <strong>Phone:</strong> {selectedReport.phone || "N/A"}
              </p>
              <p>
                <strong>Email:</strong> {selectedReport.email || "N/A"}
              </p>
              <p>
                <strong>Description:</strong>
              </p>
              <pre
                style={{
                  backgroundColor: "#1a1a2e",
                  padding: 12,
                  borderRadius: 8,
                  maxHeight: 200,
                  overflowY: "auto",
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedReport.description || "No description"}
              </pre>
              <p>
                <strong>Date Submitted:</strong>{" "}
                {new Date(selectedReport.created_at).toLocaleString()}
              </p>

              <button
                onClick={() => setSelectedReport(null)}
                style={{
                  marginTop: 24,
                  padding: "10px 20px",
                  backgroundColor: "#ff4081",
                  border: "none",
                  borderRadius: 6,
                  color: "#fff",
                  fontWeight: "bold",
                  cursor: "pointer",
                  userSelect: "none",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff79c6")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ff4081")
                }
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FadeInOut animation styles */}
      <style>
        {`
          @keyframes fadeInOut {
            0%, 100% {opacity: 0;}
            50% {opacity: 1;}
          }

          .table-wrapper {
            overflow-x: auto;
            max-width: 100%;
          }

          @media (max-width: 768px) {
            table {
              font-size: 14px;
            }
            th, td {
              padding: 8px 10px;
            }
            .modal-content {
              width: 95vw !important;
              max-width: none !important;
              max-height: 90vh !important;
            }
          }
        `}
      </style>
    </>
  );
}
