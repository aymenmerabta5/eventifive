import { createDraftEventRouter } from "./createDraft";
import { deleteEventRouter } from "./delete";
import { listEventsRouter } from "./list";
import { listEventsByTypeRouter } from "./listByType";
import { myEventsRouter } from "./myEvents";
import { getEventRouter } from "./get";
import {
  listInvitesRouter,
  inviteSpeakerRouter,
  inviteCommitteeRouter,
  inviteReviewerRouter,
  acceptSpeakerRouter,
  rejectSpeakerRouter,
  listMyInvitesRouter,
  acceptReviewerRouter,
  rejectReviewerRouter,
  removeSpeakerRouter,
  removeReviewerRouter,
  removeCommitteeRouter,
} from "./invites";
import { registerForEventRouter } from "./register";
import { listParticipantsRouter } from "./listParticipants";
import { getRegistrationStatusRouter } from "./getRegistrationStatus";

export const eventsRouter = {
  createDraft: createDraftEventRouter,
  delete: deleteEventRouter,
  list: listEventsRouter,
  listByType: listEventsByTypeRouter,
  myEvents: myEventsRouter,
  get: getEventRouter,
  listInvites: listInvitesRouter,
  inviteSpeaker: inviteSpeakerRouter,
  inviteCommittee: inviteCommitteeRouter,
  inviteReviewer: inviteReviewerRouter,
  acceptSpeaker: acceptSpeakerRouter,
  rejectSpeaker: rejectSpeakerRouter,
  acceptReviewer: acceptReviewerRouter,
  rejectReviewer: rejectReviewerRouter,
  removeSpeaker: removeSpeakerRouter,
  removeReviewer: removeReviewerRouter,
  removeCommittee: removeCommitteeRouter,
  listMyInvites: listMyInvitesRouter,
  register: registerForEventRouter,
  listParticipants: listParticipantsRouter,
  getRegistrationStatus: getRegistrationStatusRouter,
};

export {
  createDraftEventRouter,
  deleteEventRouter,
  listEventsRouter,
  listEventsByTypeRouter,
  myEventsRouter,
  getEventRouter,
  registerForEventRouter,
  listParticipantsRouter,
  getRegistrationStatusRouter,
};
