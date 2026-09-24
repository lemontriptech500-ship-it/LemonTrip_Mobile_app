import { useEffect, useState } from 'react';

export interface CartItem {
  id: string;
  serviceName: string;
  itemName: string;
  price: string;
}

let cart: CartItem[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((listener) => listener());
}

export function addToCart(item: CartItem) {
  console.log('addToCart called with:', item);
  cart = [item, ...cart];
  console.log('Cart now has', cart.length, 'items:', cart);
  notify();
}

export function removeFromCart(id: string) {
  cart = cart.filter((c) => c.id !== id);
  notify();
}

export function clearCart() {
  cart = [];
  notify();
}

export function isInCart(id: string) {
  return cart.some((c) => c.id === id);
}

export function getCart() {
  return cart;
}

export function useCart() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return cart;
}