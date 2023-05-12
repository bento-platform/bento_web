// We need to constantly ping the server to make sure the token set is as
// up-to-date as possible. Unfortunately, setInterval slows down when a tab is
// not active, so we need to move this pinging to a web worker to maintain the
// session when the tab doesn't have focus.

setInterval(() => {
    self.postMessage(true);  // Send a window-inactive-resilient ping
}, 120000);  // every 2 minutes
