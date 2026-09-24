import { useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
}

let currentUser: User | null = null;
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function login(user: User) {
  currentUser = user;
  notify();
}

export function logout() {
  currentUser = null;
  notify();
}

export function getUser() {
  return currentUser;
}

export function useAuth() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return currentUser;
}