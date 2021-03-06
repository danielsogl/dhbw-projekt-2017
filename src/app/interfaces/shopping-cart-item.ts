import { SHOPPINGCARTITEMTYPE } from '../enums/shopping-cart-item-type';
import { ImageInfo } from './image-info';

/**
 * Shopping cart item interface
 * @author Daniel Sogl
 */
export interface ShoppingCartItem {
  /** Event name */
  eventname: string;
  /** Photographer UID */
  photographer: string;
  /** photoname */
  name: string;
  /** Image info */
  info: ImageInfo;
  /** */
  itemType: SHOPPINGCARTITEMTYPE;
  /** Amount */
  amount?: number;
  /** Total price */
  totalPrice?: number;
  /** Preview */
  preview: string;
  /** THumbnail */
  thumbnail: string;
  /** Article price */
  price: number;
  /** format */
  format?: string;
}
