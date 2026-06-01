let _api = null;

export const setMessageApi = (api) => {
  _api = api;
};

// Proxy to the App.useApp() message instance set at app startup.
// Falls back to a no-op so action files don't crash before the App mounts.
const messageApi = {
  success: (...args) => _api?.success(...args),
  error: (...args) => _api?.error(...args),
  warning: (...args) => _api?.warning(...args),
  info: (...args) => _api?.info(...args),
  loading: (...args) => _api?.loading(...args),
};

export default messageApi;
