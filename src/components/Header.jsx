import { motion } from "framer-motion"
import { Star } from "lucide-react"

function Header() {
    return (
        <header className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 200,
                    }}
                >
                    <h1 className="text-5xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 cursor-default">
                        Melodift
                    </h1>
                </motion.div>
                <p className="text-zinc-400">Transform your music into chill lofi vibes</p>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center">
                <a
                    href="https://github.com/anuj579/melodift"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white py-2 px-4 rounded-md border border-zinc-700 transition-colors"
                >
                    <Star className="h-4 w-4" />
                    <span>Star this Project</span>
                </a>
            </motion.div>
        </header>
    )
}

export default Header