import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Send, Sparkles, X } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

export function FloatingChatButton() {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnreadSuggestion, setHasUnreadSuggestion] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-welcome",
      sender: "assistant",
      text: "Hi! I'm your AI skin assistant. Ask me about your routine, results, or product picks.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createAssistantReply = (text: string) => {
    const normalized = text.toLowerCase();

    if (normalized.includes("dry") || normalized.includes("tight")) {
      return "Your skin sounds dehydrated. Use a gentle cleanser, a hydrating serum, and seal it with a ceramide moisturizer. SPF still matters every morning.";
    }

    if (normalized.includes("acne") || normalized.includes("breakout") || normalized.includes("pimple")) {
      return "For breakouts, keep it simple: gentle cleanse, one targeted active like salicylic acid, a non-comedogenic moisturizer, and daily sunscreen.";
    }

    if (normalized.includes("dark spot") || normalized.includes("pigment") || normalized.includes("hyperpig")) {
      return "For dark spots, consistency wins. SPF daily, plus brightening ingredients like niacinamide or vitamin C can help even your tone over time.";
    }

    if (normalized.includes("routine") || normalized.includes("steps")) {
      return "A strong routine is usually cleanser, treatment, moisturizer, then SPF in the morning. Add actives slowly so your skin stays calm.";
    }

    if (normalized.includes("result") || normalized.includes("analysis") || normalized.includes("score")) {
      return "I can explain each result in plain language: hydration, texture, blemishes, sensitivity, or product matches. Send me the part you want to understand.";
    }

    if (normalized.includes("product") || normalized.includes("cream") || normalized.includes("serum")) {
      return "If you're choosing products, I look for gentle formulas, non-comedogenic textures, and ingredients that match your current skin goal.";
    }

    return "I can help with skincare tips, explain your analysis, or suggest what to do next. Tell me what your skin needs today.";
  };

  const sendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      sender: "assistant",
      text: createAssistantReply(trimmed),
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInputValue("");
    if (!isOpen) {
      setHasUnreadSuggestion(true);
    }
  };

  const handleToggle = () => {
    setIsOpen((current) => {
      const next = !current;
      if (next) {
        setHasUnreadSuggestion(false);
      }
      return next;
    });
  };

  // Don't show on chatbot page
  if (location.pathname === "/chatbot") {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="fixed bottom-24 right-5 lg:bottom-24 lg:right-6 z-50"
      >
        <button
          type="button"
          onClick={handleToggle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#ffb7d0] via-[#f2c4dd] to-[#c8b5ff] p-[2px] shadow-[0_16px_38px_rgba(201,87,133,0.28)] transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#d96b95]/25"
          aria-label="Open AI skin assistant"
          aria-expanded={isOpen}
          aria-controls="deepskyn-ai-assistant"
          title="Hi! I'm your AI skin assistant 💬"
        >
          <span className="absolute inset-0 rounded-full bg-white/40 blur-md opacity-70" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),rgba(255,255,255,0)_55%)]" aria-hidden="true" />
          <span className="absolute inset-[2px] rounded-full bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,242,247,0.88))]" aria-hidden="true" />
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[2px] rounded-full border border-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          />

          <span className="relative z-10 flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_28%,#fdebdc_0%,#f7cfbf_65%,#d29fdc_100%)] shadow-inner">
            <span className="absolute left-[3px] top-[5px] h-[18px] w-[16px] rounded-full bg-[#3c2734]" />
            <span className="absolute right-[3px] top-[5px] h-[18px] w-[16px] rounded-full bg-[#3c2734]" />
            <span className="absolute left-[5px] top-[14px] h-[14px] w-[12px] rounded-full bg-[#f2c8b8]" />
            <span className="absolute right-[5px] top-[14px] h-[14px] w-[12px] rounded-full bg-[#f2c8b8]" />
            <span className="absolute left-[14px] top-[18px] h-1.5 w-1.5 rounded-full bg-[#6b4a47]" />
            <span className="absolute right-[14px] top-[18px] h-1.5 w-1.5 rounded-full bg-[#6b4a47]" />
            <span className="absolute left-1/2 top-[24px] h-1.5 w-4 -translate-x-1/2 rounded-full border-b border-[#b87c7f]" />
            <Sparkles className="absolute right-[3px] top-[2px] h-3 w-3 text-white drop-shadow-sm" aria-hidden="true" />
          </span>

          <AnimatePresence>
            {hasUnreadSuggestion && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-[#ff5f93] shadow-[0_0_0_6px_rgba(255,95,147,0.12)]"
                aria-label="New assistant suggestion available"
              />
            )}
          </AnimatePresence>
        </button>

        <AnimatePresence>
          {isHovered && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 16, y: 6 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 16, y: 6 }}
              transition={{ duration: 0.2 }}
              className="absolute right-20 top-1/2 -translate-y-1/2 rounded-2xl border border-white/70 bg-white/92 px-4 py-3 text-sm text-[#322735] shadow-[0_18px_40px_rgba(71,40,63,0.12)] backdrop-blur-xl"
              role="tooltip"
            >
              Hi! I&apos;m your AI skin assistant 💬
              <div className="absolute right-0 top-1/2 h-3 w-3 translate-x-1/2 -translate-y-1/2 rotate-45 border-r border-t border-white/70 bg-white/92" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <button
              type="button"
              className="absolute inset-0 bg-transparent"
              aria-label="Close assistant"
              onClick={() => setIsOpen(false)}
            />

            <motion.section
              id="deepskyn-ai-assistant"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="absolute bottom-24 right-4 w-[min(92vw,380px)] overflow-hidden rounded-[28px] border border-white/70 bg-white/92 shadow-[0_30px_90px_rgba(83,43,72,0.22)] backdrop-blur-2xl dark:border-[#62405d] dark:bg-[#25182f]/95 lg:bottom-24 lg:right-6"
            >
              <div className="bg-gradient-to-r from-[#d96b95] via-[#ea8bb4] to-[#b89de6] px-5 py-4 text-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                      <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_28%,#fdebdc_0%,#f7cfbf_65%,#d29fdc_100%)]">
                        <span className="absolute left-[2px] top-[4px] h-[16px] w-[14px] rounded-full bg-[#3c2734]" />
                        <span className="absolute right-[2px] top-[4px] h-[16px] w-[14px] rounded-full bg-[#3c2734]" />
                        <span className="absolute left-[11px] top-[16px] h-1.5 w-1.5 rounded-full bg-[#6b4a47]" />
                        <span className="absolute right-[11px] top-[16px] h-1.5 w-1.5 rounded-full bg-[#6b4a47]" />
                        <span className="absolute left-1/2 top-[22px] h-1.5 w-3.5 -translate-x-1/2 rounded-full border-b border-[#b87c7f]" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-wide">AI Skin Assistant</p>
                      <p className="text-xs text-white/80">Friendly help for skincare, results, and routines</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                    aria-label="Close assistant panel"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="flex h-[430px] flex-col bg-[linear-gradient(180deg,rgba(255,249,251,0.96),rgba(255,244,248,0.98))] dark:bg-[linear-gradient(180deg,rgba(35,23,45,0.98),rgba(28,18,36,0.98))]">
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                          message.sender === "user"
                            ? "rounded-br-md bg-[#d96b95] text-white"
                            : "rounded-bl-md border border-white/80 bg-white/92 text-[#322735] dark:border-white/10 dark:bg-white/8 dark:text-white"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-white/70 bg-white/75 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#281936]/80">
                  <div className="flex items-end gap-2 rounded-[24px] border border-[#f2d5e0] bg-white/90 p-2 shadow-[0_10px_24px_rgba(201,87,133,0.08)] dark:border-white/10 dark:bg-[#34213f]/90">
                    <input
                      value={inputValue}
                      onChange={(event) => setInputValue(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="min-h-[44px] flex-1 bg-transparent px-3 text-sm text-[#2f2432] outline-none placeholder:text-[#9b7f91] dark:text-white dark:placeholder:text-[#ae93ab]"
                      placeholder="Ask me about your skin..."
                      aria-label="Ask the AI skin assistant"
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#d96b95] to-[#b89de6] text-white shadow-[0_12px_24px_rgba(201,87,133,0.22)] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#d96b95]/20"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
