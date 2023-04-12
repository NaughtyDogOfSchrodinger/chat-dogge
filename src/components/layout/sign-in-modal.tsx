import Modal from '@/components/share/modal'
import { signIn } from 'next-auth/react'
import React, {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useEffect,
} from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { PageTypeEnum } from '@/constants/user'
import { useUserStore } from '@/store/user'
import { ResLogin } from '@/api/response/user'
import LoginForm from '@/components/layout/login/LoginForm'
import RegisterForm from '@/components/layout/login/RegisterForm'
import ForgetPasswordForm from '@/components/layout/login/ForgetPasswordForm'

const SignInModal = ({
  showSignInModal,
  setShowSignInModal,
}: {
  showSignInModal: boolean
  setShowSignInModal: Dispatch<SetStateAction<boolean>>
}) => {
  const router = useRouter()
  const [pageType, setPageType] = useState<`${PageTypeEnum}`>(
    PageTypeEnum.login
  )
  const { setUserInfo } = useUserStore()
  const loginSuccess = useCallback(
    (res: ResLogin) => {
      setUserInfo(res.user, res.token)
      setShowSignInModal(false)
    },
    [setShowSignInModal, setUserInfo]
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

  useEffect(() => {
    // router.prefetch('/model/list')
  }, [router])

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
