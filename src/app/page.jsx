"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Music, Headphones, Download, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import Footer from "@/components/Footer"
import Header from "@/components/Header"
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const audioRef = useRef(null)
    const animationRef = useRef(null)

    // Simulate progress during conversion
    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(interval)
                        return 95
                    }
                    return prev + 5
                })
            }, 500)

            return () => clearInterval(interval)
        } else if (downloadUrl) {
            setProgress(100)
        }
    }, [loading, downloadUrl])

    // Audio player controls
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateDuration = () => {
            if (!isNaN(audio.duration)) {
                console.log("Setting duration:", audio.duration);
                setDuration(audio.duration); // Force state update
            }
        };

        audio.addEventListener("loadedmetadata", updateDuration);

        return () => {
            audio.removeEventListener("loadedmetadata", updateDuration);
        };
    }, [audioRef?.current]);

    const handlePlayPause = () => {
        if (isPlaying) {
            audioRef.current.pause()
            cancelAnimationFrame(animationRef.current)
        } else {
            audioRef.current.play()
            animationRef.current = requestAnimationFrame(updateProgress)
        }
        setIsPlaying(!isPlaying)
    }

    const updateProgress = () => {
        setCurrentTime(audioRef?.current?.currentTime)
        animationRef.current = requestAnimationFrame(updateProgress)
    }

    const handleTimeChange = (value) => {
        const newTime = value[0]
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00"
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
            .toString()
            .padStart(2, "0")
        return `${minutes}:${seconds}`
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            setFile(selectedFile)
            setDownloadUrl(null)
            setProgress(0)
        }
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
            setDownloadUrl(null)
            setProgress(0)
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setCurrentTime(0)
        setIsPlaying(false)
        setLoading(true)
        setProgress(0)
        setDownloadUrl(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const response = await fetch("/api/convert", {
                method: "POST",
                body: formData,
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = URL.createObjectURL(blob)
                setDownloadUrl(url)
                toast.success("Song converted successfully!")
            } else {
                toast.error("Failed to process file. Please try again!")
                setProgress(0)

            }

        } catch (error) {
            console.error("Error converting file:", error)
            toast.error("Error converting file. Please try again!")
            setProgress(0)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 text-white p-5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full mx-auto "
            >
                <Header />

                <div className="flex items-center min-h-[calc(100vh-25rem)] md:min-h-[calc(100vh-22rem)]">
                    <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-zinc-700/50 max-w-md mx-auto w-full">
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 mb-6 transition-all ${dragActive ? "border-purple-500 bg-purple-500/10" : "border-zinc-600 hover:border-zinc-500"
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="flex flex-col items-center justify-center text-center">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-zinc-700/50 p-4 rounded-full mb-4"
                                >
                                    <Upload className="h-8 w-8 text-purple-400" />
                                </motion.div>
                                <p className="text-zinc-300 mb-1 w-full break-words lincl">{file ? file.name : "Drop your audio file here"}</p>
                                <p className="text-zinc-500 text-sm">
                                    {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "or click to browse"}
                                </p>
                            </div>
                        </div>

                        {file && (
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Music className="h-4 w-4 text-purple-400" />
                                    <span className="text-sm text-zinc-400 w-full truncate">{file.name}</span>
                                    <X className="h-6 w-6 text-red-500 cursor-pointer" onClick={() => {
                                        if (!loading) {
                                            setFile(null)
                                        }
                                    }} />
                                </div>

                                <AnimatePresence>
                                    {progress > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-4"
                                        >
                                            <Progress value={progress} className="h-2 mb-1" />
                                            <div className="flex justify-between text-xs text-zinc-500">
                                                <span>Processing</span>
                                                <span>{progress}%</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div whileHover={!loading && { scale: 1.02 }} whileTap={!loading && { scale: 0.98 }}>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Converting to Lofi...
                                            </>
                                        ) : (
                                            <>
                                                <Headphones className="mr-2 h-4 w-4" />
                                                Transform to Lofi
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        )}

                        <AnimatePresence>
                            {downloadUrl && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-zinc-700/30 rounded-lg p-4 border border-zinc-600/50"
                                >
                                    <div className="mb-4">
                                        <h3 className="text-sm font-medium text-zinc-300 mb-2 flex items-center">
                                            <Headphones className="h-4 w-4 mr-2 text-purple-400" />
                                            Your Lofi Track
                                        </h3>

                                        <audio ref={audioRef} src={downloadUrl} className="hidden" />

                                        <div className="flex items-center gap-2 mb-2">
                                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-full bg-transparent hover:bg-transparent" onClick={handlePlayPause}>
                                                {isPlaying ? (
                                                    <span className="h-3 w-3 bg-white rounded-sm" />
                                                ) : (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="h-0 w-0 border-t-transparent border-t-[6px] border-b-transparent border-b-[6px] border-l-white border-l-[10px] ml-0.5"
                                                    />
                                                )}
                                            </Button>

                                            <div className="flex-1">
                                                <Slider
                                                    defaultValue={[0]}
                                                    max={duration || 100}
                                                    step={0.1}
                                                    value={[currentTime]}
                                                    onValueChange={handleTimeChange}
                                                    className="cursor-pointer"
                                                />
                                            </div>

                                            <div className="text-xs text-zinc-400 min-w-[40px] text-right">
                                                {formatTime(currentTime)} / {formatTime(duration)}
                                            </div>
                                        </div>
                                    </div>

                                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                        <a
                                            href={downloadUrl}
                                            download="lofi_track.mp3"
                                            className="flex items-center justify-center w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-md transition-colors"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download Lofi Version
                                        </a>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
            <Footer />
            <Toaster />
        </div>
    )
}

