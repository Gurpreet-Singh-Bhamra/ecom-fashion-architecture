/**
 * Optimistic Cart State Reducer
 * 
 * Provides sub-50ms UI updates for inventory actions before server validation finishes.
 * Handles automatic state rollbacks if server reservation fails or stock expires.
 * 
 * @module ECommerce/State Engine
 * @author Gurpreet Bhamra | TFS Digital
 */

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  size: string;
  priceInCents: number;
  quantity: number;
  reservedUntil: number; // Unix timestamp
}

export interface CartState {
  items: CartItem[];
  subtotalInCents: number;
  isPending: boolean;
  error: string | null;
}

export type CartAction =
  | { type: 'ADD_ITEM_OPTIMISTIC'; payload: CartItem }
  | { type: 'REMOVE_ITEM_OPTIMISTIC'; payload: { variantId: string } }
  | { type: 'SYNC_SERVER_SUCCESS'; payload: { items: CartItem[] } }
  | { type: 'ROLLBACK_TRANSACTION'; payload: { previousState: CartState; error: string } };

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM_OPTIMISTIC': {
      const existingIndex = state.items.findIndex(
        (item) => item.variantId === action.payload.variantId
      );

      let updatedItems: CartItem[];
      if (existingIndex > -1) {
        updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        updatedItems = [...state.items, action.payload];
      }

      const subtotal = updatedItems.reduce(
        (acc, item) => acc + item.priceInCents * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        subtotalInCents: subtotal,
        isPending: true,
        error: null,
      };
    }

    case 'REMOVE_ITEM_OPTIMISTIC': {
      const updatedItems = state.items.filter(
        (item) => item.variantId !== action.payload.variantId
      );
      const subtotal = updatedItems.reduce(
        (acc, item) => acc + item.priceInCents * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        subtotalInCents: subtotal,
        isPending: true,
      };
    }

    case 'SYNC_SERVER_SUCCESS': {
      const subtotal = action.payload.items.reduce(
        (acc, item) => acc + item.priceInCents * item.quantity,
        0
      );

      return {
        ...state,
        items: action.payload.items,
        subtotalInCents: subtotal,
        isPending: false,
        error: null,
      };
    }

    case 'ROLLBACK_TRANSACTION': {
      return {
        ...action.payload.previousState,
        isPending: false,
        error: action.payload.error,
      };
    }

    default:
      return state;
  }
}
