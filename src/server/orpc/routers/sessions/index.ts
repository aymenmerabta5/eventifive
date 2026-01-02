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
import { getChairOptionsRouter } from "./getChairOptions";

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
  getChairOptions: getChairOptionsRouter,
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
  getChairOptionsRouter,
};
