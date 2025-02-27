"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MusicPlayer({ playlist }) {
    const [currentIndex, setCurrentIndex] = useState(null);

    const playSong = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="container">
            <h2 className="text-xl font-bold">Generated Playlist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {playlist.map((song, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-xl cursor-pointer flex gap-4" onClick={() => playSong(index)}>
                        <img src={song.thumbnail} alt={song.title} className="h-20 object-cover aspect-square rounded-md" />
                        <p className="text-white line-clamp-2">{song.title}</p>
                    </div>
                ))}
            </div>

            {currentIndex !== null && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold">Now Playing: {playlist[currentIndex].title}</h3>
                    <iframe
                        width="480"
                        height="270"
                        src={`https://www.youtube.com/embed/${playlist[currentIndex].videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                        title="YouTube player"
                        // allow="autoplay"
                        className="mt-4 rounded-lg"
                    ></iframe>
                    <div className="flex gap-4 mt-2">
                        <Button onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}>⏮ Prev</Button>
                        <Button onClick={() => setCurrentIndex((prev) => (prev + 1) % playlist.length)}>⏭ Next</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
