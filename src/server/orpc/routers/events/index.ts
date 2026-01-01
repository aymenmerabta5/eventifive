import { createDraftEventRouter } from "./createDraft";
import { deleteEventRouter } from "./delete";
import { listEventsRouter } from "./list";
import { listEventsByTypeRouter } from "./listByType";
import { myEventsRouter } from "./myEvents";
import { getEventRouter } from "./get";
import { publishEventRouter } from "./publish";
import { cancelEventRouter } from "./cancel";
import { archiveEventRouter } from "./archive";
import { unpublishEventRouter } from "./unpublish";
import {
  listInvitesRouter,
  inviteSpeakerRouter,
  inviteCommunicatorRouter,
  inviteReviewerRouter,
  acceptSpeakerRouter,
  rejectSpeakerRouter,
  listMyInvitesRouter,
  acceptReviewerRouter,
  rejectReviewerRouter,
  removeSpeakerRouter,
  removeReviewerRouter,
  removeCommunicatorRouter,
} from "./invites";
import { registerForEventRouter } from "./register";
import { listParticipantsRouter } from "./listParticipants";
import { getRegistrationStatusRouter } from "./getRegistrationStatus";
import { myRegistrationsRouter } from "./myRegistrations";

export const eventsRouter = {
  createDraft: createDraftEventRouter,
  delete: deleteEventRouter,
  list: listEventsRouter,
  listByType: listEventsByTypeRouter,
  myEvents: myEventsRouter,
  get: getEventRouter,
  publish: publishEventRouter,
  cancel: cancelEventRouter,
  archive: archiveEventRouter,
  unpublish: unpublishEventRouter,
  listInvites: listInvitesRouter,
  inviteSpeaker: inviteSpeakerRouter,
  inviteCommunicator: inviteCommunicatorRouter,
  inviteReviewer: inviteReviewerRouter,
  acceptSpeaker: acceptSpeakerRouter,
  rejectSpeaker: rejectSpeakerRouter,
  acceptReviewer: acceptReviewerRouter,
  rejectReviewer: rejectReviewerRouter,
  removeSpeaker: removeSpeakerRouter,
  removeReviewer: removeReviewerRouter,
  removeCommunicator: removeCommunicatorRouter,
  listMyInvites: listMyInvitesRouter,
  register: registerForEventRouter,
  listParticipants: listParticipantsRouter,
  getRegistrationStatus: getRegistrationStatusRouter,
  myRegistrations: myRegistrationsRouter,
};

export {
  createDraftEventRouter,
  deleteEventRouter,
  listEventsRouter,
  listEventsByTypeRouter,
  myEventsRouter,
  getEventRouter,
  publishEventRouter,
  cancelEventRouter,
  archiveEventRouter,
  unpublishEventRouter,
  registerForEventRouter,
  listParticipantsRouter,
  getRegistrationStatusRouter,
  myRegistrationsRouter,
};
