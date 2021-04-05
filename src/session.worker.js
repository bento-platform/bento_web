// We need to constantly ping the server to make sure the session cookie is as
// up to date as possible. Unfortunately, setInterval slows down when a tab is
// not active, so we need to move this pinging to a web worker to maintain the
// session when the tab doesn't have focus.

const BASE_PATH = process.env.CHORD_URL ? (new URL(process.env.CHORD_URL)).pathname : "/";
const USER_URL = `${BASE_PATH}api/auth/user`;

setInterval(() => fetch(USER_URL).then(response => {
    response.json().then(data => {
        if (response.ok) {
            self.postMessage({user: data});
        } else {
            self.postMessage({user: null, error: data});
        }
    }).catch(err => {
        self.postMessage({user: null, error: err});
    });
}), 30000);
