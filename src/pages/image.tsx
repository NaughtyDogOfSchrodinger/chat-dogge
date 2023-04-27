import Head from 'next/head'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import React from 'react'

export default function About() {
  return (
    <>
      <div className="mx-auto max-w-[512px] rounded-lg bg-white p-10">
        <Link href="/paint">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full cursor-pointer"
          >
            <source src="/cherries-oranges-bananas.mp4" />
          </video>
        </Link>

        <Link
          href="/paint"
          className="mt-10 block rounded-md bg-black py-3 text-center text-white"
        >
          开始绘画
        </Link>
      </div>
    </>
  )
}
