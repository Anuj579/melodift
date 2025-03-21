import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Melodift - Convert Songs to Lofi | Online Lofi Music Converter",
  description:
    "Melodift is your ultimate online tool to convert any song into chill lofi vibes. Instantly transform audio into a relaxing lofi version. Perfect for study, sleep, or chill sessions. Try it free now!",
  keywords: [
    "Melodift",
    "convert song to lofi",
    "lofi song converter",
    "online lofi converter",
    "transform song to lofi",
    "turn music into lofi",
    "chill music generator",
    "lofi remix online",
    "music to lofi",
    "lofi version converter",
  ],
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
