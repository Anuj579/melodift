"use client"

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [mood, setMood] = useState("")
  const [playlist, setPlaylist] = useState([])
  const [loading, setLoading] = useState(false)

  const generatePlaylist = async () => {
    if (!mood) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mood })
      });

      const data = await res.json()
      if (data.playlist) {
        setPlaylist(data.playlist);
      } else {
        console.log("Failed to generate Playlist. Try again.");
      }
    } catch (error) {
      console.log("Error while generating playlist:", error);
    }
    setLoading(false);
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">🎵 Mood-Based Playlist Generator</h1>

      <div className="flex gap-2 w-full max-w-md">
        <Input
          placeholder="Enter your mood (happy, sad, relaxed...)"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />
        <Button onClick={generatePlaylist} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>

      {loading && <p>Loading...</p>}
    
      <div className="mt-5">
        {playlist.length > 0 && playlist.map((song, index) => (
          <div key={index} className="flex items-center gap-4 border-b p-2">
            <img src={song.thumbnail} alt={song.title} className="w-16 h-16 rounded" />
            <div>
              <p className="font-semibold">{song.title}</p>
              <a
                href={`https://www.youtube.com/watch?v=${song.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                Play on YouTube
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
