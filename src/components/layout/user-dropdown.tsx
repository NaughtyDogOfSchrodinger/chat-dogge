import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Dog, LogOut } from 'lucide-react'
import Popover from '@/components/share/popover'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FADE_IN_ANIMATION_SETTINGS } from '@/utils/constants'

export default function UserDropdown() {
  const { data: session } = useSession()
  const { email, image, id } = session?.user || {}
  const [openPopover, setOpenPopover] = useState(false)
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)
  useEffect(() => {
    if (id) {
      setLoading(true)
      fetch(`/api/me?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          setData(data)
          setLoading(false)
        })
    }
  }, [id])
  if (!email) return null

  return (
    <motion.div
      className="relative inline-block text-left"
      {...FADE_IN_ANIMATION_SETTINGS}
    >
      <Popover
        content={
          <div className="w-full rounded-md bg-white p-2 sm:w-56">
            {/*<Link*/}
            {/*  className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"*/}
            {/*  href="/api/users/me"*/}
            {/*>*/}
            {/*  <LayoutDashboard className="h-4 w-4" />*/}
            {/*  <p className="text-sm">Dashboard</p>*/}
            {/*</Link>*/}
            <button
              className="relative flex w-full cursor-not-allowed items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              disabled
            >
              <Dog className="h-4 w-4" />
              <p className="text-sm">剩余 {data} token</p>
            </button>
            <button
              className="relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75 hover:bg-gray-100"
              onClick={() => signOut({ redirect: false })}
            >
              <LogOut className="h-4 w-4" />
              <p className="text-sm">Logout</p>
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-9 sm:w-9"
        >
          <Image
            alt={email}
            src={image || `https://avatars.dicebear.com/api/micah/${email}.svg`}
            width={40}
            height={40}
          />
        </button>
      </Popover>
    </motion.div>
  )
}
