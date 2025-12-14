import { createEventRouter } from "./create";
import { createDraftEventRouter } from "./createDraft";
import { updateEventRouter } from "./update";
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

export const eventsRouter = {
	create: createEventRouter,
	createDraft: createDraftEventRouter,
	update: updateEventRouter,
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
};

// Re-export individual routers for backwards compatibility
export {
	createEventRouter,
	createDraftEventRouter,
	updateEventRouter,
	deleteEventRouter,
	listEventsRouter,
	listEventsByTypeRouter,
	myEventsRouter,
	getEventRouter,
	registerForEventRouter,
};
