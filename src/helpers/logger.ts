type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

let currentLevel: LogLevel = "warn";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

export const logger = {
  /** Set the minimum log level. Default is "warn". */
  setLevel(level: LogLevel) {
    currentLevel = level;
  },

  getLevel(): LogLevel {
    return currentLevel;
  },

  debug(...args: unknown[]) {
    if (shouldLog("debug")) console.debug("[DST]", ...args);
  },

  info(...args: unknown[]) {
    if (shouldLog("info")) console.info("[DST]", ...args);
  },

  warn(...args: unknown[]) {
    if (shouldLog("warn")) console.warn("[DST]", ...args);
  },

  error(...args: unknown[]) {
    if (shouldLog("error")) console.error("[DST]", ...args);
  },
};
