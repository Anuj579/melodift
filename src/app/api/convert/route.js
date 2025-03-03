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
          "asetrate=44100*0.88", // Slow down
          "aresample=44100", // Resample
          "equalizer=f=150:t=h:width=200:g=4",  // Boost sub-bass for warmth (low-end feel)
          "equalizer=f=1000:t=h:width=200:g=-1",  // Reduce slightly to balance mids
          "stereowiden=2",  // Expands stereo field for a more immersive feel
          "aecho=0.15:0.35:250:0.05",  // Softer reverb with less tail
          "loudnorm=i=-20",  // Lowers perceived loudness a bit
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
