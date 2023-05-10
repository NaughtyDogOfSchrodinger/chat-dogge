import { useState, useMemo, useCallback } from 'react'
import { sendCodeToEmail } from '@/api/user'
import { EmailTypeEnum } from '@/constants/common'
let timer: any
import { toast } from 'react-hot-toast'
export const useSendCode = () => {
  // const { toast } = useToast()
  const [codeSending, setCodeSending] = useState(false)
  const [codeCountDown, setCodeCountDown] = useState(0)
  const sendCodeText = useMemo(() => {
    if (codeCountDown >= 10) {
      return `${codeCountDown}s`
    }
    if (codeCountDown > 0) {
      return `0${codeCountDown}s`
    }
    return '获取'
  }, [codeCountDown])

  const sendCode = useCallback(
    async ({ email, type }: { email: string; type: `${EmailTypeEnum}` }) => {
      setCodeSending(true)
      try {
        await sendCodeToEmail({
          email,
          type,
        })
        setCodeCountDown(60)
        timer = setInterval(() => {
          setCodeCountDown((val) => {
            if (val <= 0) {
              clearInterval(timer)
            }
            return val - 1
          })
        }, 1000)
        toast('验证码已发送', { icon: `✅` })
      } catch (error: any) {
        toast(error.message || '发送验证码异常', { icon: `🔴` })
      }
      setCodeSending(false)
    },
    []
  )

  return {
    codeSending,
    sendCode,
    sendCodeText,
    codeCountDown,
  }
}
