import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import ReportFilters from "./components/ReportFilters";
import ReportTable from "./components/ReportTable";
import ReportDetails from "./components/ReportDetails";
import BackgroundAnimation from "./components/BackgroundAnimation";
import ElectionDateManager from "./components/ElectionDateManager";
import NewsManager from "./components/NewsManager";
import AppConfigManager from "./components/AppConfigManager";
import Header from "./components/Header";
import { classifyDepartment } from "./utils/classifyDepartment";
import { Toaster, toast } from "react-hot-toast";
import { ThemeContext } from "./themeContext.jsx";
import { motion, AnimatePresence } from "framer-motion";
import VideoList from "./components/VideoList";
import VideoUploader from "./components/VideoUploader";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "./firebaseConfig";

import { FaChartBar, FaCalendarAlt, FaNewspaper, FaCogs } from "react-icons/fa";

export default function App() {
  const { theme } = useContext(ThemeContext);

  // Reports state
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

  // Videos state
  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);

  const departments = [
    "Logistics",
    "Maintenance",
    "Security",
    "IT Support",
    "Human Resources",
  ];

  // Auth session setup
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

  // Fetch reports
  const fetchReports = useCallback(async () => {
    setLoadingReports(true);
    try {
      const { data, error } = await supabase
        .from("issues")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const newMap = new Map();
      let unreadCount = 0;

      for (const report of data) {
        if (!report.assigned_department) {
          const department = classifyDepartment(report.description || "");
          if (department) {
            const { error: updateError } = await supabase
              .from("issues")
              .update({ assigned_department: department, status: "Assigned" })
              .eq("id", report.id);

            if (!updateError) {
              console.log(
                `🧠 Auto-assigned report ${report.id} to ${department}`
              );
              report.assigned_department = department;
              report.status = "Assigned";
            }
          }
        }

        if (!report.is_read) unreadCount++;
        newMap.set(report.id, report);
      }

      setReportsMap(newMap);
      setNewCount(unreadCount);
      lastReportIds.current = new Set(data.map((r) => r.id));
    } catch (error) {
      toast.error("Error fetching reports: " + error.message);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    setVideosLoading(true);
    try {
      const { data, error } = await supabase
        .from("education_videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      toast.error("Error fetching videos: " + error.message);
    } finally {
      setVideosLoading(false);
    }
  }, []);

  // Poll only reports — not videos
  useEffect(() => {
    if (!session) return;

    fetchReports();

    // Only fetch videos ONCE when the tab changes to "videos"
    if (activeTab === "videos") {
      fetchVideos();
    }

    const interval = setInterval(() => {
      fetchReports(); // Only reports are polled
    }, 15000);

    return () => clearInterval(interval);
  }, [session, activeTab, fetchReports, fetchVideos]);

  // Mark report as read
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

  // Assign report to department
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

  // Delete report
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

  // Delete video handler lifted here
  async function deleteVideo(video) {
    if (!window.confirm(`Delete video "${video.title}"?`)) return;

    try {
      if (!video.firebase_path) {
        toast.error("Missing firebase_path. Cannot delete from Firebase.");
        return;
      }
      // Delete from Firebase Storage
      const storageRef = ref(storage, video.firebase_path);
      await deleteObject(storageRef);

      // Delete from Supabase
      const { error } = await supabase
        .from("education_videos")
        .delete()
        .eq("id", video.id);
      if (error) throw error;

      setVideos((prev) => prev.filter((v) => v.id !== video.id));
      toast.success("Video deleted");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    }
  }

  // Clear filters
  function onClearFilters() {
    setFilterDepartment("");
    setSearchTerm("");
  }

  // Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    setSelectedReport(null);
    setSession(null);
  }

  // Filter and sort reports for display
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

  // If no session, show login
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

  // Main app UI
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
              <FaChartBar style={{ marginRight: 6 }} /> Dashboard
            </button>
            <button onClick={() => setActiveTab("election")}>
              <FaCalendarAlt style={{ marginRight: 6 }} /> Election Date
            </button>
            <button onClick={() => setActiveTab("news")}>
              <FaNewspaper style={{ marginRight: 6 }} /> News
            </button>
            <button onClick={() => setActiveTab("config")}>
              <FaCogs style={{ marginRight: 6 }} /> App Config
            </button>
            <button onClick={() => setActiveTab("videos")}>🎥 Videos</button>
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
          {activeTab === "config" && <AppConfigManager />}
          {activeTab === "videos" && (
            <div
              style={{
                width: "100%",
                maxWidth: 1000,
                display: "flex",
                flexDirection: "column",
                gap: 32,
              }}
            >
              <VideoUploader
                onUploadComplete={() => {
                  fetchVideos();
                }}
              />
              <VideoList
                videos={videos}
                loading={videosLoading}
                onDeleteVideo={deleteVideo}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
