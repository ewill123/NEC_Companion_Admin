import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabaseClient"; // Make sure you have this configured
import Login from "./Login"; // Your Login component for auth

// Background code snippets for decorative background animation
const codeSnippets = [
  "const fetchData = async () => {",
  "const response = await fetch(url);",
  "const data = await response.json();",
  "return data;",
  "}",
  "function sum(a, b) { return a + b; }",
  "for(let i=0; i<10; i++) { console.log(i); }",
  "// TODO: optimize this function",
  "let user = { name: 'admin', role: 'superuser' };",
  "if(isAuthenticated) { navigate('/dashboard'); }",
];

// Randomly pick a snippet for background
function getRandomSnippet() {
  const index = Math.floor(Math.random() * codeSnippets.length);
  return codeSnippets[index];
}

/**
 * Smart Department Classifier:
 * - Takes a description string
 * - Checks against many keywords per department
 * - Returns the department with the most matches or null
 */
function classifyDepartment(description) {
  const desc = description.toLowerCase();

  const rules = [
    {
      department: "Logistics",
      keywords: [
        "logistics", "delivery", "truck", "vehicle", "shipment", "transport",
        "driver", "cargo", "dispatch", "fleet", "warehouse", "load", "unload",
        "courier", "package", "freight", "route", "shipping", "tracking", "pallet",
        "van", "carrier", "consignment", "logistic", "transit", "distribution",
        "deliveryman", "transportation", "dock", "inventory", "parcel", "express",
        "pickup", "dropoff", "load management", "cargo handling", "freight forwarding",
        "shipping agent", "logistics coordinator"
      ],
    },
    {
      department: "Maintenance",
      keywords: [
        "light", "power", "electric", "generator", "repair", "fix", "broken",
        "plumbing", "air conditioning", "ac", "maintenance", "equipment", "machine",
        "wiring", "bulb", "switch", "pipe", "valve", "heater", "cooler", "fan",
        "electrical", "tools", "technician", "inspection", "service", "fault",
        "breakdown", "engine", "motor", "pump", "filter", "lubrication",
        "overhaul", "replace", "adjust", "fixing", "repairing", "faulty",
        "diagnostic", "equipment check", "maintenance request", "mechanical",
        "gear", "machine service", "system repair"
      ],
    },
    {
      department: "Security",
      keywords: [
        "security", "theft", "safety", "intrusion", "alarm", "guard", "surveillance",
        "camera", "lock", "break-in", "incident", "patrol", "security guard",
        "security system", "monitoring", "access control", "security breach",
        "fire alarm", "emergency", "security policy", "intruder", "unauthorized",
        "lockdown", "security alert", "surveillance footage", "security check",
        "security incident", "checkpoint", "security protocol", "security operations",
        "security officer", "access denied", "physical security", "alarm system",
        "video surveillance", "security audit", "security guard patrol",
        "security checkpoint", "security response", "security risk",
        "security personnel training", "security camera installation"
      ],
    },
    {
      department: "IT Support",
      keywords: [
        "computer", "system", "internet", "server", "network", "software", "hardware",
        "login", "password", "bug", "error", "crash", "email", "it", "support",
        "printer", "wifi", "connection", "update", "install", "configuration",
        "technical", "helpdesk", "ticket", "remote", "access", "database", "backup",
        "restore", "security patch", "firewall", "virus", "malware", "scan",
        "antivirus", "hardware failure", "software issue", "network downtime",
        "slow internet", "system outage", "email problem", "login issue",
        "password reset", "IT department", "troubleshoot", "IT technician",
        "technical support", "IT help"
      ],
    },
    {
      department: "Human Resources",
      keywords: [
        "salary", "staff", "employee", "hr", "payroll", "hiring", "recruit",
        "vacancy", "benefits", "leave", "absence", "training", "performance",
        "evaluation", "appraisal", "contract", "promotion", "discipline", "policy",
        "resignation", "termination", "recruitment", "onboarding", "offboarding",
        "attendance", "timesheet", "overtime", "bonus", "workforce", "employee relations",
        "workplace", "job description", "vacation", "sick leave", "maternity leave",
        "employee welfare", "career development", "HR manager", "staff meeting",
        "HR policy", "compensation", "employee engagement", "job posting", "HR training",
        "benefits enrollment", "HR software", "performance review"
      ],
    },
  ];

  let bestMatch = null;
  let highestScore = 0;

  // Check how many keywords appear in the description per department
  for (const rule of rules) {
    let score = 0;
    for (const keyword of rule.keywords) {
      if (desc.includes(keyword)) {
        score++;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = rule.department;
    }
  }

  return highestScore > 0 ? bestMatch : null;
}

export default function App() {
  // React states for session, reports, UI and form states
  const [session, setSession] = useState(null);
  const [reportsMap, setReportsMap] = useState(new Map());
  const [loadingReports, setLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const lastReportIds = useRef(new Set());

  const departments = [
    "Logistics",
    "Maintenance",
    "Security",
    "IT Support",
    "Human Resources",
  ];

  // On mount: get session and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch reports and auto-assign departments on unassigned reports
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

    // Auto-assign unassigned reports based on description keyword classification
    for (const report of data) {
      if (!report.assigned_department) {
        const department = classifyDepartment(report.description || "");
        if (department) {
          await supabase
            .from("issues")
            .update({
              assigned_department: department,
              status: "Assigned",
            })
            .eq("id", report.id);

          // Update local copy
          report.assigned_department = department;
          report.status = "Assigned";
        }
      }
    }

    // Update reports map and count unread reports
    setReportsMap(() => {
      const newMap = new Map();
      let unreadCount = 0;

      data.forEach((report) => {
        newMap.set(report.id, report);
        if (!report.is_read) unreadCount++;
      });

      setNewCount(unreadCount);
      return newMap;
    });

    lastReportIds.current = new Set(data.map((r) => r.id));
  }

  // Mark a report as read in DB and update state
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

  // Assign a selected report to a department manually
  async function assignReportToDepartment(reportId, department) {
    if (!department) {
      alert("Please select a department");
      return;
    }

    setAssigning(true);

    const { error } = await supabase
      .from("issues")
      .update({
        assigned_department: department,
        status: "Assigned",
      })
      .eq("id", reportId);

    setAssigning(false);

    if (error) {
      alert("Error assigning report: " + error.message);
      return;
    }

    // Update local state after assigning
    setReportsMap((prevMap) => {
      const newMap = new Map(prevMap);
      const report = newMap.get(reportId);
      if (report) {
        newMap.set(reportId, {
          ...report,
          assigned_department: department,
          status: "Assigned",
        });
      }
      return newMap;
    });

    alert("Report assigned to " + department);
    setSelectedReport(null);
    setSelectedDepartment("");
  }

  // When session changes or on mount, fetch reports every 15s
  useEffect(() => {
    if (session) {
      fetchReports();
      const interval = setInterval(fetchReports, 15000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Logout handler
  async function handleLogout() {
    await supabase.auth.signOut();
    setSelectedReport(null);
  }

  // Filter reports based on department and search term
  let reportsArray = Array.from(reportsMap.values());
  if (filterDepartment) {
    reportsArray = reportsArray.filter(
      (r) => r.assigned_department === filterDepartment
    );
  }
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    reportsArray = reportsArray.filter(
      (r) =>
        (r.name && r.name.toLowerCase().includes(lowerSearch)) ||
        (r.email && r.email.toLowerCase().includes(lowerSearch)) ||
        (r.phone && r.phone.toLowerCase().includes(lowerSearch)) ||
        (r.description && r.description.toLowerCase().includes(lowerSearch))
    );
  }
  // Sort newest first
  reportsArray = reportsArray.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // If no session, show login page
  if (!session)
    return (
      <Login
        onLogin={() =>
          supabase.auth.getSession().then(({ data }) => setSession(data.session))
        }
      />
    );

  return (
    <>
      {/* Background code snippets animation */}
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
          opacity: 0.06,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          padding: 20,
          whiteSpace: "pre-wrap",
          userSelect: "none",
        }}
      >
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <div key={i} style={{ animation: "fadeInOut 15s linear infinite" }}>
              {getRandomSnippet()}
            </div>
          ))}
      </div>

      {/* Main App container */}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fbfd",
          padding: 20,
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            color: "#222",
            minHeight: "80vh",
            maxWidth: 1200,
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 8,
            boxShadow:
              "0 2px 4px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "hidden",
            padding: 24,
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 16,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                color: "#4bb2d6",
                fontWeight: "700",
                userSelect: "none",
              }}
            >
              NEC Admin Dashboard
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
                  fill="#4bb2d6"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="#4bb2d6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V5a2 2 0 10-4 0v.3C7.7 6.2 6 8.4 6 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {newCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "#4bb2d6",
                      color: "#fff",
                      borderRadius: "50%",
                      padding: "2px 7px",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {newCount}
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#4bb2d6",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: 8,
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a95c4")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4bb2d6")}
                title="Logout"
              >
                Logout
              </button>
            </div>
          </header>

          {/* Filters */}
          <section
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 16,
              alignItems: "center",
            }}
          >
            <label style={{ fontWeight: "600", minWidth: 110 }}>Filter by Department:</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
                minWidth: 180,
              }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label style={{ fontWeight: "600", minWidth: 70 }}>Search:</label>
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 16,
                flexGrow: 1,
                minWidth: 200,
              }}
            />
            <button
              onClick={() => {
                setFilterDepartment("");
                setSearchTerm("");
              }}
              style={{
                padding: "10px 16px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#f5a700",
                color: "#222",
                fontWeight: "700",
                cursor: "pointer",
                userSelect: "none",
              }}
              title="Clear filters"
            >
              Clear
            </button>
          </section>

          {/* Main content area - table and report details */}
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              gap: 24,
              overflow: "hidden",
            }}
          >
            {/* Reports Table */}
            <div
              style={{
                flexBasis: "60%",
                overflowY: "auto",
                border: "1px solid #ddd",
                borderRadius: 8,
              }}
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
                    <th style={{ padding: "12px 8px", textAlign: "left" }}>Department</th>
                    <th style={{ padding: "12px 8px", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "12px 8px", textAlign: "left" }}>Created At</th>
                    <th style={{ padding: "12px 8px", textAlign: "center" }}>Unread</th>
                    <th style={{ padding: "12px 8px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingReports ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                        Loading reports...
                      </td>
                    </tr>
                  ) : reportsArray.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                        No reports found.
                      </td>
                    </tr>
                  ) : (
                    reportsArray.map((report) => (
                      <tr
                        key={report.id}
                        style={{
                          backgroundColor:
                            selectedReport?.id === report.id ? "#d0f0fd" : "transparent",
                          cursor: "pointer",
                          borderBottom: "1px solid #eee",
                        }}
                        onClick={() => {
                          setSelectedReport(report);
                          if (!report.is_read) markAsRead(report.id);
                        }}
                      >
                        <td style={{ padding: "10px 8px" }}>{report.id}</td>
                        <td style={{ padding: "10px 8px" }}>{report.name || "-"}</td>
                        <td style={{ padding: "10px 8px" }}>
                          {report.assigned_department || (
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
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `Delete report ID ${report.id}? This cannot be undone.`
                                )
                              ) {
                                const { error } = await supabase
                                  .from("issues")
                                  .delete()
                                  .eq("id", report.id);
                                if (error) alert("Delete failed: " + error.message);
                                else {
                                  // Remove from local map
                                  setReportsMap((prevMap) => {
                                    const newMap = new Map(prevMap);
                                    newMap.delete(report.id);
                                    if (selectedReport?.id === report.id) setSelectedReport(null);
                                    return newMap;
                                  });
                                }
                              }
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

            {/* Selected Report Details and Assign */}
            <div
              style={{
                flexBasis: "40%",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                overflowY: "auto",
                backgroundColor: "#fafafa",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {!selectedReport ? (
                <p
                  style={{
                    marginTop: 50,
                    fontSize: 16,
                    color: "#777",
                    userSelect: "none",
                    textAlign: "center",
                    flexGrow: 1,
                  }}
                >
                  Select a report to view details
                </p>
              ) : (
                <>
                  <h2 style={{ marginTop: 0, color: "#4bb2d6" }}>
                    Report ID: {selectedReport.id}
                  </h2>
                  <p>
                    <strong>Name:</strong> {selectedReport.name || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedReport.email || "N/A"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedReport.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Description:</strong>
                  </p>
                  <p
                    style={{
                      whiteSpace: "pre-wrap",
                      backgroundColor: "#fff",
                      padding: 10,
                      borderRadius: 6,
                      border: "1px solid #ddd",
                      fontFamily: "'Courier New', monospace",
                      flexGrow: 1,
                      overflowY: "auto",
                      marginBottom: 16,
                    }}
                  >
                    {selectedReport.description || "No description"}
                  </p>

                  <p>
                    <strong>Assigned Department:</strong>{" "}
                    {selectedReport.assigned_department || (
                      <em style={{ color: "#999" }}>Unassigned</em>
                    )}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedReport.status || "New"}
                  </p>
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>

                  {/* Assign Department dropdown */}
                  <div style={{ marginTop: 20 }}>
                    <label
                      htmlFor="assign-dept"
                      style={{ fontWeight: "700", display: "block", marginBottom: 8 }}
                    >
                      Assign to Department:
                    </label>
                    <select
                      id="assign-dept"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      disabled={assigning}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        width: "100%",
                        fontSize: 16,
                        cursor: assigning ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="">Select department</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() =>
                        assignReportToDepartment(selectedReport.id, selectedDepartment)
                      }
                      disabled={assigning || !selectedDepartment}
                      style={{
                        marginTop: 12,
                        width: "100%",
                        backgroundColor: assigning ? "#999" : "#4bb2d6",
                        color: "white",
                        border: "none",
                        padding: 12,
                        borderRadius: 8,
                        fontWeight: "700",
                        cursor:
                          assigning || !selectedDepartment ? "not-allowed" : "pointer",
                      }}
                      title={
                        assigning
                          ? "Assigning..."
                          : !selectedDepartment
                          ? "Select a department first"
                          : "Assign department"
                      }
                    >
                      {assigning ? "Assigning..." : "Assign Department"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation keyframes */}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.05; }
          700% { opacity: 0.15; }
        }
      `}</style>
    </>
  );
}
