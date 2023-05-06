import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { UserType, UserUpdateParams } from '@/types/user'
import type { ModelPopulate } from '@/types/mongoSchema'
import { setToken } from '@/utils/user'
import { getAllModels, getMyFavModels, getMyModels } from '@/api/model'
import { getTokenLogin } from '@/api/user'
import { SortOrder } from 'mongoose'
import { ChatModelNameEnum } from '@/constants/model'

type State = {
  userInfo: UserType | null
  initUserInfo: () => Promise<null>
  setUserInfo: (user: UserType, token?: string) => void
  updateUserInfo: (user: UserUpdateParams) => void
  clearUserInfo: () => void
  myModels: ModelPopulate[]
  myFavModels: ModelPopulate[]
  allModels: ModelPopulate[]
  getMyModels: (userId: string) => void
  getAllModels: (data: {
    hitCount?: SortOrder
    favCount?: SortOrder
    serviceModelName?: `${ChatModelNameEnum}`
  }) => void
  getMyFavModels: (userId: string) => void
  setMyModels: (data: ModelPopulate[]) => void
  clearMyModels: () => void
  clear: () => void
}

export const useUserStore = create<State>()(
  devtools(
    immer((set, get) => ({
      userInfo: null,
      async initUserInfo() {
        // if (!getToken()) {
        //   return null
        // }
        const res = await getTokenLogin()
        get().setUserInfo(res)
        return null
      },
      setUserInfo(user: UserType, token?: string) {
        set((state) => {
          state.userInfo = {
            ...user,
            balance: user.balance,
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
      allModels: [],
      myFavModels: [],
      getMyModels: (userId: string) =>
        getMyModels(userId).then((res) => {
          set((state) => {
            state.myModels = res
          })
          return res
        }),
      getAllModels: (data: {
        hitCount?: SortOrder
        favCount?: SortOrder
        serviceModelName?: `${ChatModelNameEnum}`
      }) =>
        getAllModels(data).then((res) => {
          set((state) => {
            state.allModels = res
          })
          return res
        }),
      getMyFavModels: (userId: string) =>
        getMyFavModels(userId).then((res) => {
          set((state) => {
            state.myFavModels = res
          })
          return res
        }),
      setMyModels(data: ModelPopulate[]) {
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
