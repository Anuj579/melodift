// This will:
// Take user input (mood)
// Send it to Gemini AI
// Fetch songs from YouTube API
// Return results to frontend

import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { mood } = await req.json();

        if (!mood) {
            return NextResponse.json({ success: false, error: "Mood is required" }, { status: 400 });
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

        // 🔍 Step 1: Get AI-Generated Song Names
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Suggest 10 song ideas for someone feeling ${mood}. Only songs, nothing else. Mix english and hindi songs both.` }] }],
            }),
        });

        const geminiData = await geminiResponse.json();
        // console.log("✅ Gemini API Response:", JSON.stringify(geminiData, null, 2));

        // 🔍 Step 2: Check if Gemini API returned valid data
        if (!geminiData?.candidates || geminiData.candidates.length === 0) {
            return NextResponse.json({ error: "Failed to generate playlist from Gemini API" }, { status: 500 });
        }

        // 🔹 Extract song suggestions from Gemini API
        const generatedText = geminiData.candidates[0]?.content?.parts?.[0]?.text || "";
        const suggestedSongs = generatedText.split("\n").filter(Boolean);
        console.log("🎵 Suggested Songs:", suggestedSongs);

        if (suggestedSongs.length === 0) {
            return NextResponse.json({ error: "Gemini API did not return valid song suggestions" }, { status: 500 });
        }

        // 🔍 Step 3: Fetch Real Songs from YouTube
        const youtubeResults = await Promise.all(
            suggestedSongs.map(async (songName) => {
                const YOUTUBE_SEARCH_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(songName)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

                const youtubeResponse = await fetch(YOUTUBE_SEARCH_URL);
                const youtubeData = await youtubeResponse.json();

                const video = youtubeData.items?.[0];
                if (!video) return null;

                return {
                    title: video.snippet.title,
                    videoId: video.id.videoId,
                    thumbnail: video.snippet.thumbnails.default.url,
                };
            })
        );

        const filteredResults = youtubeResults.filter((song) => song !== null);

        return NextResponse.json({ success: true, playlist: filteredResults });
    } catch (error) {
        console.error("❌ Error:", error);
        return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }
}
