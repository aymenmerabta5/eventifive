import { createEventRouter } from "./create";
import { updateEventRouter } from "./update";
import { deleteEventRouter } from "./delete";
import { listEventsRouter } from "./list";
import { listEventsByTypeRouter } from "./listByType";
import { myEventsRouter } from "./myEvents";
import { getEventRouter } from "./get";

export const eventsRouter = {
	create: createEventRouter,
	update: updateEventRouter,
	delete: deleteEventRouter,
	list: listEventsRouter,
	listByType: listEventsByTypeRouter,
	myEvents: myEventsRouter,
	get: getEventRouter,
};

// Re-export individual routers for backwards compatibility
export {
	createEventRouter,
	updateEventRouter,
	deleteEventRouter,
	listEventsRouter,
	listEventsByTypeRouter,
	myEventsRouter,
	getEventRouter,
};
