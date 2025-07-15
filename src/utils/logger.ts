type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;

  private constructor() {
    // No functionality
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    // Enable console logging for debugging
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case "info":
        console.log(logMessage, data || "");
        break;
      case "warn":
        console.warn(logMessage, data || "");
        break;
      case "error":
        console.error(logMessage, data || "");
        break;
      case "debug":
        console.debug(logMessage, data || "");
        break;
    }
  }

  public info(message: string, data?: any): void {
    this.log("info", message, data);
  }

  public warn(message: string, data?: any): void {
    this.log("warn", message, data);
  }

  public error(message: string, data?: any): void {
    this.log("error", message, data);
  }

  public debug(message: string, data?: any): void {
    this.log("debug", message, data);
  }

  // No-op flush method for compatibility
  public async flush(): Promise<void> {
    // Do nothing
  }
}

export const logger = Logger.getInstance();
