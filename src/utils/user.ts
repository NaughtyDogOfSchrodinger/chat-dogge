import { PRICE_SCALE } from '@/constants/common'
const tokenKey = 'chatDogge-token'

export const setToken = (val: string) => {
  localStorage.setItem(tokenKey, val)
}
export const getToken = () => {
  return localStorage.getItem(tokenKey)
}
export const clearToken = () => {
  localStorage.removeItem(tokenKey)
}

/**
 * 把数据库读取到的price，转化成元
 */
export const formatPrice = (val: number, multiple = 1) => {
  return Number(((val / PRICE_SCALE) * multiple).toFixed(10))
}
