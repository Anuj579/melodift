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
          "equalizer=f=100:t=h:width=200:g=4",          // Boosts bass for a warm, cozy foundation
          "equalizer=f=1200:t=h:width=250:g=-1",        // Scoops mids gently for that lo-fi depth
          "equalizer=f=5500:t=h:width=300:g=2",         // Adds subtle high-end clarity without sharpness
          "stereowiden=2",                              // Widens the soundstage for an immersive experience
          "aecho=0.12:0.3:130:0.04",                    // Applies light reverb to mimic café acoustics
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
