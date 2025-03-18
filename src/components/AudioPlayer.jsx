"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export function AudioPlayer({ originalSrc, lofiSrc, title, artist, isPlaying, onPlayPause, lofiModeGlobal }) {
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const audioRef = useRef(null)
    const animationRef = useRef(null)

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateDuration = () => {
            if (!isNaN(audio.duration)) {
                setDuration(audio.duration)
            }
        }

        const handleEnded = () => {
            if (onPlayPause) onPlayPause(false)
        }

        audio.addEventListener("loadedmetadata", updateDuration)
        audio.addEventListener("ended", handleEnded)

        return () => {
            audio.removeEventListener("loadedmetadata", updateDuration)
            audio.removeEventListener("ended", handleEnded)
            cancelAnimationFrame(animationRef.current)
        }
    }, [onPlayPause])

    // Handle play/pause
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        if (isPlaying) {
            audio.play()
            animationRef.current = requestAnimationFrame(updateProgress)
        } else {
            audio.pause()
            cancelAnimationFrame(animationRef.current)
        }
    }, [isPlaying])

    const updateProgress = () => {
        setCurrentTime(audioRef.current.currentTime)
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

    return (
        <div
            className={`rounded-lg p-4 ${lofiModeGlobal ? "bg-purple-500/10 border-purple-500/30" : "bg-zinc-700/30 border-zinc-700/50"} border transition-colors duration-300`}
        >
            <audio ref={audioRef} src={lofiModeGlobal ? lofiSrc : originalSrc} preload="metadata" className="hidden" />

            <div className="flex flex-col space-y-3">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-medium text-sm text-zinc-200">{title}</h4>
                        <p className="text-xs text-zinc-400">{artist}</p>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        className={`h-9 w-9 p-0 rounded-full ${lofiModeGlobal ? "bg-purple-500/20 hover:bg-purple-500/30 border-purple-300/30" : "bg-transparent hover:bg-transparent"}`}
                        onClick={() => onPlayPause(!isPlaying)}
                    >
                        {isPlaying ? (
                            <Pause className={`h-4 w-4 text-white fill-white`} />
                        ) : (
                            <Play className={`h-4 w-4 text-white fill-white`} />
                        )}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-10">{formatTime(currentTime)}</span>

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

                    <span className="text-xs text-zinc-400 w-10 text-right">{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    )
}

