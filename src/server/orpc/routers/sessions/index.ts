import {
  createRoomRouter,
  updateRoomRouter,
  deleteRoomRouter,
  listRoomsRouter,
} from "./rooms";
import {
  createSessionRouter,
  updateSessionRouter,
  deleteSessionRouter,
  listSessionsRouter,
  getSessionRouter,
} from "./sessions";
import { mySessionsRouter } from "./mySessions";

export const sessionsRouter = {
  // Room management
  createRoom: createRoomRouter,
  updateRoom: updateRoomRouter,
  deleteRoom: deleteRoomRouter,
  listRooms: listRoomsRouter,

  // Session management
  createSession: createSessionRouter,
  updateSession: updateSessionRouter,
  deleteSession: deleteSessionRouter,
  listSessions: listSessionsRouter,
  getSession: getSessionRouter,
  mySessions: mySessionsRouter,
};

export {
  createRoomRouter,
  updateRoomRouter,
  deleteRoomRouter,
  listRoomsRouter,
  createSessionRouter,
  updateSessionRouter,
  deleteSessionRouter,
  listSessionsRouter,
  getSessionRouter,
  mySessionsRouter,
};
