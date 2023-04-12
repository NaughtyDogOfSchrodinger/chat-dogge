export enum EmailTypeEnum {
  register = 'register',
  findPassword = 'findPassword',
}

export const PRICE_SCALE = 100000

export const EMAIL_REG =
  /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/
