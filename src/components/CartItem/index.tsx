import {
  CartEl,
  CartItemProductSubtotal,
  CartRow,
  InputField,
  ProductLink,
  QuantityForm,
  RemoveFromCartBtn,
  RemoveIcon,
  RemovingLoader,
  Thumbnail,
  UpdateCartItemBtn,
  UpdateText,
} from './CartItemElements'
import React, { useContext, useRef, useState } from 'react'
import { cartUpdater, initCart } from '../../utils/functions'

import { CartContext } from '../../context/cart'
import { CartItem } from '../../types'
import Link from 'next/link'
import { Loader } from '../../styles/Global/utils'

interface CartItemProps {
  item: CartItem
}

const SingleCartItem: React.FC<CartItemProps> = ({ item }) => {
  const [cart, setCart, isUpdating, setIsUpdating] = useContext(CartContext)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const qty = useRef<HTMLInputElement | null>(null)

  const removeItem = async (item: CartItem) => {
    setIsRemoving((prev: boolean) => !prev)
    setIsUpdating((prev: boolean) => !prev)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WP_API_URL}/wp-json/cocart/v1/item?cart_key=${cart.key}`,
        {
          method: 'DELETE',
          body: JSON.stringify({
            cart_item_key: item.key,
            return_cart: true,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await res.json()

      setIsUpdating((prev: boolean) => !prev)
      setIsRemoving((prev: boolean) => !prev)
      setCart(() => cartUpdater(cart, data))
    } catch (error) {
      const newCart = await initCart()
      setCart(newCart)
      setIsUpdating((prev: boolean) => !prev)
      setIsRemoving((prev: boolean) => !prev)
    }
  }

  const updateItem = async (e: React.SyntheticEvent, item: CartItem, quantity: any) => {
    e.preventDefault()
    setIsUpdating((prev: boolean) => !prev)
    setIsAnimating((prev: boolean) => !prev)
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WP_API_URL}/wp-json/cocart/v1/item?cart_key=${cart.key}`,
        {
          method: 'POST',
          body: JSON.stringify({
            cart_item_key: item.key,
            quantity: quantity,
            return_cart: true,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      const data = await res.json()

      setIsUpdating((prev: boolean) => !prev)
      setIsAnimating((prev: boolean) => !prev)
      setCart(() => cartUpdater(cart, data))
    } catch (error) {
      console.log(error)
      const newCart = await initCart()
      setCart(newCart)
      setIsAnimating((prev: boolean) => !prev)
      setIsUpdating((prev: boolean) => !prev)
    }
  }
  return (
    <>
      <CartRow>
        <CartEl>
          <RemoveFromCartBtn disabled={isUpdating} onClick={() => removeItem(item)}>
            {isRemoving ? <RemovingLoader /> : <RemoveIcon />}{' '}
          </RemoveFromCartBtn>
        </CartEl>
        <CartEl>
          <Thumbnail src={item.image} />
        </CartEl>
        <CartEl>
          <Link href={`/products/${item.slug}`}>
            <ProductLink>{item.product_name}</ProductLink>
          </Link>
        </CartEl>
        <CartEl>{item.product_price}</CartEl>
        <CartEl>
          <QuantityForm>
            <InputField
              type="number"
              //onChange={(e) => setQty(parseInt(e.target.value))}
              defaultValue={item.quantity}
              min="1"
              ref={qty}
            ></InputField>
            <UpdateCartItemBtn
              disabled={isUpdating}
              onClick={(e) => {
                updateItem(e, item, parseInt(qty.current!.value))
              }}
            >
              {isAnimating ? <Loader /> : <UpdateText>Update</UpdateText>}
            </UpdateCartItemBtn>
          </QuantityForm>
        </CartEl>
        <CartEl>
          <CartItemProductSubtotal>${item.line_total?.toFixed(2)}</CartItemProductSubtotal>
        </CartEl>
      </CartRow>
    </>
  )
}

export default SingleCartItem
