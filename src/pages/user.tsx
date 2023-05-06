import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { getUserById } from '@/api/user'
import { useQuery } from '@tanstack/react-query'
import UserComponent from '@/components/User'

export async function getServerSideProps(context: any) {
  const userId = context.query?.userId || ''

  return {
    props: {
      userId,
      ...(await serverSideTranslations(context.locale!, ['common'])),
    },
  }
}
const User = ({ userId }: { userId: string }) => {
  const { isLoading, data } = useQuery(['getUserById'], () =>
    getUserById(userId)
  )
  if (isLoading || !data) return null

  return <UserComponent user={data} />
}

export default User
