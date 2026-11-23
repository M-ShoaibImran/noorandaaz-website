"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { PublicConfig } from "@/lib/public-config";
import type { CartItem } from "@/lib/cart-types";

const ConfigContext = createContext<PublicConfig | null>(null);
const CART_KEY = "noorandaaz-cart";

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  notify: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useConfig() {
  const value = useContext(ConfigContext);
  if (!value) throw new Error("Store settings are missing.");
  return value;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Cart is missing.");
  return value;
}

export function Providers({ config, children }: { config: PublicConfig; children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
      }
    } catch {
      /* ignore a broken saved bag */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(id);
  }, [notice]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      items,
      ready,
      count,
      subtotal,
      notify: setNotice,
      addItem: (item) => {
        setItems((current) => {
          if (item.kind === "ready") {
            const index = current.findIndex(
              (entry) => entry.kind === "ready" && entry.productId === item.productId && entry.size === item.size,
            );
            if (index >= 0) {
              const next = [...current];
              next[index] = { ...next[index], quantity: Math.min(5, next[index].quantity + item.quantity) };
              return next;
            }
          }
          return [...current, item];
        });
        setNotice("Added to bag");
      },
      removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
      setQuantity: (id, quantity) =>
        setItems((current) =>
          current.map((item) => (item.id === id ? { ...item, quantity: Math.min(5, Math.max(1, quantity)) } : item)),
        ),
      clear: () => {
        setItems([]);
        localStorage.removeItem(CART_KEY);
      },
    };
  }, [items, ready]);

  return (
    <ConfigContext.Provider value={config}>
      <CartContext.Provider value={value}>
        {children}
        {notice ? (
          <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 bg-neutral-950 px-4 py-3 text-sm text-white lg:bottom-6">
            <span>{notice}</span>
            <Link href="/cart" className="underline underline-offset-4">
              View bag
            </Link>
          </div>
        ) : null}
      </CartContext.Provider>
    </ConfigContext.Provider>
  );
}
