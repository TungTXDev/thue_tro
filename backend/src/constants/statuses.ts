export const USER_STATUS = {
  ACTIVE: "active",
  BLOCKED: "blocked",
} as const;

export const ROOM_STATUS = {
  AVAILABLE: "available",
  HIDDEN: "hidden",
  DELETED: "deleted",
} as const;

export const ORDER_STATUS = {
  SUCCESS: "success",
  PENDING: "pending",
  CANCELLED: "cancelled",
} as const;
