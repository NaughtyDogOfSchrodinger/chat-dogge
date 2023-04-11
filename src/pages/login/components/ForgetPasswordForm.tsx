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
import { PageTypeEnum } from '../../../constants/user'
import { postFindPassword } from '@/api/user'
import { useSendCode } from '@/hooks/useSendCode'
import type { ResLogin } from '@/api/response/user'
import { useScreen } from '@/hooks/useScreen'
import { useToast } from '@/hooks/useToast'
import { LoadingCircle } from '@/components/share/icons'
import Image from 'next/image'

interface Props {
  setPageType: Dispatch<`${PageTypeEnum}`>
  loginSuccess: (e: ResLogin) => void
}

interface RegisterType {
  email: string
  code: string
  password: string
  password2: string
}

const RegisterForm = ({ setPageType, loginSuccess }: Props) => {
  const { toast } = useToast()
  const { mediaLgMd } = useScreen()
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
      type: 'findPassword',
    })
  }, [getValues, sendCode, trigger])

  const [requesting, setRequesting] = useState(false)

  const onclickFindPassword = useCallback(
    async ({ email, code, password }: RegisterType) => {
      setRequesting(true)
      try {
        loginSuccess(
          await postFindPassword({
            email,
            code,
            password,
          })
        )
        toast({
          title: `密码已找回`,
          status: 'success',
        })
      } catch (error: any) {
        toast({
          title: error.message || '修改密码异常',
          status: 'error',
        })
      }
      setRequesting(false)
    },
    [loginSuccess, toast]
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
      <form onSubmit={handleSubmit(onclickFindPassword)}>
        <FormControl mt={8} isInvalid={!!errors.email}>
          <input
            type="text"
            placeholder="邮箱"
            className="input-bordered input w-full"
            {...register('email', {
              required: '邮箱不能为空',
              pattern: {
                value:
                  /^[A-Za-z0-9]+([_.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/,
                message: '邮箱错误',
              },
            })}
          />
          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.email && errors.email.message}
          </FormErrorMessage>
        </FormControl>
        <label className="label" />

        <FormControl mt={8} isInvalid={!!errors.code}>
          <div className="flex-col2 flex">
            <input
              type="text"
              placeholder="验证码"
              className="input-bordered input  rounded-md border "
              {...register('code', {
                required: '验证码不能为空',
              })}
            />
            <button
              type="submit"
              disabled={codeCountDown > 0}
              className={`${
                !onclickSendCode ? 'cursor-not-allowed ' : 'border'
              } btn h-10  rounded-md  border border-gray-200   focus:outline-none`}
            >
              {!onclickSendCode ? <LoadingCircle /> : <>{sendCodeText}</>}
            </button>
          </div>

          <FormErrorMessage position={'absolute'} fontSize="xs" textColor="red">
            {!!errors.code && errors.code.message}
          </FormErrorMessage>
        </FormControl>

        <label className="label" />

        <FormControl mt={8} isInvalid={!!errors.password}>
          <input
            className="input-bordered input w-full rounded-md border"
            type={'password'}
            placeholder="新密码"
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
            className="input-bordered input w-full rounded-md border"
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
            去登录
          </span>
        </label>
        <button
          className={`${
            requesting ? 'cursor-not-allowed ' : 'border'
          } btn flex h-10 w-full items-center justify-center space-x-3 rounded-md border border-gray-200 text-sm shadow-sm transition-all duration-75 focus:outline-none`}
          type="submit"
        >
          找回密码
        </button>
      </form>
    </>
  )
}

export default RegisterForm
