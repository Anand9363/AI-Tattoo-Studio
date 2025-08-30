import { useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_MODEL = "google/gemini-2.5-flash-image-preview:free";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

  const generate = async () => {
    if (!prompt.trim()) return;
    setError("");
    setLoading(true);
    setImage(null);

    try {
      const res = await fetch(`${API_BASE}/api/generate-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: DEFAULT_MODEL }),
      });

      const data = await res.json();
      console.log("Backend response:", data);

      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      setImage(data.image);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = "tattoo.png";
    link.click();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Animated Header */}
      <header className="text-center py-8">
        <motion.h1
          className="text-4xl font-extrabold"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Tattoo <span className="text-indigo-400">Studio</span>
        </motion.h1>
      </header>

      {/* Main Card with 3D effect */}
      <motion.div
        className="max-w-4xl mx-auto p-6 bg-white/10 rounded-2xl shadow-2xl"
        whileHover={{ rotateY: 6, rotateX: 6, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        {/* Input + Generate button */}
        <div className="flex space-x-3 mb-4">
          <input
            className="flex-1 p-3 bg-gray-800 border rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe your tattoo..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <motion.button
            onClick={generate}
            disabled={loading}
            className="px-6 py-3 bg-indigo-500 rounded-xl hover:bg-indigo-600 disabled:opacity-50"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            {loading ? "Generating..." : "Generate"}
          </motion.button>
        </div>

        {error && <p className="mb-4 text-red-400">{error}</p>}

        {/* Generated Image */}
        <div className="flex justify-center">
          {image ? (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8, rotateY: 45 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={image}
                alt="AI tattoo"
                className="max-h-[70vh] rounded-xl shadow-lg"
              />
              <motion.button
                onClick={downloadImage}
                className="mt-4 px-6 py-3 bg-green-500 rounded-xl hover:bg-green-600"
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
              >
                Download
              </motion.button>
            </motion.div>
          ) : (
            <p className="text-gray-400 italic">
              Your tattoo will appear here ✨
            </p>
          )}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 mt-8">
        Using <em>{DEFAULT_MODEL}</em> (free model) for image generation.
      </footer>

      {/* Bonus Example component inside App */}
      <div className="max-w-md mx-auto mt-12">
        <Example />
      </div>
    </main>
  );
}

/* ✅ Reusable demo component with framer-motion */
function Example() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 bg-white rounded-2xl shadow-lg text-black"
    >
      <h2 className="text-xl font-bold">Hello, Framer Motion 👋</h2>
      <p className="text-gray-600">This is a smooth animation demo block.</p>
    </motion.div>
  );
}
