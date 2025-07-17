import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";

import Header from "./components/Header";
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";
import ReportDetails from "./components/ReportDetails";
import BackgroundAnimation from "./components/BackgroundAnimation";
import ElectionDateManager from "./components/ElectionDateManager";
import NewsManager from "./components/NewsManager";
import AppConfigManager from "./components/AppConfigManager"; // ✅ NEW

import { classifyDepartment } from "./utils/classifyDepartment";

import { Toaster, toast } from "react-hot-toast";
import { ThemeContext } from "./themeContext.jsx";

import { motion, AnimatePresence } from "framer-motion";

// 🚀 Your full component below is unchanged EXCEPT new tab for config

export default function App() {
  const { theme } = useContext(ThemeContext);

  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
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

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (isMounted) setSession(session);
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const fetchReports = useCallback(async () => {
    if (!loadingReports && reportsMap.size > 0) return;
    setLoadingReports(true);

    try {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      for (const report of data) {
        if (!report.assigned_department) {
          const department = classifyDepartment(report.description || "");
          if (department) {
            const { error: updateError } = await supabase
              .from("issues")
              .update({ assigned_department: department, status: "Assigned" })
              .eq("id", report.id);

            if (!updateError) {
              report.assigned_department = department;
              report.status = "Assigned";
            }
          }
        }
      }

      const newMap = new Map();
      let unreadCount = 0;
      data.forEach((report) => {
        if (selectedReport?.id === report.id) {
          newMap.set(report.id, selectedReport);
        } else {
          newMap.set(report.id, report);
        }
        if (!report.is_read) unreadCount++;
      });

      setReportsMap(newMap);
      setNewCount(unreadCount);
      lastReportIds.current = new Set(data.map((r) => r.id));
    } catch (error) {
      toast.error("Error fetching reports: " + error.message);
    } finally {
      setLoadingReports(false);
    }
  }, [loadingReports, reportsMap, selectedReport]);

  async function markAsRead(id) {
    try {
      const { error } = await supabase
        .from("issues")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;

      setReportsMap((prevMap) => {
        const newMap = new Map(prevMap);
        const report = newMap.get(id);
        if (report) newMap.set(id, { ...report, is_read: true });
        return newMap;
      });

      setNewCount((count) => Math.max(count - 1, 0));
    } catch (error) {
      toast.error("Error marking report as read: " + error.message);
    }
  }

  async function assignReportToDepartment(reportId, department) {
    if (!department) {
      toast.error("Please select a department");
      return;
    }

    setAssigning(true);
    try {
      const { error } = await supabase
        .from("issues")
        .update({ assigned_department: department, status: "Assigned" })
        .eq("id", reportId);

      if (error) throw error;

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

      setSelectedReport(null);
      setSelectedDepartment("");
      toast.success(`Report assigned to ${department}`);
    } catch (error) {
      toast.error("Error assigning report: " + error.message);
    } finally {
      setAssigning(false);
    }
  }

  async function deleteReport(report) {
    if (!window.confirm(`Delete report ID ${report.id}?`)) return;

    try {
      const { error } = await supabase
        .from("issues")
        .delete()
        .eq("id", report.id);
      if (error) throw error;

      setReportsMap((prevMap) => {
        const newMap = new Map(prevMap);
        newMap.delete(report.id);
        if (selectedReport?.id === report.id) setSelectedReport(null);
        return newMap;
      });

      toast.success("Report deleted");
    } catch (error) {
      toast.error("Delete failed: " + error.message);
    }
  }

  useEffect(() => {
    if (!session) return;
    fetchReports();
    const interval = setInterval(fetchReports, 15000);
    return () => clearInterval(interval);
  }, [session, fetchReports]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSelectedReport(null);
    setSession(null);
  }

  function onClearFilters() {
    setFilterDepartment("");
    setSearchTerm("");
  }

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

  reportsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (!session) {
    return (
      <Login
        onLogin={() =>
          supabase.auth
            .getSession()
            .then(({ data }) => setSession(data.session))
        }
      />
    );
  }

  return (
    <>
      <BackgroundAnimation />
      <Toaster position="top-right" />
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme === "dark" ? "#121212" : "#f9fbfd",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 2rem",
            backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
            borderBottom:
              theme === "dark" ? "1px solid #333" : "1px solid #eee",
          }}
        >
          <Header newCount={newCount} onLogout={handleLogout} />
          <nav style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => setActiveTab("dashboard")}>
              📊 Dashboard
            </button>
            <button onClick={() => setActiveTab("election")}>
              🗳️ Election Date
            </button>
            <button onClick={() => setActiveTab("news")}>📰 News</button>
            <button onClick={() => setActiveTab("config")}>
              ⚙️ App Config
            </button>{" "}
            {/* ✅ NEW */}
          </nav>
        </div>

        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 24,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {activeTab === "dashboard" && (
            <div
              style={{
                width: "100%",
                maxWidth: 1200,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {/* Same dashboard logic */}
              <ReportFilters
                departments={departments}
                filterDepartment={filterDepartment}
                setFilterDepartment={setFilterDepartment}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onClearFilters={onClearFilters}
              />
              <div style={{ display: "flex", gap: 24 }}>
                <ReportTable
                  reports={reportsArray}
                  selectedReport={selectedReport}
                  setSelectedReport={(report) => {
                    setSelectedReport(report);
                    if (report && !report.is_read) markAsRead(report.id);
                  }}
                  markAsRead={markAsRead}
                  deleteReport={deleteReport}
                  loading={loadingReports}
                />
                <AnimatePresence mode="wait">
                  {selectedReport ? (
                    <motion.div
                      key={selectedReport.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        flexBasis: "40%",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: 16,
                        backgroundColor:
                          theme === "dark" ? "#282828" : "#ffffff",
                      }}
                    >
                      <ReportDetails
                        report={selectedReport}
                        departments={departments}
                        selectedDepartment={selectedDepartment}
                        setSelectedDepartment={setSelectedDepartment}
                        assignToDepartment={() =>
                          assignReportToDepartment(
                            selectedReport.id,
                            selectedDepartment
                          )
                        }
                        assigning={assigning}
                      />
                    </motion.div>
                  ) : (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        marginTop: 50,
                        fontSize: 16,
                        color: theme === "dark" ? "#888" : "#777",
                        textAlign: "center",
                        flexGrow: 1,
                      }}
                    >
                      Select a report to view details
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {activeTab === "election" && <ElectionDateManager />}
          {activeTab === "news" && <NewsManager />}
          {activeTab === "config" && <AppConfigManager />}{" "}
          {/* ✅ Render new tab */}
        </div>
      </div>
    </>
  );
}
