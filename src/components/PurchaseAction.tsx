import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import Modal from 'react-modal'
import Image from 'next/image'

interface PurchaseActionProps {
  onAlreadyPurchasedClick: () => void
}
export const PurchaseAction = (props: PurchaseActionProps) => {
  // @ts-ignore
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const customStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
    },
  }

  return (
    <>
      <p className="text-base font-semibold text-gray-600">{t('60off')}</p>
      <p className="mt-6 flex items-baseline justify-center gap-x-2">
        <span className="text-5xl font-bold tracking-tight text-gray-900">
          ¥25
        </span>
        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
          10w {t('count')}
        </span>
      </p>
      <p className="mt-6 flex items-baseline justify-center gap-x-2">
        <span className="text-5xl font-bold tracking-tight text-gray-900">
          ¥68
        </span>
        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
          30w {t('count')}
        </span>
      </p>
      <p className="mt-6 flex items-baseline justify-center gap-x-2">
        <span className="text-5xl font-bold tracking-tight text-gray-900">
          ¥128
        </span>
        <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">
          100w {t('count')}
        </span>
      </p>
      <div>
        <button
          className="mt-10 block w-full rounded-full bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={() => setIsOpen(true)}
        >
          {t('buy')}
        </button>
        <Modal
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(false)}
          style={customStyles}
        >
          <div className="w-full overflow-hidden shadow-xl md:max-w-md md:rounded-2xl md:border md:border-gray-200">
            <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center md:px-16">
              <h3 className="font-display text-2xl font-bold">
                商户资质申请中 <br /> 目前仅支持扫码付款
              </h3>
              <Image
                src="/alipay.JPG"
                alt="Logo"
                className="h-1200 w-1800"
                width={600}
                height={900}
              />
              <p className="text-sm font-semibold text-gray-500">
                收到您的货款后3-5分钟后，token数量会更新，请耐心等待，如有问题请加微信hj15161516
              </p>
            </div>
          </div>
          <button
            className="mt-10 block w-full rounded-full bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => setIsOpen(false)}
          >
            取消
          </button>
        </Modal>
      </div>
    </>
  )
}
