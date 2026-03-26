"use client";

import { createContext, useContext, useReducer, useState, useEffect, useRef, ReactNode } from "react";
import { Product } from "@/lib/products";
import { supabaseBrowser } from "@/lib/supabase-browser";

export type CustomizationData = {
  fabricJson: string;
  previewDataUrl: string;
  summary: string;
  productId: string;
};

export type CartItem = Product & {
  quantity: number;
  customizationId?: string;
  customization?: CustomizationData;
};

type CartState = { items: CartItem[] };

type CartAction =
  | { type: "ADD_ITEM"; product: Product; customizationId?: string; customization?: CustomizationData }
  | { type: "REMOVE_ITEM"; id: string; customizationId?: string }
  | { type: "UPDATE_QUANTITY"; id: string; quantity: number; customizationId?: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_ITEMS"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      // Customized items always get their own cart slot
      if (action.customizationId) {
        return { items: [...state.items, { ...action.product, quantity: 1, customizationId: action.customizationId, customization: action.customization }] };
      }
      const existing = state.items.find((i) => i.id === action.product.id && !i.customizationId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.product.id && !i.customizationId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case "REMOVE_ITEM":
      if (action.customizationId) {
        return { items: state.items.filter((i) => i.customizationId !== action.customizationId) };
      }
      return { items: state.items.filter((i) => !(i.id === action.id && !i.customizationId)) };
    case "UPDATE_QUANTITY": {
      const match = action.customizationId
        ? (i: CartItem) => i.customizationId === action.customizationId
        : (i: CartItem) => i.id === action.id && !i.customizationId;
      if (action.quantity <= 0) {
        return { items: state.items.filter((i) => !match(i)) };
      }
      return { items: state.items.map((i) => match(i) ? { ...i, quantity: action.quantity } : i) };
    }
    case "CLEAR_CART":
      return { items: [] };
    case "LOAD_ITEMS":
      return { items: action.items };
    default:
      return state;
  }
}

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product) => void;
  addCustomizedItem: (product: Product, customization: CustomizationData) => void;
  removeItem: (id: string, customizationId?: string) => void;
  updateQuantity: (id: string, quantity: number, customizationId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  lastAdded: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [lastAdded, setLastAdded] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userId = useRef<string | null>(null);
  const initialized = useRef(false);

  // Load cart from Supabase when user logs in; clear when they log out
  useEffect(() => {
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (_event, session) => {
        const uid = session?.user?.id ?? null;
        const prevUid = userId.current;
        userId.current = uid;

        if (uid && uid !== prevUid) {
          // User just logged in — load their saved cart
          const { data } = await supabaseBrowser
            .from("carts")
            .select("items")
            .eq("user_id", uid)
            .single();

          if (data?.items && Array.isArray(data.items) && data.items.length > 0) {
            // Merge: saved items take precedence, local items fill in extras
            const saved: CartItem[] = data.items;
            const local = state.items;
            const merged = [...saved];
            for (const localItem of local) {
              if (!merged.find((s) => s.id === localItem.id)) {
                merged.push(localItem);
              }
            }
            dispatch({ type: "LOAD_ITEMS", items: merged });
          }
          initialized.current = true;
        } else if (!uid && prevUid) {
          // User logged out — clear cart
          dispatch({ type: "CLEAR_CART" });
          initialized.current = false;
        }
      }
    );

    // Check initial session
    supabaseBrowser.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      userId.current = uid;
      if (uid && !initialized.current) {
        const { data: cartData } = await supabaseBrowser
          .from("carts")
          .select("items")
          .eq("user_id", uid)
          .single();

        if (cartData?.items && Array.isArray(cartData.items) && cartData.items.length > 0) {
          dispatch({ type: "LOAD_ITEMS", items: cartData.items });
        }
        initialized.current = true;
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save to Supabase on every cart change
  useEffect(() => {
    if (!userId.current || !initialized.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      if (!userId.current) return;
      await supabaseBrowser.from("carts").upsert(
        { user_id: userId.current, items: state.items, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }, 800);
  }, [state.items]);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        addItem: (product) => {
          dispatch({ type: "ADD_ITEM", product });
          setLastAdded((n) => n + 1);
        },
        addCustomizedItem: (product, customization) => {
          const customizationId = crypto.randomUUID();
          dispatch({ type: "ADD_ITEM", product, customizationId, customization });
          setLastAdded((n) => n + 1);
        },
        removeItem: (id, customizationId) => dispatch({ type: "REMOVE_ITEM", id, customizationId }),
        updateQuantity: (id, quantity, customizationId) =>
          dispatch({ type: "UPDATE_QUANTITY", id, quantity, customizationId }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
        totalItems,
        totalPrice,
        lastAdded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
