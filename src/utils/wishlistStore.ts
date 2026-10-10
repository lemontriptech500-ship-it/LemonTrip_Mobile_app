import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: string;
  category?: 'Destinations' | 'Hotels' | 'Packages';
  location?: string;
  savedAt?: string;
}

const WISHLIST_STORAGE_KEY = 'lemontrip_wishlist';

let wishlist: WishlistItem[] = [];
let listeners: (() => void)[] = [];
let hasLoadedWishlist = false;

function notify() {
  listeners.forEach((listener) => listener());
}

async function saveWishlist() {
  try {
    await AsyncStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(wishlist),
    );
  } catch (error) {
    console.error('Failed to save wishlist:', error);
  }
}

async function loadWishlist() {
  try {
    const savedWishlist = await AsyncStorage.getItem(
      WISHLIST_STORAGE_KEY,
    );

    if (savedWishlist) {
      const parsedWishlist = JSON.parse(savedWishlist);

      if (Array.isArray(parsedWishlist)) {
        wishlist = parsedWishlist;
      }
    }
  } catch (error) {
    console.error('Failed to load wishlist:', error);
  } finally {
    hasLoadedWishlist = true;
    notify();
  }
}

export function toggleWishlist(item: WishlistItem) {
  const exists = wishlist.find((w) => w.id === item.id);

  if (exists) {
    wishlist = wishlist.filter((w) => w.id !== item.id);
  } else {
    wishlist = [
      {
        ...item,
        category: item.category ?? 'Destinations',
        savedAt: item.savedAt ?? new Date().toISOString(),
      },
      ...wishlist,
    ];
  }

  notify();

  void saveWishlist();
}

export function isInWishlist(id: string) {
  return wishlist.some((w) => w.id === id);
}

export function useWishlist() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});

    listeners.push(listener);

    if (!hasLoadedWishlist) {
      void loadWishlist();
    }

    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return wishlist;
}