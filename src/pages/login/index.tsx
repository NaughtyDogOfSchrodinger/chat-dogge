import React, { useState, useCallback, useEffect } from 'react'
import { PageTypeEnum } from '@/constants/user'
import { useScreen } from '@/hooks/useScreen'
import type { ResLogin } from '@/api/response/user'
import { useRouter } from 'next/router'
import { useUserStore } from '@/store/user'
import LoginForm from './components/LoginForm'
import dynamic from 'next/dynamic'
import Modal from '@/components/share/modal'

const RegisterForm = dynamic(() => import('./components/RegisterForm'))
const ForgetPasswordForm = dynamic(
  () => import('./components/ForgetPasswordForm')
)

const Login = () => {
  const router = useRouter()
  const { isPc } = useScreen()
  const [pageType, setPageType] = useState<`${PageTypeEnum}`>(
    PageTypeEnum.login
  )
  const { setUserInfo } = useUserStore()

  const loginSuccess = useCallback(
    (res: ResLogin) => {
      setUserInfo(res.user, res.token)
      // router.push('/model/list')
    },
    [router, setUserInfo]
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

  const [showSignInModal, setShowSignInModal] = useState(true)
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

export default Login
