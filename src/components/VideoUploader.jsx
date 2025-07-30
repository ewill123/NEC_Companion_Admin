import React, { useState, useContext } from "react";

import { storage } from "../firebaseConfig";
import { supabase } from "../supabaseClient";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { toast } from "react-hot-toast";
import { ThemeContext } from "../themeContext.jsx";

export default function VideoUploader({ onUploadComplete }) {
  const { theme } = useContext(ThemeContext);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  async function uploadVideo() {
    if (!file) {
      toast.error("Please select a video file");
      return;
    }
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setUploading(true);
    setProgress(0);
    const toastId = toast.loading("Uploading video...");

    try {
      const uniqueFilename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `education_videos/${uniqueFilename}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const percent = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(percent);
          },
          (error) => reject(error),
          () => resolve()
        );
      });

      const downloadURL = await getDownloadURL(storageRef);

      const { data: existingVideos, error: fetchError } = await supabase
        .from("education_videos")
        .select("id")
        .eq("url", downloadURL)
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingVideos && existingVideos.length > 0) {
        toast.dismiss(toastId);
        toast.error("This video was already uploaded.");
        setUploading(false);
        return;
      }

      const { error } = await supabase.from("education_videos").insert([
        {
          title: title.trim(),
          url: downloadURL,
          firebase_path: storageRef.fullPath,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.dismiss(toastId);
      toast.success("Video uploaded successfully!");
      setTitle("");
      setFile(null);
      setProgress(0);
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: theme === "dark" ? "#222" : "#fafafa",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        maxWidth: 600,
        transition: "all 0.3s ease",
      }}
    >
      <h2 style={{ marginBottom: 12 }}>📤 Upload New Educational Video</h2>
      <input
        type="text"
        placeholder="Video Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: 8,
          marginBottom: 12,
          borderRadius: 4,
          border: `1px solid ${theme === "dark" ? "#555" : "#ccc"}`,
          backgroundColor: theme === "dark" ? "#333" : "#fff",
          color: theme === "dark" ? "#eee" : "#222",
        }}
        disabled={uploading}
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={uploading}
        style={{ marginBottom: 12 }}
      />

      {uploading && (
        <div
          style={{
            height: 8,
            width: "100%",
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: theme === "dark" ? "#444" : "#ddd",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: `linear-gradient(90deg, #4bb2d6, #00c9a7)`,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}

      <button
        onClick={uploadVideo}
        disabled={uploading}
        style={{
          padding: "10px 20px",
          borderRadius: 4,
          border: "none",
          backgroundColor: uploading ? "#888" : "#007bff",
          color: "#fff",
          cursor: uploading ? "not-allowed" : "pointer",
          fontWeight: "bold",
        }}
      >
        {uploading ? `Uploading... (${progress}%)` : "Upload Video"}
      </button>
    </div>
  );
}
