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
    // No-op: do nothing
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
