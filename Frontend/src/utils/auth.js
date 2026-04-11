export const STORAGE_KEY = 'Users';

export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.user) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function buildAuthConfig(token, config = {}) {
  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
}
