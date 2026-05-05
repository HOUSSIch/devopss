import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { GlassCard } from "../components/GlassCard";
import { PageTransition } from "../components/PageTransition";
import { motion, Reorder, useInView } from "motion/react";
import { useRef } from "react";
import {
  Sun,
  Moon,
  Droplets,
  Sparkles,
  Shield,
  Heart,
  Fingerprint,
  Hourglass,
  GripVertical,
  AlertCircle,
  Check,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type RoutineStep = {
  step: string;
  product: string;
  time: string;
  purpose: string;
  howToUse: string;
  frequency: string;
  priority: "high" | "medium" | "low";
};

type Concern = {
  label: string;
  severity: "Mild" | "Moderate" | "High";
  description: string;
};

type AnalysisResult = {
  skinType: string;
  healthScore: number;
  skinAge: number;
  summary: string;
  concerns: Concern[];
  morningRoutine: RoutineStep[];
  eveningRoutine: RoutineStep[];
};

const getStepIcon = (step: string) => {
  const name = step.toLowerCase();

  if (
    name.includes("cleanser") ||
    name.includes("cleaning") ||
    name.includes("cleanse")
  ) {
    return Droplets;
  }

  if (
    name.includes("toner") ||
    name.includes("exfoliant") ||
    name.includes("tone")
  ) {
    return Sparkles;
  }

  if (name.includes("serum") || name.includes("treat")) {
    return Heart;
  }

  if (
    name.includes("sunscreen") ||
    name.includes("spf") ||
    name.includes("protection") ||
    name.includes("protect")
  ) {
    return Shield;
  }

  if (
    name.includes("moisturizer") ||
    name.includes("cream") ||
    name.includes("hydrate") ||
    name.includes("moisturize")
  ) {
    return Droplets;
  }

  return Sparkles;
};

const getPriorityBadge = (priority: "high" | "medium" | "low") => {
  switch (priority) {
    case "high":
      return "bg-[#efe1cf] text-[#8f6d42] border border-[#dcc3a4]";
    case "medium":
      return "bg-[#ece6d7] text-[#7b7257] border border-[#d8cfb8]";
    default:
      return "bg-[#e5eee4] text-[#5b7a56] border border-[#bfd0bc]";
  }
};

const getConcernTone = (severity: "Mild" | "Moderate" | "High") => {
  switch (severity) {
    case "High":
      return "bg-[#a16c8f] text-white";
    case "Moderate":
      return "bg-[#3a857f] text-white";
    default:
      return "bg-[#d2bfac] text-[#6b5442]";
  }
};

const getConcernIcon = (label: string) => {
  const text = label.toLowerCase();
  if (text.includes("uv") || text.includes("sun") || text.includes("protect")) {
    return Shield;
  }
  if (text.includes("dehyd") || text.includes("dry") || text.includes("hydrate")) {
    return Droplets;
  }
  return Sparkles;
};

const getConcernGlyph = (label: string) => {
  const text = label.toLowerCase();
  if (text.includes("uv") || text.includes("sun") || text.includes("protect")) {
    return "✶";
  }
  if (text.includes("dehyd") || text.includes("dry") || text.includes("hydrate")) {
    return "◍";
  }
  return "☼";
};

const getApproxMinutes = (time: string) => {
  const lower = time.toLowerCase();
  const minuteMatch = lower.match(/(\d+)\s*min/);
  if (minuteMatch) return parseInt(minuteMatch[1], 10) || 0;

  const secondMatch = lower.match(/(\d+)\s*sec/);
  if (secondMatch) {
    const seconds = parseInt(secondMatch[1], 10) || 0;
    return Math.max(1, Math.round(seconds / 60));
  }

  return 1;
};

const shortenText = (value: string, maxLength: number) => {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
};

const dedupeAdjacentPhrases = (value: string) => {
  if (!value) return "";

  const tokens = value.replace(/\s+/g, " ").trim().split(" ");
  const result: string[] = [];
  const maxPhraseLength = 8;

  const samePhrase = (aStart: number, bStart: number, length: number) => {
    for (let i = 0; i < length; i++) {
      if ((tokens[aStart + i] || "").toLowerCase() !== (tokens[bStart + i] || "").toLowerCase()) {
        return false;
      }
    }
    return true;
  };

  let i = 0;
  while (i < tokens.length) {
    let merged = false;

    for (let size = maxPhraseLength; size >= 1; size--) {
      if (i + size * 2 > tokens.length) continue;
      if (!samePhrase(i, i + size, size)) continue;

      result.push(...tokens.slice(i, i + size));
      i += size * 2;
      merged = true;
      break;
    }

    if (!merged) {
      result.push(tokens[i]);
      i += 1;
    }
  }

  return result
    .join(" ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
};

const normalizeForDisplay = (value: string, maxLength: number, fallback = "") => {
  const deduped = dedupeAdjacentPhrases(value || "");
  const clean = shortenText(deduped, maxLength);
  return clean || fallback;
};

const cleanStepTitle = (value: string) => {
  if (!value) return "Treatment Step";
  const normalized = dedupeAdjacentPhrases(value)
    .replace(/routine du matin|routine du soir|morning routine|night routine/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || "Treatment Step";
};

const unwrap = (raw: any): any => raw?.data ?? raw;

// Helper to check if routine order is optimal
interface OrderWarning {
  index: number;
  message: string;
  type: "warning" | "success";
}

const checkOrderWarnings = (items: RoutineStep[]): OrderWarning[] => {
  const warnings: OrderWarning[] = [];
  const priorityValue: Record<string, number> = { high: 3, medium: 2, low: 1 };

  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const currentPriority = priorityValue[current.priority];

    // Check if any higher priority item comes after this one
    for (let j = i + 1; j < items.length; j++) {
      const next = items[j];
      const nextPriority = priorityValue[next.priority];

      if (nextPriority > currentPriority) {
        warnings.push({
          index: i,
          message: `Higher priority item "${next.product}" should come before "${current.product}"`,
          type: "warning",
        });
        break;
      }
    }
  }

  // Mark items in optimal positions
  if (warnings.length === 0 && items.length > 0) {
    items.forEach((_, i) => {
      if (i === 0 && items[0].priority === "high") {
        warnings.push({
          index: i,
          message: "Perfect order!",
          type: "success",
        });
      }
    });
  }

  return warnings;
};

// Timeline Step Component - for displaying routine items
interface TimelineStepProps {
  item: RoutineStep;
  Icon: any;
  index: number;
  isLeft: boolean;
  glowColor: string;
  onActive: () => void;
}

function TimelineStep({
  item,
  Icon,
  index,
  isLeft,
  glowColor,
  onActive,
}: TimelineStepProps) {
  const ref = useRef(null);
  const isInView = useInView(ref);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      onAnimationStart={() => {
        if (isInView) onActive();
      }}
      className="relative mb-12 flex items-center"
    >
      {/* Left Side - Card or spacer */}
      <div className={`flex-1 ${isLeft ? "" : "hidden"}`}>
        <motion.div
          initial={{ opacity: 0, x: -40, rotateY: -20 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.1 }}
          whileHover={{ x: -8, rotateZ: 2, scale: 1.02 }}
          className="rounded-2xl border border-white/70 bg-white/65 p-5 backdrop-blur-md shadow-[0_20px_48px_rgba(201,87,133,0.12)] transition-all"
          style={{
            boxShadow: isInView ? `0 20px 48px rgba(201,87,133,0.12), 0 0 24px ${glowColor}40` : "0 20px 48px rgba(201,87,133,0.12)",
          }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{ rotate: isInView ? 360 : 0 }}
              transition={{ duration: 2, ease: "linear" }}
              className="flex-shrink-0"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-white/50"
                style={{ borderColor: glowColor }}
              >
                <Icon className="h-5 w-5" style={{ color: glowColor }} />
              </div>
            </motion.div>

            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-[#1c2235]">
                  {normalizeForDisplay(cleanStepTitle(item.step), 28, "Step")}
                </h4>
                <motion.span
                  animate={{ scale: isInView ? 1 : 0.95 }}
                  className="text-xs rounded-full px-2 py-1 font-semibold"
                  style={{ backgroundColor: `${glowColor}20`, color: glowColor }}
                >
                  {item.priority === "high" ? "★" : item.priority === "medium" ? "◆" : "●"}
                </motion.span>
              </div>
              <p className="mb-1 text-sm font-medium text-[#5a5f73]">
                {normalizeForDisplay(item.product, 40, "Product")}
              </p>
              <p className="mb-2 text-xs text-[#5a5f73]">
                {normalizeForDisplay(item.purpose, 80, "Purpose")}
              </p>
              <p className="text-xs leading-relaxed text-[#5a5f73]">
                <strong>How:</strong> {normalizeForDisplay(item.howToUse, 85, "Apply gently.")}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Center Timeline Node */}
      <div className="relative flex w-12 flex-shrink-0 items-center justify-center">
        <motion.div
          animate={isInView ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : { scale: 1 }}
          transition={{ duration: 2, repeat: isInView ? Infinity : 0 }}
          className="absolute h-8 w-8 rounded-full"
          style={{ backgroundColor: `${glowColor}40` }}
        />
        <motion.div
          animate={{ rotate: isInView ? 360 : 0 }}
          transition={{ duration: 3, repeat: isInView ? Infinity : 0, ease: "linear" }}
          className="h-6 w-6 rounded-full border-2 bg-white shadow-lg"
          style={{ borderColor: glowColor }}
        />
      </div>

      {/* Right Side - Card or spacer */}
      <div className={`flex-1 ${!isLeft ? "" : "hidden"}`}>
        <motion.div
          initial={{ opacity: 0, x: 40, rotateY: 20 }}
          whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ duration: 0.6, delay: index * 0.05 + 0.1 }}
          whileHover={{ x: 8, rotateZ: -2, scale: 1.02 }}
          className="rounded-2xl border border-white/70 bg-white/65 p-5 backdrop-blur-md shadow-[0_20px_48px_rgba(201,87,133,0.12)] transition-all"
          style={{
            boxShadow: isInView ? `0 20px 48px rgba(201,87,133,0.12), 0 0 24px ${glowColor}40` : "0 20px 48px rgba(201,87,133,0.12)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-[#1c2235]">
                  {normalizeForDisplay(cleanStepTitle(item.step), 28, "Step")}
                </h4>
                <motion.span
                  animate={{ scale: isInView ? 1 : 0.95 }}
                  className="text-xs rounded-full px-2 py-1 font-semibold"
                  style={{ backgroundColor: `${glowColor}20`, color: glowColor }}
                >
                  {item.priority === "high" ? "★" : item.priority === "medium" ? "◆" : "●"}
                </motion.span>
              </div>
              <p className="mb-1 text-sm font-medium text-[#5a5f73]">
                {normalizeForDisplay(item.product, 40, "Product")}
              </p>
              <p className="mb-2 text-xs text-[#5a5f73]">
                {normalizeForDisplay(item.purpose, 80, "Purpose")}
              </p>
              <p className="text-xs leading-relaxed text-[#5a5f73]">
                <strong>How:</strong> {normalizeForDisplay(item.howToUse, 85, "Apply gently.")}
              </p>
            </div>

            <motion.div
              animate={{ rotate: isInView ? 360 : 0 }}
              transition={{ duration: 2, ease: "linear" }}
              className="flex-shrink-0"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-white/50"
                style={{ borderColor: glowColor }}
              >
                <Icon className="h-5 w-5" style={{ color: glowColor }} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Draggable Step Component
interface DraggableStepProps {
  item: RoutineStep;
  index: number;
  section: "morning" | "evening";
  isExpanded: boolean;
  onExpand: (id: string) => void;
  hasWarning: boolean;
  warningMessage?: string;
}

function DraggableStep({
  item,
  index,
  section,
  isExpanded,
  onExpand,
  hasWarning,
  warningMessage,
}: DraggableStepProps) {
  const Icon = getStepIcon(item.step);
  const glowColor =
    item.priority === "high" ? "#c95785" : item.priority === "medium" ? "#b55f82" : "#d49cb8";

  const stepId = `${section}-${index}`;

  return (
    <Reorder.Item
      value={item}
      id={stepId}
      as="div"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="group mb-3"
    >
      <motion.div
        onClick={() => onExpand(stepId)}
        whileHover={{ scale: 1.01, y: -2 }}
        whileDrag={{ scale: 1.05, boxShadow: `0 0 20px ${glowColor}60` }}
        className="relative cursor-pointer"
      >
        {/* Warning/Success Badge */}
        {hasWarning && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute -left-8 top-0 flex items-center gap-2"
          >
            {warningMessage?.includes("Perfect") ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-200">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            )}
          </motion.div>
        )}

        {/* Main Card */}
        <motion.div
          className={`rounded-2xl border border-white/70 bg-white/65 p-5 backdrop-blur-md transition-all ${
            isExpanded ? "ring-2 ring-offset-2" : ""
          }`}
          style={{
            ringColor: isExpanded ? glowColor : "transparent",
            boxShadow: isExpanded
              ? `0 20px 48px rgba(201,87,133,0.2), 0 0 24px ${glowColor}50`
              : `0 20px 48px rgba(201,87,133,0.12)`,
          }}
        >
          {/* Collapsed View */}
          <motion.div
            animate={{ height: isExpanded ? 0 : "auto", opacity: isExpanded ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-4 overflow-hidden"
          >
            {/* Drag Handle */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="h-5 w-5 text-[#c95785]/50" />
            </motion.div>

            {/* Icon */}
            <motion.div
              animate={{ rotate: 0 }}
              transition={{ duration: 2 }}
              className="flex-shrink-0"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 bg-white/50"
                style={{ borderColor: glowColor }}
              >
                <Icon className="h-5 w-5" style={{ color: glowColor }} />
              </div>
            </motion.div>

            {/* Content */}
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <h4 className="font-semibold text-[#1c2235]">
                  {normalizeForDisplay(cleanStepTitle(item.step), 28, "Step")}
                </h4>
                <motion.span
                  className="text-xs rounded-full px-2 py-1 font-semibold"
                  style={{ backgroundColor: `${glowColor}20`, color: glowColor }}
                >
                  {item.priority === "high" ? "★ Essential" : item.priority === "medium" ? "◆ Important" : "● Optional"}
                </motion.span>
              </div>
              <p className="text-sm font-medium text-[#5a5f73]">
                {normalizeForDisplay(item.product, 40, "Product")}
              </p>
              <p className="text-xs text-[#5a5f73]">{item.time}</p>
            </div>

            {/* Click to Expand Indicator */}
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex-shrink-0 pt-1 text-[#c95785]"
            >
              <span className="text-lg">⋮</span>
            </motion.div>
          </motion.div>

          {/* Expanded View */}
          <motion.div
            animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-white/40 pt-4">
              {/* Purpose */}
              <div>
                <p className="text-xs font-semibold uppercase text-[#c95785]">Purpose</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5a5f73]">
                  {normalizeForDisplay(item.purpose, 120, "Targeted skincare step")}
                </p>
              </div>

              {/* How to Use */}
              <div>
                <p className="text-xs font-semibold uppercase text-[#c95785]">Application</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5a5f73]">
                  {normalizeForDisplay(item.howToUse, 150, "Apply with gentle motions")}
                </p>
              </div>

              {/* Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-[#c95785]">Frequency</p>
                  <p className="mt-1 text-sm font-medium text-[#1c2235]">{item.frequency}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#c95785]">Duration</p>
                  <p className="mt-1 text-sm font-medium text-[#1c2235]">{item.time}</p>
                </div>
              </div>

              {/* Priority Badge */}
              <div className="flex items-center gap-2 rounded-lg bg-white/40 p-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${glowColor}20` }}
                >
                  <span style={{ color: glowColor }}>
                    {item.priority === "high" ? "★" : item.priority === "medium" ? "◆" : "●"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[#5a5f73]">Priority</p>
                  <p className="text-sm font-medium text-[#1c2235] capitalize">{item.priority}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Warning Tooltip */}
        {hasWarning && warningMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 text-xs p-2 rounded-lg flex items-start gap-2 ${
              warningMessage.includes("Perfect")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{warningMessage}</span>
          </motion.div>
        )}
      </motion.div>
    </Reorder.Item>
  );
}

// AI Assistant Component with Guidance
interface AIAssistantProps {
  currentStep: string | null;
  routine: RoutineStep[];
  section: "morning" | "evening" | null;
}

const generateGuidance = (
  currentStep: string | null,
  routine: RoutineStep[],
  section: "morning" | "evening" | null,
): string => {
  if (!currentStep || !routine.length) {
    return section === "morning"
      ? "✨ Let's start your morning ritual! Begin with the first step."
      : section === "evening"
        ? "🌙 Ready for your evening skincare? Let's begin!"
        : "👋 Welcome! Scroll to explore your personalized routine.";
  }

  const stepIndex = parseInt(currentStep.split("-").pop() || "0", 10);
  const step = routine[stepIndex];

  if (!step) {
    return "✨ Great progress! Continue to the next step.";
  }

  const guidance: Record<string, string[]> = {
    cleanser: [
      "🧴 Start with cleanser to remove impurities",
      "Gently massage your face with the cleanser",
      "Rinse thoroughly with lukewarm water",
    ],
    toner: [
      "✨ Apply toner to balance pH levels",
      "Pat the toner gently into your skin",
      "Wait a moment for full absorption",
    ],
    serum: [
      "💧 Apply serum to target specific concerns",
      "Use gentle tapping motions for absorption",
      "Let it set before the next product",
    ],
    sunscreen: [
      "☀️ Don't forget SPF protection!",
      "Apply generously across all exposed areas",
      "Reapply throughout the day",
    ],
    moisturizer: [
      "🌊 Lock in hydration with moisturizer",
      "Massage in upward strokes for circulation",
      "Complete your routine!",
    ],
  };

  const stepType = step.step.toLowerCase();
  let messages = guidance["cleanser"];

  if (stepType.includes("toner") || stepType.includes("exfoliant")) messages = guidance.toner;
  if (stepType.includes("serum")) messages = guidance.serum;
  if (stepType.includes("sunscreen") || stepType.includes("spf")) messages = guidance.sunscreen;
  if (stepType.includes("moisturizer") || stepType.includes("cream")) messages = guidance.moisturizer;

  const messageIndex = stepIndex % messages.length;
  return messages[messageIndex];
};

function AIAssistant({ currentStep, routine, section }: AIAssistantProps) {
  const guidance = generateGuidance(currentStep, routine, section);
  const [isVisible, setIsVisible] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.8, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3"
    >
      {/* Chat Bubble */}
      <motion.div
        key={guidance}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative max-w-xs"
      >
        <div className="relative rounded-3xl rounded-br-none border border-white/80 bg-gradient-to-br from-white/85 to-white/70 p-4 backdrop-blur-md shadow-[0_20px_40px_rgba(201,87,133,0.2)]">
          {/* Glow effect */}
          <motion.div
            className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-[#c95785]/20 to-[#f1a9c2]/20 blur-md -z-10"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Message */}
          <p className="text-sm leading-relaxed text-[#1c2235] font-medium">{guidance}</p>

          {/* Tail */}
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-white/85" />
        </div>
      </motion.div>

      {/* Avatar */}
      <motion.div
        animate={{
          y: [0, -8, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* Avatar Container */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-[#f1a9c2] to-[#c95785] shadow-[0_12px_32px_rgba(201,87,133,0.3)] cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setIsVisible(!isVisible)}
        >
          {/* Avatar Icon */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-2xl"
          >
            ✨
          </motion.div>
        </div>

        {/* Pulse Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#c95785]/50"
          animate={{ scale: [1, 1.3], opacity: [1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Status Indicator */}
        <motion.div
          className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white shadow-md"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-[#5a5f73] text-center"
      >
        Click to dismiss
      </motion.p>
    </motion.div>
  );
}

export function RoutinePage() {
  const navigate = useNavigate();
  const { token, isAuthenticated, isInitialized, login, refreshNow } = useAuth();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState<"morning" | "evening" | null>(null);

  useEffect(() => {
    const fetchLatestAnalysis = async () => {
      if (!isInitialized) return;

      if (!isAuthenticated) {
        setLoading(false);
        setErrorMessage("Please log in first.");
        return;
      }

      try {
        await refreshNow();

        if (!token) {
          throw new Error("Authentication token is missing");
        }

        const API = (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
        const response = await fetch(`${API}/ai/my-latest-analysis`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const raw = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof raw?.message === "string"
              ? raw.message
              : raw?.error || "Failed to load routine",
          );
        }

        const data = unwrap(raw);

        if (!data) {
          setAnalysis(null);
          setErrorMessage("No analysis found. Please upload a photo first.");
          return;
        }

        const normalizedAnalysis: AnalysisResult = {
          skinType: data.skinType,
          healthScore: data.healthScore,
          skinAge: data.skinAge,
          summary: data.summary,
          concerns: Array.isArray(data.concerns) ? data.concerns : [],
          morningRoutine: Array.isArray(data.morningRoutine) ? data.morningRoutine : [],
          eveningRoutine: Array.isArray(data.eveningRoutine) ? data.eveningRoutine : [],
        };

        setAnalysis(normalizedAnalysis);
        setErrorMessage("");
      } catch (error: any) {
        console.error("Failed to fetch latest analysis:", error);

        const fallback = localStorage.getItem("skinAnalysisResult");
        if (fallback) {
          try {
            const data = unwrap(JSON.parse(fallback));
            if (data) {
              setAnalysis(data);
              setErrorMessage("");
            } else {
              setErrorMessage(error?.message || "Failed to load routine");
            }
          } catch {
            setErrorMessage(error?.message || "Failed to load routine");
          }
        } else {
          setErrorMessage(error?.message || "Failed to load routine");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLatestAnalysis();
  }, [isAuthenticated, isInitialized, token, refreshNow]);

  const morningRoutine = analysis?.morningRoutine || [];
  const nightRoutine = analysis?.eveningRoutine || [];

  const totalMorningTime = morningRoutine.reduce(
    (total, item) => total + getApproxMinutes(item.time),
    0,
  );

  const totalNightTime = nightRoutine.reduce(
    (total, item) => total + getApproxMinutes(item.time),
    0,
  );

  const allSteps = [
    ...morningRoutine.map((r, i) => ({ ...r, id: `morning-${i}`, section: "morning" as const })),
    ...nightRoutine.map((r, i) => ({ ...r, id: `night-${i}`, section: "night" as const })),
  ];

  return (
    <PageTransition direction="left">
      <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-[#f9dbe6] via-[#f8f0fb] to-[#fff3eb] px-4 py-12 sm:px-6">
        {/* Animated Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.5),transparent_38%),radial-gradient(circle_at_85%_25%,rgba(241,169,194,0.3),transparent_36%),radial-gradient(circle_at_50%_95%,rgba(255,212,188,0.2),transparent_32%)]" />
          <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: "repeating-radial-gradient(circle at 50% 50%, rgba(167,142,155,0.08) 0px, rgba(167,142,155,0.08) 1px, transparent 1px, transparent 8px)" }} />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full blur-xl"
              style={{
                width: 200 + i * 100,
                height: 200 + i * 100,
                left: `${15 + i * 15}%`,
                top: `${-10 + i * 20}%`,
                background: i % 2 === 0
                  ? "radial-gradient(circle, rgba(241,169,194,0.25), rgba(241,169,194,0))"
                  : "radial-gradient(circle, rgba(255,212,188,0.15), rgba(255,212,188,0))",
              }}
              animate={{
                x: [0, 40 - i * 8, 0],
                y: [0, -28 + i * 5, 0],
              }}
              transition={{
                duration: 14 + i * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h1
              className="mb-4 text-5xl font-semibold tracking-tight text-[#1c2235] sm:text-6xl"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif' }}
            >
              Your Skin Journey
            </h1>
            <p className="text-lg text-[#5a5f73] sm:text-xl">
              A personalized voyage through your skincare ritual
            </p>
          </motion.div>

          {loading ? (
            <GlassCard className="border border-white/70 bg-white/55 py-12 text-center backdrop-blur-xl">
              <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-4 border-[#c95785] border-t-transparent" />
              <p className="text-[#5a5f73]">Loading your skin journey...</p>
            </GlassCard>
          ) : !analysis ? (
            <GlassCard className="border border-white/70 bg-white/55 text-center backdrop-blur-xl">
              <p className="mb-4 text-[#5a5f73]">
                {errorMessage || "No analysis found. Please upload a photo first."}
              </p>
              {!isAuthenticated ? (
                <Button onClick={() => login("/routine")}>Log in</Button>
              ) : (
                <Button onClick={() => navigate("/upload")}>Go to Upload</Button>
              )}
            </GlassCard>
          ) : (
            <>
              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-20"
              >
                <div className="grid gap-5 md:grid-cols-4">
                  {/* Skin Type */}
                  <motion.div
                    whileHover={{ y: -8, rotateZ: 2 }}
                    className="rounded-2xl border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_16px_36px_rgba(201,87,133,0.15)] transition-all"
                  >
                    <p className="text-xs uppercase tracking-wider text-[#5a5f73]">Skin Signature</p>
                    <p className="mt-2 text-2xl font-semibold text-[#1c2235]">
                      {normalizeForDisplay(analysis.skinType, 20, "Balanced")}
                    </p>
                    <motion.div
                      className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f1a9c2]/30 to-[#ffd4bc]/30"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Fingerprint className="h-5 w-5 text-[#c95785]" />
                    </motion.div>
                  </motion.div>

                  {/* Health Score */}
                  <motion.div
                    whileHover={{ y: -8, rotateZ: -2 }}
                    className="rounded-2xl border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_16px_36px_rgba(201,87,133,0.15)] transition-all"
                  >
                    <p className="text-xs uppercase tracking-wider text-[#5a5f73]">Health Index</p>
                    <motion.div
                      className="mx-auto mt-3 h-20 w-20 rounded-full p-1"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      style={{
                        background: `conic-gradient(#c95785 ${Math.max(0, Math.min(360, analysis.healthScore * 3.6))}deg, #f1d7e8 0deg)`,
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-lg font-bold text-[#1c2235]">
                        {analysis.healthScore}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Skin Age */}
                  <motion.div
                    whileHover={{ y: -8, rotateZ: 2 }}
                    className="rounded-2xl border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_16px_36px_rgba(201,87,133,0.15)] transition-all"
                  >
                    <p className="text-xs uppercase tracking-wider text-[#5a5f73]">Chrono-Age</p>
                    <p className="mt-2 text-3xl font-bold text-[#1c2235]">{analysis.skinAge}</p>
                    <motion.div
                      className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#f1a9c2]/30 to-[#ffd4bc]/30"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, delay: 0.2 }}
                    >
                      <Hourglass className="h-5 w-5 text-[#c95785]" />
                    </motion.div>
                  </motion.div>

                  {/* Summary */}
                  <motion.div
                    whileHover={{ y: -8, rotateZ: -2 }}
                    className="rounded-2xl border border-white/80 bg-white/60 p-5 backdrop-blur-md shadow-[0_16px_36px_rgba(201,87,133,0.15)] transition-all"
                  >
                    <p className="text-xs uppercase tracking-wider text-[#5a5f73]">Summary</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#5a5f73]">
                      {normalizeForDisplay(analysis.summary, 100, "Your skin is progressing beautifully.")}
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Vertical Timeline */}
              <div className="relative mb-20 py-12">
                {/* Center Timeline Line */}
                <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-[#c95785] to-transparent">
                  {/* Glowing line effect */}
                  <motion.div
                    className="absolute inset-0 w-1 bg-gradient-to-b from-transparent via-[#c95785] to-transparent blur-md"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>

                {/* Timeline Steps */}
                <div className="space-y-0">
                  {/* MORNING SECTION HEADER */}
                  {morningRoutine.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      onViewportEnter={() => setCurrentSection("morning")}
                      className="relative mb-16 py-8"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f1a9c2]/20 to-transparent" />
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        <motion.div
                          animate={{ rotate: 360, y: [0, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="h-12 w-12 rounded-full bg-gradient-to-br from-[#f1a9c2] to-[#ffd4bc] p-3 shadow-[0_8px_24px_rgba(241,169,194,0.4)]"
                        >
                          <Sun className="h-full w-full text-white" />
                        </motion.div>
                        <div>
                          <h2
                            className="text-3xl font-semibold text-[#1c2235]"
                            style={{ fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif' }}
                          >
                            Morning Ritual
                          </h2>
                          <p className="text-sm text-[#5a5f73]">Start your day with intention</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Morning Steps */}
                  {morningRoutine.map((item, index) => {
                    const Icon = getStepIcon(item.step);
                    const isLeft = index % 2 === 0;
                    const glowColor =
                      item.priority === "high"
                        ? "#c95785"
                        : item.priority === "medium"
                          ? "#b55f82"
                          : "#d49cb8";

                    return (
                      <TimelineStep
                        key={`morning-${index}`}
                        item={item}
                        Icon={Icon}
                        index={index}
                        isLeft={isLeft}
                        glowColor={glowColor}
                        onActive={() => {
                          setActiveStep(`morning-${index}`);
                          setCurrentSection("morning");
                        }}
                      />
                    );
                  })}

                  {/* NIGHT SECTION HEADER */}
                  {nightRoutine.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      onViewportEnter={() => setCurrentSection("evening")}
                      className="relative my-16 py-8"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c95785]/20 to-transparent" />
                      <div className="relative z-10 flex items-center justify-center gap-4">
                        <motion.div
                          animate={{ rotate: -360, y: [0, -10, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          className="h-12 w-12 rounded-full bg-gradient-to-br from-[#c95785] to-[#b55f82] p-3 shadow-[0_8px_24px_rgba(201,87,133,0.4)]"
                        >
                          <Moon className="h-full w-full text-white" />
                        </motion.div>
                        <div>
                          <h2
                            className="text-3xl font-semibold text-[#1c2235]"
                            style={{ fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif' }}
                          >
                            Evening Retreat
                          </h2>
                          <p className="text-sm text-[#5a5f73]">Repair and rejuvenate while you rest</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Night Steps */}
                  {nightRoutine.map((item, index) => {
                    const Icon = getStepIcon(item.step);
                    const isLeft = (morningRoutine.length + index) % 2 === 0;
                    const glowColor =
                      item.priority === "high"
                        ? "#c95785"
                        : item.priority === "medium"
                          ? "#b55f82"
                          : "#d49cb8";

                    return (
                      <TimelineStep
                        key={`night-${index}`}
                        item={item}
                        Icon={Icon}
                        index={morningRoutine.length + index}
                        isLeft={isLeft}
                        glowColor={glowColor}
                        onActive={() => {
                          setActiveStep(`night-${index}`);
                          setCurrentSection("evening");
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Skin Concerns - Floating Bubbles */}
              {analysis.concerns?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="mb-20"
                >
                  <h3
                    className="mb-8 text-center text-4xl font-semibold text-[#1c2235]"
                    style={{ fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif' }}
                  >
                    Your Skin Concerns
                  </h3>
                  <div className="grid gap-6 md:grid-cols-3">
                    {analysis.concerns.map((concern, index) => (
                      <motion.div
                        key={`${concern.label}-${index}`}
                        initial={{ opacity: 0, scale: 0.6, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        whileHover={{ scale: 1.08, y: -10 }}
                        className="relative"
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 4, repeat: Infinity }}
                        />
                        <div
                          className={`relative rounded-3xl border border-white/70 bg-white/65 p-8 text-center backdrop-blur-md shadow-[0_16px_40px_rgba(201,87,133,0.12)] transition-all ${getConcernTone(concern.severity)}`}
                          style={{
                            borderColor: `${getConcernTone(concern.severity).includes("bg-[#a16c8f]") ? "#d9c5e0" : getConcernTone(concern.severity).includes("bg-[#3a857f]") ? "#b8ddd9" : "#e6d8cc"}`,
                          }}
                        >
                          {/* Glow effect */}
                          <motion.div
                            className="absolute -inset-1 rounded-3xl opacity-20 blur-xl"
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{
                              background: `radial-gradient(circle, ${getConcernTone(concern.severity).includes("bg-[#a16c8f]") ? "#a16c8f" : getConcernTone(concern.severity).includes("bg-[#3a857f]") ? "#3a857f" : "#d2bfac"}, transparent)`,
                            }}
                          />

                          <div className="relative z-10">
                            <div className="mb-4 flex justify-center">
                              <span className={`inline-block rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${getConcernTone(concern.severity)}`}>
                                {concern.severity} severity
                              </span>
                            </div>

                            <h4 className="mb-3 text-xl font-semibold text-[#1c2235]">
                              {normalizeForDisplay(concern.label, 24, "Skin Concern")}
                            </h4>

                            <p className="mb-4 text-sm leading-relaxed text-[#5a5f73]">
                              {normalizeForDisplay(concern.description, 90, "This concern can improve with consistent targeted care.")}
                            </p>

                            {(() => {
                              const ConcernIcon = getConcernIcon(concern.label);
                              return (
                                <motion.div
                                  animate={{ rotate: [0, 5, -5, 0], y: [0, -3, 0] }}
                                  transition={{ duration: 4, repeat: Infinity }}
                                  className="flex justify-center"
                                >
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/40 text-[#c95785]">
                                    <ConcernIcon className="h-6 w-6" />
                                  </div>
                                </motion.div>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Pro Tips */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="mb-12"
              >
                <h3
                  className="mb-8 text-center text-4xl font-semibold text-[#1c2235]"
                  style={{ fontFamily: '"Cormorant Garamond", Georgia, "Times New Roman", serif' }}
                >
                  Expert Guidance
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { icon: "🌊", title: "Layering", desc: "Apply from thinnest to thickest consistency" },
                    { icon: "⏱️", title: "Patience", desc: "Wait 30-60 seconds between each product" },
                    { icon: "💫", title: "Coverage", desc: "Don't forget neck and décolletage" },
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group rounded-2xl border border-white/70 bg-white/60 p-6 backdrop-blur-md shadow-[0_12px_32px_rgba(201,87,133,0.1)] transition-all"
                    >
                      <motion.div
                        className="mb-4 text-4xl"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {tip.icon}
                      </motion.div>
                      <h4 className="mb-2 font-semibold text-[#1c2235]">{tip.title}</h4>
                      <p className="text-sm text-[#5a5f73]">{tip.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className="flex justify-center"
              >
                <Button
                  glow
                  className="h-14 min-w-[300px] rounded-full border border-white/30 bg-gradient-to-r from-[#c95785] to-[#b55f82] text-lg font-semibold text-white shadow-[0_16px_40px_rgba(201,87,133,0.4)] hover:shadow-[0_20px_50px_rgba(201,87,133,0.5)]"
                  onClick={() => navigate("/products")}
                >
                  ✨ Explore Your Skincare Collection
                </Button>
              </motion.div>

              {/* AI Assistant */}
              <AIAssistant
                currentStep={activeStep}
                routine={currentSection === "morning" ? morningRoutine : nightRoutine}
                section={currentSection}
              />
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}