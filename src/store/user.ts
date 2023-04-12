import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { UserType, UserUpdateParams } from '@/types/user'
import type { ModelSchema } from '@/types/mongoSchema'
import { setToken } from '@/utils/user'
import { getMyModels } from '@/api/model'
import { formatPrice } from '@/utils/user'
import { getTokenLogin } from '@/api/user'

type State = {
  userInfo: UserType | null
  initUserInfo: () => Promise<null>
  setUserInfo: (user: UserType, token?: string) => void
  updateUserInfo: (user: UserUpdateParams) => void
  clearUserInfo: () => void
  myModels: ModelSchema[]
  getMyModels: () => void
  setMyModels: (data: ModelSchema[]) => void
  clearMyModels: () => void
  clear: () => void
}

export const useUserStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: null,
      async initUserInfo() {
        const res = await getTokenLogin()
        get().setUserInfo(res)
        return null
      },
      setUserInfo(user: UserType, token?: string) {
        set((state) => {
          state.userInfo = {
            ...user,
            balance: formatPrice(user.balance),
          }
        })
        token && setToken(token)
      },
      updateUserInfo(user: UserUpdateParams) {
        set((state) => {
          if (!state.userInfo) return
          state.userInfo = {
            ...state.userInfo,
            ...user,
          }
        })
      },
      clearUserInfo() {
        set((state) => {
          if (!state.userInfo) return
          state.userInfo = null
        })
      },
      myModels: [],
      getMyModels: () =>
        getMyModels().then((res) => {
          set((state) => {
            state.myModels = res
          })
          return res
        }),
      setMyModels(data: ModelSchema[]) {
        set((state) => {
          state.myModels = data
        })
        return null
      },
      clearMyModels() {
        set((state) => {
          state.myModels = []
        })
      },
      clear() {
        this.clearUserInfo()
        this.clearMyModels()
      },
    }))
  )
)