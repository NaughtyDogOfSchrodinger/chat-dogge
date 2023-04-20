import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useMutation } from '@tanstack/react-query'
import { getWebContent, postModelDataSplitData } from '@/api/model'
import { toast } from 'react-hot-toast'
import Modal from '@/components/share/modal'
import LoadingDots from '@/components/LoadingDots'
import { encode } from 'gpt-token-utils'
import { formatPrice } from '@/utils/user'

const UrlModal = ({
  showModal,
  setShowModal,
  modelId,
}: {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  modelId: string
}) => {
  const [webUrl, setWebUrl] = useState('')
  const [webText, setWebText] = useState('')
  const [prompt, setPrompt] = useState('') // 提示词

  const { mutate: onclickImport, isLoading: isImporting } = useMutation({
    mutationFn: async () => {
      if (!webText) return
      await postModelDataSplitData({
        modelId,
        text: webText,
        prompt: `下面是${prompt || '一段长文本'}`,
      })
      setShowModal(false)
      toast('导入数据成功,需要一段拆解和训练', { icon: '✅' })
    },
    onError(error) {
      console.log(error)
      toast('导入数据失败', {
        icon: '🔴',
      })
    },
  })

  const { mutate: onclickFetchingUrl, isLoading: isFetching } = useMutation({
    mutationFn: async () => {
      if (!webUrl) return
      const res = await getWebContent(webUrl)
      const parser = new DOMParser()
      const htmlDoc = parser.parseFromString(res, 'text/html')
      const data = htmlDoc?.body?.innerText || ''

      if (!data) {
        throw new Error('获取不到数据')
      }
      setWebText(data.replace(/\s+/g, ' '))
    },
    onError(error) {
      console.log(error)
      toast('获取网站内容失败', {
        icon: '🔴',
      })
    },
  })

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="container card mx-auto h-3/4 bg-white text-neutral-content">
        <div className="card-body items-center text-center ">
          <div className="card-body w-full items-center text-center text-black ">
            <div className="flex justify-center gap-1">
              <input
                type="text"
                placeholder="网站地址"
                className="input-bordered input w-full max-w-xs"
                onChange={(e) => setWebUrl(e.target.value)}
              />
              <div
                className="tooltip flex justify-center"
                data-tip={`根据网站地址，获取网站文本内容（请注意获取后的内容，不是每个网站内容都能获取到的）。模型会对文本进行
            QA 拆分，需要较长训练时间，拆分需要消耗 tokens，账号余额不足时，未拆分的数据会被删除。`}
              >
                <button
                  className={`${isFetching ? 'disabled' : ''} btn`}
                  onClick={() => onclickFetchingUrl()}
                >
                  {isFetching ? <LoadingDots color="#808080" /> : '获取'}
                </button>
              </div>
            </div>
            <div className="form-control w-full max-w-xs">
              <input
                type="text"
                className="input-bordered input w-full max-w-xs"
                placeholder="提示词"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <label className="label">
                <span className="label-text-alt">
                  例如: Laf的介绍/关于gpt4的论文/一段长文本
                </span>
              </label>
            </div>
            <div className="h-full w-full">
              <label className="label">
                <span className="label-text-alt">
                  一共 {encode(webText).length} 个tokens，大约
                  {formatPrice(encode(webText).length * 3)}元
                </span>
              </label>
              <textarea
                placeholder="网站的内容"
                maxLength={-1}
                className="h-full w-full"
                value={webText}
                onChange={(e) => setWebText(e.target.value)}
              />
            </div>
          </div>
          <div className="items-center justify-items-end">
            <button className="btn" onClick={() => setShowModal(false)}>
              取消
            </button>
            <div
              className="tooltip"
              data-tip="确认导入该文件，需要一定时间进行拆解，该任务无法终止！如果余额不足，任务讲被终止。"
            >
              <button
                className={`${isImporting ? 'disabled' : ''} btn`}
                disabled={webText === ''}
                onClick={() => onclickImport()}
              >
                {isImporting ? <LoadingDots color="#808080" /> : '确认导入'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export function useSelectUrl({ modelId }: { modelId: string }) {
  const [showUrlModal, setShowUrlModal] = useState(false)

  const ModalCallback = useCallback(() => {
    return (
      <UrlModal
        modelId={modelId}
        showModal={showUrlModal}
        setShowModal={setShowUrlModal}
      />
    )
  }, [modelId, showUrlModal])

  return useMemo(
    () => ({ setShowUrlModal, UrlModal: ModalCallback }),
    [setShowUrlModal, ModalCallback]
  )
}
