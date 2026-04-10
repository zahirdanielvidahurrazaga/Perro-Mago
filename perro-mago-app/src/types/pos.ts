import type { ProductModifier } from './database';

/** Cart item with selected modifiers */
export interface CartItem {
  /** Unique cart item ID (not the product ID, since same product can appear with different mods) */
  cartItemId: string;
  productId: string;
  productName: string;
  categoryName: string;
  basePrice: number;
  quantity: number;
  modifiers: SelectedModifier[];
  notes: string;
}

/** A modifier selection in the cart */
export interface SelectedModifier {
  modifierId: string;
  name: string;
  priceDelta: number;
  groupName: string;
}

/** Get effective unit price including modifier deltas */
export function getCartItemUnitPrice(item: CartItem): number {
  const modsDelta = item.modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
  return item.basePrice + modsDelta;
}

/** Get total modifier price delta for a cart item */
export function getModifiersDelta(modifiers: SelectedModifier[]): number {
  return modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
}

/** Convert ProductModifier to SelectedModifier */
export function toSelectedModifier(mod: ProductModifier, groupName: string): SelectedModifier {
  return {
    modifierId: mod.id,
    name: mod.name,
    priceDelta: mod.price_delta,
    groupName,
  };
}
