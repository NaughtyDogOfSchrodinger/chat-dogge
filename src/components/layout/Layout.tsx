import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import React from 'react'

const Layout = (props: { children?: JSX.Element | JSX.Element[] }) => {
  return (
    <>
      <Header />
      <main>
        <div className="w-full bg-slate-50 pb-20">
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            {props.children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Layout
