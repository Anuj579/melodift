"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import MusicPlayer from "@/components/MusicPlayer";

export default function Home() {
    const [mood, setMood] = useState("");
    const [language, setLanguage] = useState("Hindi & English");
    const [playlist, setPlaylist] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchSongs = async () => {
        setLoading(true);
        setPlaylist([]);

        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mood, language }),
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            setPlaylist(data.playlist);
        } else {
            alert(data.error);
        }
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h1 className="text-2xl font-bold mb-4">🎵 Mood-Based Music Generator</h1>
            <div className="flex gap-4">
                <Input placeholder="Enter your mood..." value={mood} onChange={(e) => setMood(e.target.value)} />
                <Select onValueChange={setLanguage} defaultValue={language}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi & English">Both</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={fetchSongs} disabled={loading}>
                    {loading ? "Generating..." : "Generate"}
                </Button>
            </div>

            {playlist.length > 0 && (
                <div className="mt-6">
                    <MusicPlayer playlist={playlist} />
                </div>
            )}
        </div>
    );
}
