// We need to constantly ping the server to make sure the session cookie is as
// up-to-date as possible. Unfortunately, setInterval slows down when a tab is
// not active, so we need to move this pinging to a web worker to maintain the
// session when the tab doesn't have focus.

import {BENTO_URL} from "./config";

const BASE_PATH = BENTO_URL ? (new URL(BENTO_URL)).pathname : "/";
const USER_URL = `${BASE_PATH}api/auth/user`;

const makeErr = error => ({user: null, error});

setInterval(() => fetch(USER_URL).then(response => {
    response.json().then(data => {
        self.postMessage(response.ok ? {user: data} : makeErr(data));
    }).catch(err => {
        self.postMessage(makeErr(err));
    });
}), 30000);
