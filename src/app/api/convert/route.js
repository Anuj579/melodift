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
          "atempo=0.9",                         // Slightly slower for a relaxed vibe
          "equalizer=f=100:t=h:width=200:g=6",  // Richer, warmer bass
          "equalizer=f=1000:t=h:width=250:g=-1", // Subtle mid scoop for vocal clarity
          "equalizer=f=5500:t=h:width=300:g=4", // Brighter, smoother highs
          "stereowiden=2.5",                    // A touch more immersion
          "aecho=0.2:0.4:200:0.06",            // Lush yet controlled reverb
          "loudnorm=i=-16:tp=-1.5:lra=10",     // Punchier, refined loudness
          "highpass=f=35",                      // Slightly fuller low-end
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
