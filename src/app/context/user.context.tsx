"use client"
import React, { createContext, useCallback, useSyncExternalStore } from "react";
import { Usuario } from "../model/usuario";

type UserContextValue = {
  userData?: Usuario | null;
  setUserData: (value?: Usuario | { usuario?: Usuario } | null) => void;
};

const USER_STORAGE_KEY = "barbieri_user";
const USER_STORAGE_EVENT = "barbieri-user-change";
let cachedUserRaw: string | null | undefined;
let cachedUser: Usuario | undefined;

function normalizeUser(value?: Usuario | { usuario?: Usuario } | null) {
  if (!value) return value;
  if ("usuario" in value && value.usuario) return value.usuario;
  return value as Usuario;
}

function getStoredUser() {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored === cachedUserRaw) return cachedUser;

    cachedUserRaw = stored;
    cachedUser = stored ? (JSON.parse(stored) as Usuario) : undefined;

    return cachedUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    cachedUserRaw = null;
    cachedUser = undefined;
    return undefined;
  }
}

function subscribeUserStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(USER_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(USER_STORAGE_EVENT, callback);
  };
}

function getServerUserSnapshot() {
  return undefined;
}

export const UserContext = createContext<UserContextValue>({
  setUserData: () => {},
});


export const UserContextProvider = ({ children }: { children: React.ReactNode}):React.ReactNode => {
  const userData = useSyncExternalStore(subscribeUserStorage, getStoredUser, getServerUserSnapshot);

  const setUserData = useCallback((value?: Usuario | { usuario?: Usuario } | null) => {
    const nextUser = normalizeUser(value);

    if (typeof window === "undefined") return;

    if (nextUser) {
      const nextUserRaw = JSON.stringify(nextUser);
      cachedUserRaw = nextUserRaw;
      cachedUser = nextUser;
      localStorage.setItem(USER_STORAGE_KEY, nextUserRaw);
      window.dispatchEvent(new Event(USER_STORAGE_EVENT));
      return;
    }

    cachedUserRaw = null;
    cachedUser = undefined;
    localStorage.removeItem(USER_STORAGE_KEY);
    window.dispatchEvent(new Event(USER_STORAGE_EVENT));
  }, []);

  return (
    <UserContext.Provider value={{userData,setUserData}}>
      {children}
    </UserContext.Provider>
  );
}
