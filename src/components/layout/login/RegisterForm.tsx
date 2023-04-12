import React, { useState, Dispatch, useCallback } from 'react'
import {
  FormControl,
  Box,
  Input,
  Button,
  FormErrorMessage,
  Flex,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { PageTypeEnum } from '@/constants/user'
import { postRegister } from '@/api/user'
import { useSendCode } from '@/hooks/useSendCode'
import type { ResLogin } from '@/api/response/user'
import { toast } from 'react-hot-toast'
import { LoadingCircle } from '@/components/share/icons'
import Image from 'next/image'
import { EMAIL_REG } from '@/constants/common'

interface Props {
  loginSuccess: (e: ResLogin) => void
  setPageType: Dispatch<`${PageTypeEnum}`>
}

interface RegisterType {
  email: string
  password: string
  password2: string
  code: string
}

const RegisterForm = ({ setPageType, loginSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<RegisterType>({
    mode: 'onBlur',
  })

  const { codeSending, sendCodeText, sendCode, codeCountDown } = useSendCode()

  const onclickSendCode = useCallback(async () => {
    const check = await trigger('email')
    if (!check) return
    sendCode({
      email: getValues('email'),
      type: 'register',
    })
  }, [getValues, sendCode, trigger])

  const [requesting, setRequesting] = useState(false)

  const onclickRegister = useCallback(
    async ({ email, password, code }: RegisterType) => {
      setRequesting(true)
      try {
        loginSuccess(
          await postRegister({
            email,
            code,
            password,
          })
        )
        setPageType('login')
        toast('注册成功', { icon: `✅` })
      } catch (error: any) {
        toast(error.message || '注册异常', { icon: `🔴` })
      }
      setRequesting(false)
    },
    [loginSuccess, setPageType]
  )

  return (
    <>
      <Image
        src="/favicon.svg"
        alt="Logo"
        className="h-20 w-20"
        width={20}
        height={20}
      />
      <form onSubmit={handleSubmit(onclickRegister)}>
        <FormControl mt={8} isInvalid={!!errors.email}>
          <input
            type="text"
            className="input-bordered input w-full"
            placeholder="邮箱"
            {...register('email', {
              required: '邮箱不能为空',
              pattern: {
                value: EMAIL_REG,
                message: '邮箱错误',
              },
            })}
          ></input>
          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>
        <label className="label" />

        <FormControl mt={8} isInvalid={!!errors.email}>
          <div className="flex-col2 flex">
            <input
              type="text"
              className="input-bordered input w-full"
              placeholder="验证码"
              {...register('code', {
                required: '验证码不能为空',
              })}
            ></input>
            <button
              onClick={onclickSendCode}
              disabled={codeSending || codeCountDown > 0}
              className="w-15 btn rounded-md border-2 border-gray-200   focus:outline-none"
            >
              {codeSending ? <LoadingCircle /> : <>{sendCodeText}</>}
            </button>
          </div>

          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.code && errors.code.message}
          </FormErrorMessage>
        </FormControl>
        <label className="label" />

        <FormControl mt={8} isInvalid={!!errors.password}>
          <input
            type={'password'}
            placeholder="密码"
            className="input-bordered input w-full"
            {...register('password', {
              required: '密码不能为空',
              minLength: {
                value: 4,
                message: '密码最少4位最多12位',
              },
              maxLength: {
                value: 12,
                message: '密码最少4位最多12位',
              },
            })}
          ></input>
          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.password && errors.password.message}
          </FormErrorMessage>
        </FormControl>
        <label className="label" />

        <FormControl mt={8} isInvalid={!!errors.password2}>
          <input
            type={'password'}
            placeholder="确认密码"
            className="input-bordered input w-full"
            {...register('password2', {
              validate: (val) =>
                getValues('password') === val ? true : '两次密码不一致',
            })}
          ></input>
          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.password2 && errors.password2.message}
          </FormErrorMessage>
        </FormControl>

        <label className="label">
          <span className="label-text"></span>
          <span
            className="label-text hover:underline"
            onClick={() => setPageType('login')}
          >
            已有账号，去登录
          </span>
        </label>
        <button
          className={`${
            requesting ? 'cursor-not-allowed ' : 'border'
          } btn flex h-10 w-full items-center justify-center space-x-3 rounded-md border border-gray-200 text-sm shadow-sm transition-all duration-75 focus:outline-none`}
          type="submit"
        >
          确认注册
        </button>
      </form>
    </>
  )
}

export default RegisterForm
