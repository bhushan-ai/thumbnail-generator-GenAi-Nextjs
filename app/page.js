"use client";
import { useState, useRef } from "react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, X } from "lucide-react";
import axios from "axios";
import { AuroraText } from "@/components/magicui/aurora-text";

export default function ChatUI() {
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const messagesEndRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt && !file) return;

    setLoading(true);

    // Save user text message
    if (prompt.trim()) {
      setMessages((prev) => [
        ...prev,
        { role: "user", type: "text", content: prompt },
      ]);
    }
    setPrompt("");
    setFile(null);
    // Save user uploaded file/preview
    if (file) {
      if (file.type.startsWith("image/")) {
        setMessages((prev) => [
          ...prev,
          { role: "user", type: "image", content: previewUrl },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "user", type: "file", content: file.name },
        ]);
      }
    }

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      if (file) {
        formData.append("image", file);
      }

      const { data } = await axios.post("/api/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("dAata", data.data);
      if (data?.data) {
        // Image
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            type: "image",
            content: data.data,
          },
        ]);
        console.log("messa", messages);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "text",
          content: "⚠️ Something went wrong, please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    console.log("file", file);

    if (selectedFile.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
      console.log("purl", previewUrl);
    } else {
      setPreviewUrl(selectedFile.name);
    }
  };

  return (
    <div className="bg-neutral-950 ">
      <h1 className="text-3xl font-bold text-white  text-center  tracking-tighter p-2 mb-0 ">
        <AuroraText Colors={["#FF0000", "#0F0F0F", "#FFFFFF"]}>
          Youtube
        </AuroraText>{" "}
        Thumbnail Generator
      </h1>
      <div className="flex items-center justify-center">
        {/* Chat container */}
        <div className="flex flex-col h-[90vh] w-full max-w-3xl bg-neutral-900 rounded-2xl shadow-xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto scrollbar-hidden">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">
                Send me the Image to Generate Thumbnail
              </p>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={`${idx}-${msg.role}`}
                    className={`mb-3 ${
                      msg.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block rounded-2xl shadow-md transition-all duration-300 max-w-[75%] ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-[#0a0a0a] via-[#1a1a1a] to-[#2a2a2a] text-white shadow-[0_0_10px_#111]"
                          : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-gray-100 shadow-[0_0_10px_#555]"
                      }`}
                    >
                      {/* 📝 Text messages */}
                      {msg.type === "text" &&
                        typeof msg.content === "string" && (
                          <p className="p-3">{msg.content}</p>
                        )}

                      {/* 🖼️ Image messages */}
                      {msg.type === "image" &&
                        typeof msg.content === "string" && (
                          <img
                            src={msg.content}
                            alt="uploaded"
                            className="rounded-lg max-h-64 object-contain"
                          />
                        )}
                    </div>
                  </div>
                ))}
              </>
            )}

            {loading && (
              <div className="text-left">
                <div className="inline-block text-white">
                  <p>Generating...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Preview section before sending */}
          {previewUrl && (
            <div className="flex items-center gap-3 p-2 border-t border-gray-700 bg-neutral-800">
              {file?.type?.startsWith("image/") ? (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <></>
              )}
              {file == null ? null : (
                <button
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                  className="p-1 rounded-full cursor-pointer"
                >
                  <X className="text-white" size={18} />
                </button>
              )}
            </div>
          )}

          {/* Input + file upload */}
          <form
            onSubmit={handleGenerate}
            className="flex items-center gap-3 p-3 border-t border-gray-700"
          >
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <Paperclip className="text-gray-300 hover:text-white" size={22} />
            </label>

            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type a message or upload..."
              className="flex-1 text-white"
            />

            <ShimmerButton type="submit" className="shadow-2xl">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
                <Send />
              </span>
            </ShimmerButton>
          </form>
        </div>
      </div>
      <p className="text-gray-500 mb-2  text-center flex items-center justify-center gap-2">
        Made by bhushann.ai
        <a
          href="https://x.com/bhushann_ai"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            className="w-5 h-5 text-white hover:text-gray-400"
            fill="currentColor"
          >
            <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z"></path>
          </svg>
        </a>
      </p>
    </div>
  );
}
