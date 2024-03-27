import { store } from "./store";

import notificationEvents from "./modules/notifications/events";
import wesEvents from "./modules/wes/events";

const handlerSets = [notificationEvents, wesEvents];

// Global message handler
export default async (message, navigate) => {
    console.debug("Handling event", message);

    const handlers = handlerSets
        .flatMap(Object.entries)
        .filter(([p, _]) => message.channel.match(new RegExp(p)) !== null)
        .map(([_, h]) => h);

    for (const handler of handlers) {
        await store.dispatch(handler(message.message, navigate));
    }
};
