import React, { useState, useEffect } from "react";
import VideoUploader from "./VideoUploader";
import VideoList from "./VideoList";
import { supabase } from "../supabaseClient";

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos from Supabase
  async function fetchVideos() {
    setLoading(true);
    const { data, error } = await supabase
      .from("education_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error.message);
      setVideos([]);
    } else {
      setVideos(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 16 }}>
      <VideoUploader onUploadComplete={fetchVideos} />
      <div style={{ marginTop: 40 }}>
        <VideoList videos={videos} loading={loading} />
      </div>
    </div>
  );
}
