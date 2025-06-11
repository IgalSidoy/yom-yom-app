type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

// Add File System Access API types
declare global {
  interface Window {
    showSaveFilePicker(
      options?: SaveFilePickerOptions
    ): Promise<FileSystemFileHandle>;
  }
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

class Logger {
  private static instance: Logger;
  private logQueue: LogEntry[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_QUEUE_SIZE = 100;
  private logContent: string = "";

  private constructor() {
    // No automatic flush
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(entry: LogEntry): string {
    return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${
      entry.message
    }${entry.data ? ` ${JSON.stringify(entry.data, null, 2)}` : ""}\n`;
  }

  private async writeToFile(content: string): Promise<void> {
    try {
      // Append new content to existing logs
      this.logContent += content;

      // Create a blob with the log content
      const blob = new Blob([this.logContent], { type: "text/plain" });

      // Create a download link
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `logs-${new Date().toISOString()}.txt`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error writing to log file:", error);
    }
  }

  private async flushLogs(): Promise<void> {
    if (this.isProcessing || this.logQueue.length === 0) return;

    this.isProcessing = true;
    try {
      const logs = this.logQueue.map(this.formatLogEntry).join("");
      await this.writeToFile(logs);
      this.logQueue = [];
    } catch (error) {
      console.error("Error flushing logs:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    // Add to queue
    this.logQueue.push(entry);

    // Also log to console
    console[level](message, data || "");

    // If queue is too large, flush immediately
    if (this.logQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flushLogs();
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

  // Force flush logs
  public async flush(): Promise<void> {
    await this.flushLogs();
  }
}

export const logger = Logger.getInstance();
