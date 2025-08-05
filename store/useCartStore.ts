import { create } from 'zustand';

type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  storeId: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

const LOCAL_STORAGE_KEY = 'cart_items';

export const useCartStore = create<CartStore>((set, get) => {
  // Load from localStorage when initialized
  const storedItems = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]')
    : [];

  const saveToLocalStorage = (items: CartItem[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  };

  return {
    items: storedItems,

    addItem: (item: CartItem) => {
      const { items } = get();
      const existingItem = items.find(
        (i) => i.id === item.id && i.storeId === item.storeId
      );

      let updatedItems;
      if (existingItem) {
        updatedItems = items.map((i) =>
          i.id === item.id && i.storeId === item.storeId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updatedItems = [...items, item];
      }

      saveToLocalStorage(updatedItems);
      set({ items: updatedItems });
    },

    removeItem: (id: string) => {
      const updatedItems = get().items.filter((item) => item.id !== id);
      saveToLocalStorage(updatedItems);
      set({ items: updatedItems });
    },

    clearCart: () => {
      saveToLocalStorage([]);
      set({ items: [] });
    },

    getTotalItems: () => {
      const { items } = get();
      return items.reduce((total, item) => total + item.quantity, 0);
    },

    getTotalPrice: () => {
      const { items } = get();
      return items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
  };
});
