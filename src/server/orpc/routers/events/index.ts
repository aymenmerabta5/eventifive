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
import { myRegistrationsRouter } from "./myRegistrations";
import { adminListEventsRouter } from "./adminList";
import { adminDeleteEventRouter } from "./adminDelete";

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
  myRegistrations: myRegistrationsRouter,
  adminList: adminListEventsRouter,
  adminDelete: adminDeleteEventRouter,
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
  adminListEventsRouter,
  adminDeleteEventRouter,
};
