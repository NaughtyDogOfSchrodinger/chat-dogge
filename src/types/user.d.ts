export enum UserNumberEnum {
  phone = 'phone',
  wx = 'wx',
}

export interface UserType {
  _id: string
  email: string
  openaiKey: string
  balance: number
  createTime: Date
}

export interface UserUpdateParams {
  balance?: number
  openaiKey: string
}

export interface UserBillType {
  id: string
  time: string
  type: 'chat' | 'splitData' | 'return' | 'image'
  textLen: number
  tokenLen: number
  userId: string
  chatId: string
  price: number
}
