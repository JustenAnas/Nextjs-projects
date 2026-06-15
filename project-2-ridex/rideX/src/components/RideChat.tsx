"use client";

import axios from "axios";
import { Send, SendIcon, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { getSocket } from "@/lib/socket";

type Message = {
  _id: string;
  bookingId: string;
  sender: "user" | "driver";
  text: string;
  createdAt: Date | string;
};

function RideChat({ currentRole, bookingId, userName, driverName }: any) {
  const otherName = currentRole == "user" ? driverName : userName;
  const myName = currentRole == "user" ? userName : driverName;
  const { userData } = useSelector((state: RootState) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastmessages, setLastMessages] = useState("");
  const [suggestion, setSuggestion] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Fixed syntax error and set default state to true for initial mount loading
  const [mLoading, setMLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const socket = getSocket();

  const sendMessage = async () => {
    try {
      const { data } = await axios.post("/api/chat/send", {
        sender: currentRole,
        text,
        bookingId,
      });
      console.log(data);
      socket.emit("chat-message", data);
      setMessages((prev) => [...prev, data]);
      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  const getAllMessage = async () => {
    try {
      setMLoading(true); // Ensure loading is true when fetching starts
      const { data } = await axios.post("/api/chat/get-all", {
        bookingId,
      });
      setMessages(data);
      setLastMessages(data[0]?.text || "");
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setMLoading(false); // Turns off loading state once complete (success or error)
    }
  };

  const formatTime = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    getAllMessage();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    socket.on("chat-message", (data: Message) => {
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === data._id);
        if (alreadyExists) return prev;
        return [...prev, data];
      });
    });
    return () => {
      socket.off("chat-message");
    };
  }, []);

  const getAiSuggestion = async () => {
    setAiLoading(true);
    setShowAI(true);
    try {
      const { data } = await axios.post("/api/chat/ai-suggestion", {
        role: currentRole,
        lastmessages,
      });
      const jsonData = JSON.parse(data);
      setSuggestion(
        Array.isArray(jsonData.suggestions) ? jsonData.suggestions : []
      );
      console.log(data);
      setAiLoading(false);
    } catch (error) {
      console.log(error);
      setAiLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full min-h-0 bg-white rounded-2xl overflow-hidden border border-zinc-100"
      style={{ height: "100%" }}
    >
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-zinc-100">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-700">
            {otherName?.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 leading-none">
            {otherName}
          </p>
          <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">
            Active Now
          </p>
        </div>
      </div>

      {/* Chat Body */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style>{`div::-webkit-scrollbar {display:none}`}</style>

        {/* 1. Initial Message Loading State */}
        {mLoading ? (
          <div className="flex flex-col gap-4 py-4 h-full justify-end">
            <div className="h-10 w-2/3 bg-zinc-200 rounded-2xl rounded-bl-sm animate-pulse self-start" />
            <div className="h-12 w-1/2 bg-zinc-300 rounded-2xl rounded-br-sm animate-pulse self-end" />
            <div className="h-8 w-3/4 bg-zinc-200 rounded-2xl rounded-bl-sm animate-pulse self-start" />
          </div>
        ) : messages.length === 0 ? (
          /* 2. Empty State (Only shows after loading turns false) */
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
              <Send size={18} className="text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400 font-medium">No messages yet</p>
            <p className="text-xs text-zinc-300">
              Start the conversation below
            </p>
          </div>
        ) : (
          /* 3. Messages List */
          messages.map((m, i) => {
            const isMine = m.sender === currentRole;
            return (
              <motion.div
                key={m._id || i}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed rounded-2xl shadow-sm ${
                    isMine
                      ? "bg-zinc-950 text-white rounded-br-sm"
                      : "bg-white border border-zinc-200 text-zinc-900 rounded-bl-sm"
                  }`}
                >
                  <p className="wrap-break-words">{m.text}</p>
                  <span className="text-[8px] text-gray-400 block text-right mt-1">
                    {formatTime(m.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI Suggestion Panel */}
      <AnimatePresence>
        {showAI && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="shrink-0 overflow-hidden border-t border-zinc-100 bg-white"
          >
            <div className="px-4 pt-3 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-violet-500" />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    AI Suggestions
                  </span>
                </div>
                <button onClick={() => setShowAI(false)}>
                  <X size={14} className="text-zinc-400 hover:text-zinc-600" />
                </button>
              </div>
              {aiLoading ? (
                <div className="flex flex-col gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-9 bg-zinc-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {suggestion.map((s, i) => (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setText(s);
                        setShowAI(false);
                      }}
                      className="text-left text-sm text-zinc-700 bg-zinc-50 hover:bg-violet-50 hover:text-violet-700 border border-zinc-100 hover:border-violet-200 px-3 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      {s}
                    </motion.div>
                  ))}
                  <button
                    onClick={getAiSuggestion}
                    className="text-[11px] text-violet-500 hover:text-violet-700 font-semibold text-center mt-1 transition-colors"
                  >
                    Refresh Suggestion
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Action Bar */}
      <div className="shrink-0 px-4 pb-4 pt-2 bg-white">
        <div className="flex items-center gap-2 bg-zinc-100 rounded-2xl pl-3 pr-1.5 py-1.5">
          {messages.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => getAiSuggestion()}
              className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                showAI
                  ? "bg-violet-600 text-white"
                  : "bg-white text-violet-500 hover:bg-violet-50 border border-zinc-200"
              }`}
            >
              <Sparkles size={14} />
            </motion.button>
          )}

          <input
            type="text"
            value={text}
            placeholder="Message..."
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none py-1.5 min-w-0"
          />
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => sendMessage()}
            disabled={!text.trim()}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              text.trim()
                ? "bg-zinc-950 text-white hover:bg-zinc-800"
                : "bg-transparent text-zinc-300 cursor-not-allowed"
            }`}
          >
            <SendIcon size={14} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default RideChat;
