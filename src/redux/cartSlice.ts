import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, MenuItem, SizeOption } from "../type";

// Define the shape of an item inside the cart

interface CartState {
  items: CartItem[];
  isCheckoutOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isCheckoutOpen: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        item: MenuItem;
        size: SizeOption | null;
        extrasNames: string[];
        quantity: number;
      }>
    ) => {
      const { item, size, extrasNames, quantity } = action.payload;

      // 1. Resolve Extras objects to get prices
      const resolvedExtras = item.extras.filter((e) =>
        extrasNames.includes(e.name)
      );

      // 2. Calculate Unit Price
      const sizePrice = size?.price || 0;
      const extrasPrice = resolvedExtras.reduce((sum, e) => sum + e.price, 0);
      const unitPrice = item.basePrice + sizePrice + extrasPrice;

      // 3. Generate a unique ID for this specific configuration
      // format: itemId-sizeId-sortedExtraNames
      const extrasIdString = extrasNames.slice().sort().join("-");
      const cartId = `${item._id}-${size?.id || "std"}-${extrasIdString}`;

      // 4. Check if this exact config exists
      const existingItem = state.items.find((i) => i.cartId === cartId);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      } else {
        state.items.push({
          cartId,
          itemId: item._id,
          _id: item._id,
          name: item.name,
          image: item.image,
          selectedSize: size,
          selectedExtras: resolvedExtras,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        });
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartId !== action.payload);
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ cartId: string; delta: number }>
    ) => {
      const item = state.items.find((i) => i.cartId === action.payload.cartId);
      if (item) {
        const newQuantity = item.quantity + action.payload.delta;
        if (newQuantity > 0) {
          item.quantity = newQuantity;
          item.totalPrice = item.quantity * item.unitPrice;
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    toggleCheckout: (state, action: PayloadAction<boolean>) => {
      state.isCheckoutOpen = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCheckout,
} = cartSlice.actions;

export default cartSlice.reducer;