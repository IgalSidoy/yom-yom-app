/**
 * Shared enums for the Yom-Yom application
 *
 * This file contains enums that are used across multiple components and services.
 * For attendance-specific enums, see ../types/attendance.ts
 */

// Sleep status enum - used for daily report sleep data
export enum SleepStatus {
  Awake = "Awake",
  Sleeping = "Sleeping",
}

// Entity status enum - used for sleep data lifecycle
export enum EntityStatus {
  Created = "Created",
  Updated = "Updated",
  Deleted = "Deleted",
  Closed = "Closed",
}

// Post status enum - used for post lifecycle management
export enum PostStatus {
  Active = "active",
  Completed = "completed",
  Draft = "draft",
}
