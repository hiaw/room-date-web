// Re-export all room functions for backward compatibility
export {
  getRoom,
  getMyRooms,
  getActiveRooms,
  getUserRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "./rooms/index";

export type {
  RoomWithOwner,
  CreateRoomArgs,
  UpdateRoomArgs,
  LocationFilter,
} from "./rooms/types";
