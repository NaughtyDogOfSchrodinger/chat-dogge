import React, { useState, Dispatch, useCallback } from 'react'
import {
  FormControl,
  Flex,
  Input,
  Button,
  FormErrorMessage,
  Box,
} from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { PageTypeEnum } from '@/constants/user'
import { postLogin } from '@/api/user'
import type { ResLogin } from '@/api/response/user'
import { LoadingDots } from '@/components/share/icons'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { EMAIL_REG } from '@/constants/common'

interface Props {
  setPageType: Dispatch<`${PageTypeEnum}`>
  loginSuccess: (e: ResLogin) => void
}

interface LoginFormType {
  email: string
  password: string
}

const LoginForm = ({ setPageType, loginSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormType>()

  const [requesting, setRequesting] = useState(false)

  const onclickLogin = useCallback(
    async ({ email, password }: LoginFormType) => {
      setRequesting(true)
      try {
        loginSuccess(
          await postLogin({
            email,
            password,
          })
        )
        toast('登录成功', { icon: `✅` })
      } catch (error: any) {
        toast(error.message || '登录异常' || '发送验证码异常', { icon: `🔴` })
      }
      setRequesting(false)
    },
    [loginSuccess]
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
      <form onSubmit={handleSubmit(onclickLogin)} className="mx-auto max-w-md">
        <FormControl mt={8} isInvalid={!!errors.email}>
          <input
            type="text"
            placeholder="邮箱"
            className="input-bordered input w-full max-w-xs"
            {...register('email', {
              required: '邮箱不能为空',
              pattern: {
                value: EMAIL_REG,
                message: '邮箱错误',
              },
            })}
          />
          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.email && errors.email.message}
          </FormErrorMessage>
          <label className="label" />
        </FormControl>
        <FormControl mt={8} isInvalid={!!errors.email}>
          <input
            type={'password'}
            className="input-bordered input w-full max-w-xs"
            placeholder="密码"
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
          <label className="label" />
        </FormControl>

        <label className="label">
          <span
            className="label-text hover:underline"
            onClick={() => setPageType('forgetPassword')}
          >
            忘记密码?
          </span>
          <span
            className="label-text hover:underline"
            onClick={() => setPageType('register')}
          >
            注册账号
          </span>
        </label>
        <button
          disabled={requesting}
          className={`${
            requesting ? 'cursor-not-allowed ' : 'border'
          } btn flex h-10 w-full items-center justify-center space-x-3 rounded-md border border-gray-200 text-sm shadow-sm transition-all duration-75 focus:outline-none`}
          type="submit"
        >
          {requesting ? <LoadingDots color="#808080" /> : '登录'}
        </button>
      </form>
    </>
  )
}

export default LoginForm
