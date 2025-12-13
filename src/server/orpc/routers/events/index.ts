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
	acceptSpeakerRouter,
	listMyInvitesRouter,
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
	acceptSpeaker: acceptSpeakerRouter,
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
