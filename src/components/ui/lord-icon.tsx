"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@lordicon/react";

// Icon mapping for departments/categories - using free Lordicon CDN icons
// Each department has a UNIQUE icon to avoid confusion
export const LORDICON_URLS: Record<string, string> = {
  // Business & Sales - handshake deal
  "sales": "https://cdn.lordicon.com/wjyqkiew.json",
  "briefcase": "https://cdn.lordicon.com/auvicynv.json",

  // Marketing & Communication - megaphone/announcement
  "marketing": "https://cdn.lordicon.com/wzwygmng.json",
  "megaphone": "https://cdn.lordicon.com/wzwygmng.json",

  // Technology & Engineering - code/terminal brackets
  "engineering": "https://cdn.lordicon.com/zfmcashd.json",
  "code": "https://cdn.lordicon.com/zfmcashd.json",
  "computer": "https://cdn.lordicon.com/vyukcgvf.json",

  // Product & Design - rocket launch
  "product": "https://cdn.lordicon.com/mqdkoaef.json",
  "design": "https://cdn.lordicon.com/fqsuxldr.json",

  // Support & Service - chat bubbles
  "support": "https://cdn.lordicon.com/fdxqrdfe.json",
  "customer": "https://cdn.lordicon.com/fdxqrdfe.json",

  // People & HR - heart/care (representing employee care)
  "hr": "https://cdn.lordicon.com/ohfmmfhn.json",
  "people": "https://cdn.lordicon.com/hrjifpbq.json",

  // Finance & Money - money/coins
  "finance": "https://cdn.lordicon.com/fpmskzsv.json",
  "money": "https://cdn.lordicon.com/fpmskzsv.json",

  // Legal & Documents - document/contract
  "legal": "https://cdn.lordicon.com/vdjwmfqs.json",
  "document": "https://cdn.lordicon.com/vdjwmfqs.json",

  // Analytics & Data - chart/graph
  "analytics": "https://cdn.lordicon.com/gqdnbnwt.json",
  "data": "https://cdn.lordicon.com/gqdnbnwt.json",

  // Creative - lightbulb/idea
  "creative": "https://cdn.lordicon.com/slkvcfos.json",
  "idea": "https://cdn.lordicon.com/slkvcfos.json",

  // Operations - checklist/clipboard
  "operations": "https://cdn.lordicon.com/winbdcbm.json",
  "settings": "https://cdn.lordicon.com/hwuyodym.json",

  // Default - star
  "default": "https://cdn.lordicon.com/ymrqtsej.json",
};

interface LordIconProps {
  icon: string; // Icon name from LORDICON_URLS or a direct URL
  size?: number;
  trigger?: "hover" | "click" | "loop" | "loop-on-hover" | "morph" | "boomerang" | "in";
  colors?: {
    primary?: string;
    secondary?: string;
  };
  className?: string;
}

export function LordIcon({
  icon,
  size = 64,
  trigger = "hover",
  colors = { primary: "#6366f1", secondary: "#a855f7" },
  className
}: LordIconProps) {
  const playerRef = useRef<Player>(null);
  const [iconData, setIconData] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get the icon URL - either from mapping or use direct URL
  const iconUrl = icon.startsWith("http") ? icon : (LORDICON_URLS[icon.toLowerCase()] || LORDICON_URLS["default"]);

  useEffect(() => {
    let mounted = true;

    const loadIcon = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const response = await fetch(iconUrl);
        if (!response.ok) throw new Error("Failed to load icon");
        const data = await response.json();
        if (mounted) {
          setIconData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading lordicon:", error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadIcon();

    return () => {
      mounted = false;
    };
  }, [iconUrl]);

  // Handle hover trigger manually
  const handleMouseEnter = () => {
    if (trigger === "hover" || trigger === "loop-on-hover") {
      playerRef.current?.playFromBeginning();
    }
  };

  // Handle click trigger
  const handleClick = () => {
    if (trigger === "click") {
      playerRef.current?.playFromBeginning();
    }
  };

  // Auto-play for loop trigger
  useEffect(() => {
    if (trigger === "loop" && iconData && playerRef.current) {
      const playLoop = () => {
        playerRef.current?.playFromBeginning();
      };
      playLoop();
      const interval = setInterval(playLoop, 2000);
      return () => clearInterval(interval);
    }
  }, [trigger, iconData]);

  // Play once when entering viewport
  useEffect(() => {
    if (trigger === "in" && iconData && playerRef.current) {
      playerRef.current?.playFromBeginning();
    }
  }, [trigger, iconData]);

  if (isLoading) {
    return (
      <div
        className={`animate-pulse bg-muted rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (hasError || !iconData) {
    return (
      <div
        className={`bg-muted rounded flex items-center justify-center text-muted-foreground ${className}`}
        style={{ width: size, height: size }}
      >
        ?
      </div>
    );
  }

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      style={{ width: size, height: size }}
    >
      <Player
        ref={playerRef}
        icon={iconData}
        size={size}
        colorize={colors.primary}
      />
    </div>
  );
}

// Predefined colorful icon themes
export const ICON_THEMES = {
  sales: { primary: "#f59e0b", secondary: "#fbbf24" }, // Amber
  marketing: { primary: "#ec4899", secondary: "#f472b6" }, // Pink
  engineering: { primary: "#3b82f6", secondary: "#60a5fa" }, // Blue
  product: { primary: "#8b5cf6", secondary: "#a78bfa" }, // Violet
  support: { primary: "#10b981", secondary: "#34d399" }, // Emerald
  hr: { primary: "#06b6d4", secondary: "#22d3ee" }, // Cyan
  finance: { primary: "#22c55e", secondary: "#4ade80" }, // Green
  legal: { primary: "#6366f1", secondary: "#818cf8" }, // Indigo
  analytics: { primary: "#f97316", secondary: "#fb923c" }, // Orange
  creative: { primary: "#eab308", secondary: "#facc15" }, // Yellow
  operations: { primary: "#64748b", secondary: "#94a3b8" }, // Slate
  default: { primary: "#6366f1", secondary: "#a855f7" }, // Purple
};
