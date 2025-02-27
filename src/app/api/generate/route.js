import { NextResponse } from "next/server";

export async function POST(req) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    try {
        const { mood, language } = await req.json();

        if (!mood || !language) {
            return NextResponse.json({ success: false, error: "Mood and Language are required" }, { status: 400 });
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Step 1: Get AI-Generated Song Names
        const geminiPrompt = `Suggest 10 popular ${language} songs for someone feeling ${mood}. Return ONLY song names in a numbered list format. Include a mix of trending and classic songs.`;
        const geminiResult = await model.generateContent(geminiPrompt);

        if (!geminiResult?.response?.candidates || geminiResult?.response.candidates.length === 0) {
            return NextResponse.json({ success: false, error: "Gemini API failed to generate songs" }, { status: 500 });
        }

        const generatedText = geminiResult?.response?.text() || "";

        let suggestedSongs = generatedText.split("\n").map((s) => s.replace(/^\d+\.\s*/, "").trim()).filter(Boolean);
        if (suggestedSongs.length === 0) {
            return NextResponse.json({ error: "No valid songs received from Gemini API" }, { status: 500 });
        }
        console.log("Suggested songs:", suggestedSongs);

        // Step 2: Fetch YouTube Videos (Only Music Videos)
        const searchQuery = suggestedSongs.map((song) => `\"${song}\" official song`).join("|");
        const YOUTUBE_SEARCH_URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=10&key=${YOUTUBE_API_KEY}`;

        const youtubeResponse = await fetch(YOUTUBE_SEARCH_URL);
        const youtubeData = await youtubeResponse.json();

        const playlist = youtubeData.items
            .filter((video) => suggestedSongs.some((song) => video.snippet.title.toLowerCase().includes(song.toLowerCase())))
            .map((video) => ({
                title: video.snippet.title,
                videoId: video.id.videoId,
                thumbnail: video.snippet.thumbnails.high.url,
            }));

        return NextResponse.json({ success: true, playlist });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
    }
}