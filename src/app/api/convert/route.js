import { NextResponse } from "next/server";
import { ffmpeg } from "@/utils/ffmpegConfig";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFilePath = path.join("/tmp", file.name);
    const outputFilePath = path.join("/tmp", "converted_" + file.name);

    await writeFile(inputFilePath, buffer);

    await new Promise((resolve, reject) => {
      ffmpeg(inputFilePath)
        .audioFilters([
          "atempo=0.9",                                 // Slows the tempo slightly for a relaxed, chill vibe
          "equalizer=f=100:t=h:width=200:g=3",          // Gentle bass boost for warmth without muddiness
          "equalizer=f=1200:t=h:width=250:g=-1",        // Scoops mids gently for lo-fi depth
          "equalizer=f=5500:t=h:width=300:g=-1",        // Softens highs for a mellow, soothing tone
          "stereowiden=2",                              // Widens the soundstage for an immersive experience
          "aecho=0.1:0.3:100:0.04",                    // Adds very subtle reverb for a café-like touch
          "highpass=f=35",                              // Removes low-end rumble for a clean mix
          "acompressor=threshold=-20dB:ratio=2:attack=20:release=200:knee=6", // Smooths dynamics for polish
          "loudnorm=i=-16:tp=-2:lra=12"                 // Balances loudness for a natural, dynamic flow
        ])
        .save(outputFilePath)
        .on("end", resolve)
        .on("error", reject);
    });

    const convertedFile = await fs.promises.readFile(outputFilePath);
    return new Response(convertedFile, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="lofi_${file.name}"`,
      },
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
