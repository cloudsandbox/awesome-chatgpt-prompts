# Configurable Run Destinations

## Overview

Make the Play/Run button configurable so organizations can specify their own AI platforms (like Microsoft 365 Copilot) instead of or alongside public platforms.

## Context

- **Use case:** Volue employees should run prompts in their corporate M365 Copilot
- **Current state:** Run button shows dropdown with public platforms (ChatGPT, Claude, etc.)
- **Goal:** Config-driven destinations with smart UX (direct click when single platform)

## Design

### Config Structure

```typescript
// prompts.config.ts
export default defineConfig({
  // ... existing config ...

  runDestinations: {
    corporate: [
      {
        id: "m365-copilot",
        name: "Microsoft 365 Copilot",
        url: "https://m365.cloud.microsoft/chat/",
        supportsQuerystring: false,
      }
    ],
    showPublicPlatforms: false,
  },
})
```

### Type Definitions

```typescript
// src/lib/config.ts
interface RunDestination {
  id: string;
  name: string;
  url: string;
  icon?: string;
  supportsQuerystring?: boolean; // default: false
}

interface RunDestinationsConfig {
  corporate?: RunDestination[];
  showPublicPlatforms?: boolean; // default: true
}
```

### UX Behavior

**Smart button behavior:**
- 1 corporate platform + `showPublicPlatforms: false` → Direct click (no dropdown)
- Multiple platforms OR `showPublicPlatforms: true` → Show dropdown

**Direct click flow:**
1. User clicks Play button
2. Prompt copied to clipboard
3. Toast: "Prompt copied! Opening Microsoft 365 Copilot..."
4. New tab opens to M365 Copilot
5. User pastes and runs

**Variable handling:**
- If prompt has unfilled variables, show fill modal first
- After filling, proceed with copy + redirect

**Fallback:**
- If `runDestinations` not configured → current behavior (all public platforms)

### Button Appearance

- Same green Play button
- No dropdown arrow when single platform
- Tooltip: "Run in Microsoft 365 Copilot"

## Files to Modify

| File | Changes |
|------|---------|
| `prompts.config.ts` | Add `runDestinations` config |
| `src/lib/config.ts` | Add `RunDestination` types |
| `src/components/prompts/run-prompt-button.tsx` | Read config, implement smart behavior |

## Future Extensibility

```typescript
// Adding more platforms later
runDestinations: {
  corporate: [
    { id: "m365-copilot", name: "Microsoft 365 Copilot", url: "https://m365.cloud.microsoft/chat/" },
    { id: "azure-openai", name: "Azure OpenAI", url: "https://oai.azure.com/portal/chat" },
    { id: "internal-llm", name: "Volue AI Assistant", url: "https://ai.volue.com" },
  ],
  showPublicPlatforms: false,
}
```

## Out of Scope

- Custom icons per platform
- Per-department default platforms
- Platform-specific URL builders
- Database changes
