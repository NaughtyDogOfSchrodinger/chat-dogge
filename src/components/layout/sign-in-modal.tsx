import Modal from '@/components/share/modal'
import React, {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from 'react'
import { useRouter } from 'next/router'
import { PageTypeEnum } from '@/constants/user'
import { useUserStore } from '@/store/user'
import { ResLogin } from '@/api/response/user'
import LoginForm from '@/components/layout/login/LoginForm'
import RegisterForm from '@/components/layout/login/RegisterForm'
import ForgetPasswordForm from '@/components/layout/login/ForgetPasswordForm'
import { defaultFilterArgs } from '@/pages'

const SignInModal = ({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean
  setShowSignInModal: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()
  const { getAllModels } = useUserStore()
  const [pageType, setPageType] = useState<`${PageTypeEnum}`>(
    PageTypeEnum.login
  )
  const { setUserInfo } = useUserStore()
  const loginSuccess = useCallback(
    (res: ResLogin) => {
      setUserInfo(res.user, res.token)
      getAllModels(defaultFilterArgs)
      setShowSignInModal(false)
      router.push('/')
    },
    [getAllModels, router, setShowSignInModal, setUserInfo]
  )

  function DynamicComponent({ type }: { type: `${PageTypeEnum}` }) {
    const TypeMap = {
      [PageTypeEnum.login]: LoginForm,
      [PageTypeEnum.register]: RegisterForm,
      [PageTypeEnum.forgetPassword]: ForgetPasswordForm,
    }

    const Component = TypeMap[type]

    return <Component setPageType={setPageType} loginSuccess={loginSuccess} />
  }
  return (
    <Modal showModal={showSignInModal} setShowModal={setShowSignInModal}>
      <div className="container card mx-auto w-96 bg-[#f0f2f5] text-neutral-content">
        <div className="card-body items-center text-center">
          <div className="card-body items-center text-center text-black">
            <DynamicComponent type={pageType} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function useSignInModal() {
  const [showSignInModal, setShowSignInModal] = useState(false)

  const SignInModalCallback = useCallback(() => {
    return (
      <SignInModal
        showSignInModal={showSignInModal}
        setShowSignInModal={setShowSignInModal}
      />
    )
  }, [showSignInModal, setShowSignInModal])

  return useMemo(
    () => ({ setShowSignInModal, SignInModal: SignInModalCallback }),
    [setShowSignInModal, SignInModalCallback]
  )
}
