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
          "asetrate=44100*0.85", // Slow down
          "aresample=44100", // Resample
          "equalizer=f=6000:t=h:width=200:g=-3",  // Gently reduces harsh high frequencies (without killing volume)
          "aecho=0.3:0.5:400:0.1",  // Softer echo, less reverb
          "loudnorm",
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
