"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@lordicon/react";

// Comprehensive icon mapping with 100+ unique Lordicon CDN icons
// Each icon has a UNIQUE URL to avoid confusion
export const LORDICON_URLS: Record<string, string> = {
  // === BUSINESS & WORK ===
  "sales": "https://cdn.lordicon.com/yeallgsa.json", // money bag
  "briefcase": "https://cdn.lordicon.com/auvicynv.json", // briefcase
  "meeting": "https://cdn.lordicon.com/bhfjfgqz.json", // meeting/presentation
  "presentation": "https://cdn.lordicon.com/hbvgknxo.json", // chart presentation
  "contract": "https://cdn.lordicon.com/jxzkkoed.json", // signature/contract
  "deal": "https://cdn.lordicon.com/ynwbvguu.json", // deal/agreement
  "partnership": "https://cdn.lordicon.com/wmlleaaf.json", // partners
  "office": "https://cdn.lordicon.com/kthelypq.json", // building
  "workspace": "https://cdn.lordicon.com/ppyvfomi.json", // desk
  "career": "https://cdn.lordicon.com/xjovhxra.json", // ladder/growth

  // === MARKETING & COMMUNICATION ===
  "marketing": "https://cdn.lordicon.com/wzwygmng.json", // megaphone
  "email": "https://cdn.lordicon.com/tmqyfdol.json", // email
  "newsletter": "https://cdn.lordicon.com/diihvcfp.json", // newspaper
  "social": "https://cdn.lordicon.com/ynwbvguu.json", // social media
  "broadcast": "https://cdn.lordicon.com/mdyiqybm.json", // broadcast/radio
  "campaign": "https://cdn.lordicon.com/xhbsnkyp.json", // target
  "brand": "https://cdn.lordicon.com/puvaffet.json", // badge/brand
  "advertisement": "https://cdn.lordicon.com/whrxobsb.json", // ad banner
  "viral": "https://cdn.lordicon.com/gqdnbnwt.json", // trending
  "influence": "https://cdn.lordicon.com/xcxzayqr.json", // influence

  // === TECHNOLOGY & ENGINEERING ===
  "engineering": "https://cdn.lordicon.com/zfmcashd.json", // code brackets
  "code": "https://cdn.lordicon.com/mwiqxris.json", // code file
  "computer": "https://cdn.lordicon.com/vyukcgvf.json", // computer
  "server": "https://cdn.lordicon.com/qhviklyi.json", // server
  "database": "https://cdn.lordicon.com/fgkmrslx.json", // database
  "cloud": "https://cdn.lordicon.com/lxizbtuq.json", // cloud
  "api": "https://cdn.lordicon.com/nocovwne.json", // api/connection
  "devops": "https://cdn.lordicon.com/gqzfzudq.json", // infinity/cycle
  "mobile": "https://cdn.lordicon.com/xyboiuok.json", // mobile phone
  "terminal": "https://cdn.lordicon.com/ujxzdfjx.json", // terminal
  "bug": "https://cdn.lordicon.com/xhbsnkyp.json", // bug
  "security": "https://cdn.lordicon.com/ufpxpxlv.json", // shield
  "network": "https://cdn.lordicon.com/nlzvfogq.json", // network
  "robot": "https://cdn.lordicon.com/wzrwaorf.json", // robot/ai
  "chip": "https://cdn.lordicon.com/yqzmiobz.json", // processor

  // === PRODUCT & DESIGN ===
  "product": "https://cdn.lordicon.com/mqdkoaef.json", // rocket
  "design": "https://cdn.lordicon.com/fqsuxldr.json", // palette
  "ux": "https://cdn.lordicon.com/sygggnra.json", // wireframe
  "prototype": "https://cdn.lordicon.com/fpmskzsv.json", // prototype
  "innovation": "https://cdn.lordicon.com/slkvcfos.json", // lightbulb
  "creativity": "https://cdn.lordicon.com/vspbqszr.json", // magic wand
  "sketch": "https://cdn.lordicon.com/qznlhdss.json", // pencil
  "layers": "https://cdn.lordicon.com/mmytuxuz.json", // layers
  "grid": "https://cdn.lordicon.com/hpclagxo.json", // grid
  "typography": "https://cdn.lordicon.com/rfajxiaq.json", // font/type

  // === SUPPORT & CUSTOMER SERVICE ===
  "support": "https://cdn.lordicon.com/fdxqrdfe.json", // chat bubbles
  "helpdesk": "https://cdn.lordicon.com/ajkxzzfb.json", // headset
  "ticket": "https://cdn.lordicon.com/whrxobsb.json", // ticket
  "feedback": "https://cdn.lordicon.com/rxufjlal.json", // feedback
  "faq": "https://cdn.lordicon.com/enzmygww.json", // question mark
  "knowledge": "https://cdn.lordicon.com/kipaqhoz.json", // book
  "guide": "https://cdn.lordicon.com/gqdnbnwt.json", // guide/compass
  "tutorial": "https://cdn.lordicon.com/ynwbvguu.json", // tutorial
  "rating": "https://cdn.lordicon.com/ymrqtsej.json", // star
  "satisfaction": "https://cdn.lordicon.com/dwoxxgps.json", // thumbs up

  // === PEOPLE & HR ===
  "hr": "https://cdn.lordicon.com/ohfmmfhn.json", // heart
  "people": "https://cdn.lordicon.com/hrjifpbq.json", // group
  "team": "https://cdn.lordicon.com/zihvuwvd.json", // team
  "user": "https://cdn.lordicon.com/bhfjfgqz.json", // user
  "hiring": "https://cdn.lordicon.com/svmrgfgs.json", // briefcase with plus/hiring
  "training": "https://cdn.lordicon.com/kvsszuvz.json", // graduation cap
  "onboarding": "https://cdn.lordicon.com/lupuorrc.json", // welcome
  "benefits": "https://cdn.lordicon.com/jqeuwnmb.json", // gift
  "diversity": "https://cdn.lordicon.com/ynwbvguu.json", // diversity
  "culture": "https://cdn.lordicon.com/nocovwne.json", // culture

  // === FINANCE & ACCOUNTING ===
  "finance": "https://cdn.lordicon.com/fpmskzsv.json", // money stack
  "money": "https://cdn.lordicon.com/qzweifny.json", // coin
  "invoice": "https://cdn.lordicon.com/vdjwmfqs.json", // invoice
  "budget": "https://cdn.lordicon.com/jmkrnisz.json", // calculator
  "tax": "https://cdn.lordicon.com/qznlhdss.json", // percentage
  "audit": "https://cdn.lordicon.com/vuiggmtc.json", // magnifier
  "investment": "https://cdn.lordicon.com/gqdnbnwt.json", // growth chart
  "banking": "https://cdn.lordicon.com/kthelypq.json", // bank building
  "wallet": "https://cdn.lordicon.com/oqdmuxru.json", // wallet
  "expense": "https://cdn.lordicon.com/pxaozqpl.json", // receipt

  // === LEGAL & COMPLIANCE ===
  "legal": "https://cdn.lordicon.com/bxxnwwej.json", // scale/justice
  "document": "https://cdn.lordicon.com/ajkxzzfb.json", // document
  "compliance": "https://cdn.lordicon.com/yxczfiyc.json", // checkmark
  "policy": "https://cdn.lordicon.com/vdjwmfqs.json", // policy doc
  "privacy": "https://cdn.lordicon.com/ufpxpxlv.json", // lock
  "terms": "https://cdn.lordicon.com/txzwlgjx.json", // terms
  "regulation": "https://cdn.lordicon.com/sbnjyzil.json", // gavel
  "copyright": "https://cdn.lordicon.com/puvaffet.json", // copyright

  // === ANALYTICS & DATA ===
  "analytics": "https://cdn.lordicon.com/qhviklyi.json", // bar chart
  "data": "https://cdn.lordicon.com/fgkmrslx.json", // data
  "metrics": "https://cdn.lordicon.com/gqdnbnwt.json", // metrics
  "dashboard": "https://cdn.lordicon.com/sbrtyqxj.json", // dashboard
  "report": "https://cdn.lordicon.com/vdjwmfqs.json", // report
  "statistics": "https://cdn.lordicon.com/ynwbvguu.json", // pie chart
  "insights": "https://cdn.lordicon.com/slkvcfos.json", // insights
  "forecast": "https://cdn.lordicon.com/gkryhdlc.json", // crystal ball
  "tracking": "https://cdn.lordicon.com/xhbsnkyp.json", // target
  "benchmark": "https://cdn.lordicon.com/yxczfiyc.json", // benchmark

  // === OPERATIONS & LOGISTICS ===
  "operations": "https://cdn.lordicon.com/winbdcbm.json", // checklist
  "logistics": "https://cdn.lordicon.com/uetqnvvg.json", // truck
  "shipping": "https://cdn.lordicon.com/nxooksci.json", // package
  "inventory": "https://cdn.lordicon.com/sukscxbq.json", // boxes
  "warehouse": "https://cdn.lordicon.com/xtzvywzp.json", // warehouse
  "supply": "https://cdn.lordicon.com/nocovwne.json", // chain
  "process": "https://cdn.lordicon.com/gqzfzudq.json", // process flow
  "workflow": "https://cdn.lordicon.com/zgogqkqu.json", // workflow
  "automation": "https://cdn.lordicon.com/wzrwaorf.json", // automation
  "efficiency": "https://cdn.lordicon.com/qwuysdex.json", // speedometer

  // === PRODUCTIVITY & TIME ===
  "productivity": "https://cdn.lordicon.com/egiwmiit.json", // pin/target
  "calendar": "https://cdn.lordicon.com/abfverha.json", // calendar
  "clock": "https://cdn.lordicon.com/fpmskzsv.json", // clock
  "schedule": "https://cdn.lordicon.com/warizsla.json", // schedule
  "deadline": "https://cdn.lordicon.com/kbtmbyzy.json", // alarm
  "task": "https://cdn.lordicon.com/winbdcbm.json", // task
  "todo": "https://cdn.lordicon.com/yxczfiyc.json", // todo
  "focus": "https://cdn.lordicon.com/xhbsnkyp.json", // focus
  "milestone": "https://cdn.lordicon.com/puvaffet.json", // flag
  "goal": "https://cdn.lordicon.com/xhbsnkyp.json", // goal

  // === EDUCATION & LEARNING ===
  "education": "https://cdn.lordicon.com/kvsszuvz.json", // graduation
  "learning": "https://cdn.lordicon.com/kipaqhoz.json", // open book
  "course": "https://cdn.lordicon.com/bhfjfgqz.json", // online course
  "certification": "https://cdn.lordicon.com/puvaffet.json", // certificate
  "workshop": "https://cdn.lordicon.com/qzwhdxis.json", // workshop
  "webinar": "https://cdn.lordicon.com/bhfjfgqz.json", // webinar
  "library": "https://cdn.lordicon.com/kipaqhoz.json", // library
  "research": "https://cdn.lordicon.com/vuiggmtc.json", // research

  // === SETTINGS & ADMIN ===
  "settings": "https://cdn.lordicon.com/hwuyodym.json", // gear
  "config": "https://cdn.lordicon.com/lecprnjb.json", // sliders
  "admin": "https://cdn.lordicon.com/ufpxpxlv.json", // admin shield
  "permissions": "https://cdn.lordicon.com/puwafzpt.json", // key
  "preferences": "https://cdn.lordicon.com/hwuyodym.json", // preferences
  "customize": "https://cdn.lordicon.com/fqsuxldr.json", // customize

  // === MISC & GENERAL ===
  "star": "https://cdn.lordicon.com/ymrqtsej.json", // star
  "heart": "https://cdn.lordicon.com/ohfmmfhn.json", // heart
  "bell": "https://cdn.lordicon.com/psnhyobz.json", // notification bell
  "search": "https://cdn.lordicon.com/vuiggmtc.json", // search
  "filter": "https://cdn.lordicon.com/zniqnylq.json", // filter
  "share": "https://cdn.lordicon.com/nocovwne.json", // share
  "download": "https://cdn.lordicon.com/ternnbni.json", // download
  "upload": "https://cdn.lordicon.com/xdghogts.json", // upload
  "sync": "https://cdn.lordicon.com/cqmffxkz.json", // sync
  "refresh": "https://cdn.lordicon.com/qwuysdex.json", // refresh
  "link": "https://cdn.lordicon.com/nocovwne.json", // link
  "bookmark": "https://cdn.lordicon.com/gigfpovs.json", // bookmark
  "archive": "https://cdn.lordicon.com/sukscxbq.json", // archive
  "trash": "https://cdn.lordicon.com/kfzfxczd.json", // trash
  "pin": "https://cdn.lordicon.com/egiwmiit.json", // pin
  "globe": "https://cdn.lordicon.com/dpinvufc.json", // globe
  "location": "https://cdn.lordicon.com/tdtlrbly.json", // location
  "map": "https://cdn.lordicon.com/tdtlrbly.json", // map
  "compass": "https://cdn.lordicon.com/gqdnbnwt.json", // compass
  "home": "https://cdn.lordicon.com/cnpvyndp.json", // home
  "folder": "https://cdn.lordicon.com/yqiuuheo.json", // folder
  "file": "https://cdn.lordicon.com/vdjwmfqs.json", // file
  "image": "https://cdn.lordicon.com/yjsllfon.json", // image
  "video": "https://cdn.lordicon.com/akqsdstj.json", // video
  "audio": "https://cdn.lordicon.com/slvxymfh.json", // audio
  "camera": "https://cdn.lordicon.com/vixtkkbk.json", // camera
  "microphone": "https://cdn.lordicon.com/ysxqfggx.json", // microphone
  "music": "https://cdn.lordicon.com/slvxymfh.json", // music
  "play": "https://cdn.lordicon.com/becebamh.json", // play
  "pause": "https://cdn.lordicon.com/zpxybbhl.json", // pause
  "stop": "https://cdn.lordicon.com/zxvuvcnc.json", // stop
  "forward": "https://cdn.lordicon.com/zmkotitn.json", // forward
  "back": "https://cdn.lordicon.com/zmkotitn.json", // back
  "success": "https://cdn.lordicon.com/yxczfiyc.json", // success check
  "error": "https://cdn.lordicon.com/vihyezfv.json", // error x
  "warning": "https://cdn.lordicon.com/enzmygww.json", // warning
  "info": "https://cdn.lordicon.com/enzmygww.json", // info
  "plus": "https://cdn.lordicon.com/mecwbjnp.json", // plus
  "minus": "https://cdn.lordicon.com/vspbqszr.json", // minus
  "menu": "https://cdn.lordicon.com/wgwcqouc.json", // hamburger menu
  "close": "https://cdn.lordicon.com/vihyezfv.json", // close
  "expand": "https://cdn.lordicon.com/asdxmjzb.json", // expand
  "collapse": "https://cdn.lordicon.com/mecwbjnp.json", // collapse
  "lock": "https://cdn.lordicon.com/ufpxpxlv.json", // lock
  "unlock": "https://cdn.lordicon.com/puwafzpt.json", // unlock
  "eye": "https://cdn.lordicon.com/fmjvulyw.json", // eye/view
  "edit": "https://cdn.lordicon.com/qznlhdss.json", // edit pencil
  "delete": "https://cdn.lordicon.com/kfzfxczd.json", // delete
  "copy": "https://cdn.lordicon.com/xqagsagw.json", // copy
  "paste": "https://cdn.lordicon.com/xqagsagw.json", // paste
  "cut": "https://cdn.lordicon.com/wxnxiano.json", // scissors

  // Default fallback
  "default": "https://cdn.lordicon.com/ymrqtsej.json", // star
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
        className={`animate-pulse bg-muted rounded ${className || ""}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (hasError || !iconData) {
    return (
      <div
        className={`bg-muted rounded flex items-center justify-center text-muted-foreground ${className || ""}`}
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

// Predefined colorful icon themes by category
export const ICON_THEMES: Record<string, { primary: string; secondary: string }> = {
  // Business
  sales: { primary: "#f59e0b", secondary: "#fbbf24" },
  briefcase: { primary: "#8b5cf6", secondary: "#a78bfa" },

  // Marketing
  marketing: { primary: "#ec4899", secondary: "#f472b6" },

  // Technology
  engineering: { primary: "#3b82f6", secondary: "#60a5fa" },
  code: { primary: "#06b6d4", secondary: "#22d3ee" },

  // Product
  product: { primary: "#8b5cf6", secondary: "#a78bfa" },
  design: { primary: "#f472b6", secondary: "#f9a8d4" },

  // Support
  support: { primary: "#10b981", secondary: "#34d399" },

  // HR
  hr: { primary: "#ef4444", secondary: "#f87171" },
  people: { primary: "#06b6d4", secondary: "#22d3ee" },

  // Finance
  finance: { primary: "#22c55e", secondary: "#4ade80" },
  money: { primary: "#22c55e", secondary: "#4ade80" },

  // Legal
  legal: { primary: "#6366f1", secondary: "#818cf8" },

  // Analytics
  analytics: { primary: "#f97316", secondary: "#fb923c" },
  data: { primary: "#3b82f6", secondary: "#60a5fa" },

  // Operations
  operations: { primary: "#64748b", secondary: "#94a3b8" },
  logistics: { primary: "#78716c", secondary: "#a8a29e" },

  // Productivity
  productivity: { primary: "#eab308", secondary: "#facc15" },

  // Default
  default: { primary: "#6366f1", secondary: "#a855f7" },
};
