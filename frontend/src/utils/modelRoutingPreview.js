// Analyses a prompt and suggests the most appropriate model mode.
// Returns { mode, reason } where mode is one of 'auto'|'fast'|'analyst'|'report'.

const REPORT_PATTERNS = [
  /\b(write|draft|generate|prepare|create)\b.{0,40}\b(report|summary|letter|memo|brief|analysis|proposal)\b/i,
  /\b(long|detailed|comprehensive|full|complete)\b.{0,20}\b(report|summary|analysis|review)\b/i,
  /\b(annual|quarterly|monthly|weekly)\b.{0,20}\b(report|review|summary)\b/i,
  /\bwrite me\b/i,
];

const ANALYST_PATTERNS = [
  /\b(compare|contrast|analyse|analyze|evaluate|assess|explain|why|how does|what caused|implications|impact)\b/i,
  /\b(trend|forecast|projection|risk|sensitivity|correlation)\b/i,
  /\b(cross.{0,10}document|multiple.{0,10}(doc|file|report)|across.{0,20}document)\b/i,
  /\b(complex|deep dive|in-depth|thorough|comprehensive)\b/i,
  /\b(discrepanc|inconsistenc|conflicting)\b/i,
];

const FAST_PATTERNS = [
  /\b(what is|what are|who is|when|where|list|show|find|summarize|give me|tell me)\b/i,
  /\b(simple|quick|brief|short)\b/i,
  /\?$/,
];

export function suggestModelMode(prompt) {
  if (!prompt || prompt.trim().length < 5) return { mode: 'auto', reason: null };

  const trimmed = prompt.trim();

  for (const pattern of REPORT_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { mode: 'report', reason: 'Long-form drafting detected — Report mode recommended' };
    }
  }

  for (const pattern of ANALYST_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { mode: 'analyst', reason: 'Complex reasoning detected — Analyst mode recommended' };
    }
  }

  for (const pattern of FAST_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { mode: 'fast', reason: 'Simple query detected — Fast mode recommended' };
    }
  }

  // Default for medium-length queries
  if (trimmed.split(/\s+/).length > 20) {
    return { mode: 'analyst', reason: 'Detailed query — Analyst mode may be more accurate' };
  }

  return { mode: 'fast', reason: null };
}

// Returns true if the suggested mode differs from the current selection
export function hasRoutingHint(prompt, currentMode) {
  if (currentMode !== 'auto') return false;
  const { mode } = suggestModelMode(prompt);
  return mode !== 'auto' && mode !== 'fast';
}
