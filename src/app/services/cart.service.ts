import { Injectable } from '@angular/core';
import { CartItem } from "../common/cart-item";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new Subject<number>();
  totalQuantity: Subject<number> = new Subject<number>();

  constructor() { }

  addToCart(cartItem: CartItem) {
    let existingCartItem: CartItem | undefined;

    if (this.cartItems.length > 0) {
      existingCartItem = this.cartItems.find(item => item.id === cartItem.id)
    }

    if (existingCartItem) {
      existingCartItem.quantity++
    } else {
      this.cartItems.push(cartItem);
    }

    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    this.cartItems.forEach(cartItem => {
      totalPriceValue += cartItem.quantity * cartItem.unitPrice;
      totalQuantityValue += cartItem.quantity;
    })

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);
  }
}
