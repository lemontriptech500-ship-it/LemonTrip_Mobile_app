import { useState, useEffect } from 'react';

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: string;
}

let wishlist: WishlistItem[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function toggleWishlist(item: WishlistItem) {
  const exists = wishlist.find((w) => w.id === item.id);
  if (exists) {
    wishlist = wishlist.filter((w) => w.id !== item.id);
  } else {
    wishlist = [item, ...wishlist];
  }
  notify();
}

export function isInWishlist(id: string) {
  return wishlist.some((w) => w.id === id);
}

export function useWishlist() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return wishlist;
}