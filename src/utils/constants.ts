export const MAX_TOKENS = 1024
export const RATE_LIMIT_COUNT = 10
export const FREE_TOKEN_COUNT = 10000

export const PURCHASE_URL = process.env.NEXT_PUBLIC_PURCHASE_URL

export const PROMPT_SECRET = process.env.PROMPT_SECRET

export const FADE_IN_ANIMATION_SETTINGS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
}

export const FADE_DOWN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } },
}

export const FADE_UP_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' } },
}
