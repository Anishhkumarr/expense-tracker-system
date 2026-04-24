const AUTH_STORAGE_KEY = "expense-tracker-auth";
const DEFAULT_USER_ID = Number(process.env.REACT_APP_USER_ID || 1);

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSessionFromStorage() {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function getFirstDefinedValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function getNestedObject(...candidates) {
  return candidates.find(
    (candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate)
  );
}

function normalizeId(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function normalizeAuthSession(data) {
  const payload = getNestedObject(data?.data, data) || {};
  const nestedUser =
    getNestedObject(payload.user, payload.account, payload.profile) || {};
  const userId = getFirstDefinedValue(
    nestedUser.id,
    nestedUser.userId,
    nestedUser.userID,
    nestedUser.user_id,
    payload.userId,
    payload.userID,
    payload.user_id,
    payload.id
  );
  const name = getFirstDefinedValue(
    nestedUser.name,
    nestedUser.username,
    payload.name,
    payload.username,
    payload.fullName,
    payload.full_name,
    ""
  );
  const email = getFirstDefinedValue(
    nestedUser.email,
    payload.email,
    payload.mail,
    ""
  );
  const mobile = getFirstDefinedValue(
    nestedUser.mobile,
    nestedUser.phone,
    nestedUser.phoneNumber,
    nestedUser.phone_number,
    payload.mobile,
    payload.phone,
    payload.phoneNumber,
    payload.phone_number,
    ""
  );

  return {
    token: String(
      getFirstDefinedValue(
        payload.token,
        payload.accessToken,
        payload.jwt,
        payload.authToken,
        ""
      )
    ),
    userId: normalizeId(userId),
    name: String(name),
    email: String(email),
    mobile: String(mobile),
  };
}

export function getStoredAuthSession() {
  return readSessionFromStorage();
}

export function storeAuthSession(data) {
  const session = normalizeAuthSession(data);

  if (canUseStorage()) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

export function clearStoredAuthSession() {
  if (canUseStorage()) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

export function hasActiveSession(session) {
  return Boolean(
    session &&
      (session.userId || session.token || session.email || session.name)
  );
}

export function getCurrentUserId() {
  const session = getStoredAuthSession();
  return normalizeId(session?.userId) || DEFAULT_USER_ID;
}

export { AUTH_STORAGE_KEY, DEFAULT_USER_ID };
