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

import { classifyDepartment } from "./utils/classifyDepartment";

import { Toaster, toast } from "react-hot-toast";
import { ThemeContext } from "./themeContext.jsx";

import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const { theme } = useContext(ThemeContext);

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

  // Handle auth session on mount and on auth state change
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

  // Fetch reports with seamless reload (loading spinner only on initial load)
  const fetchReports = useCallback(async () => {
    if (!loadingReports && reportsMap.size > 0) {
      // silent fetch on subsequent calls, no loading spinner
    } else {
      setLoadingReports(true);
    }

    try {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Auto-assign unassigned reports
      for (const report of data) {
        if (!report.assigned_department) {
          const department = classifyDepartment(report.description || "");
          if (department) {
            const { error: updateError } = await supabase
              .from("issues")
              .update({ assigned_department: department, status: "Assigned" })
              .eq("id", report.id);

            if (updateError) {
              toast.error(
                `Error assigning department to report ID ${report.id}: ${updateError.message}`
              );
            } else {
              report.assigned_department = department;
              report.status = "Assigned";
            }
          }
        }
      }

      const newMap = new Map();
      let unreadCount = 0;
      data.forEach((report) => {
        // Preserve selectedReport object ref to prevent flicker
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
    if (
      !window.confirm(
        `Delete report ID ${report.id}? This action cannot be undone.`
      )
    )
      return;

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

  // Fetch reports on session and every 15 seconds
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

  // Prepare filtered & searched reports
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
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme === "dark" ? "#121212" : "#f9fbfd",
          padding: 20,
          boxSizing: "border-box",
          position: "relative",
          zIndex: 1,
          transition: "background-color 0.3s ease",
        }}
      >
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            color: theme === "dark" ? "#eee" : "#222",
            minHeight: "80vh",
            maxWidth: 1200,
            width: "100%",
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
            borderRadius: 8,
            boxShadow:
              theme === "dark"
                ? "0 2px 6px rgba(0,0,0,0.7), 0 10px 15px rgba(0,0,0,0.8)"
                : "0 2px 4px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflow: "hidden",
            padding: 24,
            transition: "background-color 0.3s ease, color 0.3s ease",
          }}
        >
          <Header newCount={newCount} onLogout={handleLogout} />

          <ReportFilters
            departments={departments}
            filterDepartment={filterDepartment}
            setFilterDepartment={setFilterDepartment}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onClearFilters={onClearFilters}
          />

          <div
            style={{
              flexGrow: 1,
              display: "flex",
              gap: 24,
              overflow: "hidden",
            }}
          >
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
                    border: `1px solid ${theme === "dark" ? "#444" : "#ddd"}`,
                    borderRadius: 8,
                    padding: 16,
                    overflowY: "auto",
                    backgroundColor: theme === "dark" ? "#282828" : "#fff",
                    display: "flex",
                    flexDirection: "column",
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
                    userSelect: "none",
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
      </div>
    </>
  );
}
