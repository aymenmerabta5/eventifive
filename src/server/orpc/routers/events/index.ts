import { createEventRouter } from "./create";
import { createDraftEventRouter } from "./createDraft";
import { updateEventRouter } from "./update";
import { deleteEventRouter } from "./delete";
import { listEventsRouter } from "./list";
import { listEventsByTypeRouter } from "./listByType";
import { myEventsRouter } from "./myEvents";
import { getEventRouter } from "./get";
import { invitesRouter } from "./invites";

export const eventsRouter = {
	create: createEventRouter,
	createDraft: createDraftEventRouter,
	update: updateEventRouter,
	delete: deleteEventRouter,
	list: listEventsRouter,
	listByType: listEventsByTypeRouter,
	myEvents: myEventsRouter,
	get: getEventRouter,
	invites: invitesRouter,
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
};
