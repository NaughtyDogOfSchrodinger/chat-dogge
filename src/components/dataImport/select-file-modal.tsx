import Modal from '@/components/share/modal'
import React, {
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
} from 'react'
import { readDocContent, readPdfContent, readTxtContent } from '@/utils/tools'
import { postModelDataSplitData } from '@/api/model'
import { encode } from 'gpt-token-utils'
import { formatPrice } from '@/utils/user'
import LoadingDots from '@/components/LoadingDots'

import { toast } from 'react-hot-toast'
const fileExtension = '.txt,.doc,.docx,.pdf,.md'

const FileModal = ({
  showModal,
  setShowModal,
  modelId,
}: {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  modelId: string
}) => {
  const [selecting, setSelecting] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [fileText, setFileText] = useState('')
  const onSelectFile = useCallback(
    async (e: File[]) => {
      setSelecting(true)
      try {
        const fileTexts = (
          await Promise.all(
            e.map((file) => {
              // @ts-ignore
              const extension = file?.name?.split('.').pop().toLowerCase()
              switch (extension) {
                case 'txt':
                case 'md':
                  return readTxtContent(file)
                case 'pdf':
                  return readPdfContent(file)
                case 'doc':
                case 'docx':
                  return readDocContent(file)
                default:
                  return ''
              }
            })
          )
        )
          .join(' ')
          .replace(/(\\n|\n)+/g, '\n')
        setFileText(fileTexts)
      } catch (error: any) {
        console.log(error)
        toast(typeof error === 'string' ? error : '解析文件失败', {
          icon: '🔴',
        })
      }
      setSelecting(false)
    },
    [setSelecting]
  )

  const fileImport = useCallback(async () => {
    if (!fileText) return
    await postModelDataSplitData({
      modelId,
      text: fileText,
      prompt: `下面是${prompt || '一段长文本'}`,
    })
    setShowModal(false)
    toast('导入数据成功,需要一段拆解和训练', { icon: '✅' })
  }, [fileText, modelId, prompt, setShowModal])
  const SelectFileDom = useRef<HTMLInputElement>(null)

  const onOpen = useCallback(() => {
    SelectFileDom.current && SelectFileDom.current.click()
  }, [])
  const File = useCallback(
    ({ onSelect }: { onSelect: (e: File[]) => void }) => (
      <input
        ref={SelectFileDom}
        type="file"
        accept={fileExtension}
        multiple={true}
        className="hide-input"
        onChange={(e) => {
          if (!e.target.files || e.target.files?.length === 0) return
          onSelect(Array.from(e.target.files))
        }}
      />
    ),
    []
  )

  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="container card mx-auto h-3/4 bg-white text-neutral-content">
        <File onSelect={onSelectFile} />
        <div className="card-body items-center text-center ">
          <div className="card-body w-full items-center text-center text-black">
            {/*<h2>文件导入</h2>*/}
            <div
              className="tooltip"
              data-tip={`支持 ${fileExtension} 文件。模型会自动对文本进行 QA
              拆分，需要较长训练时间，拆分需要消耗
              tokens，账号余额不足时，未拆分的数据会被删除。`}
            >
              <button
                className={`${selecting ? 'disabled' : ''} btn`}
                onClick={onOpen}
              >
                {selecting ? <LoadingDots color="#808080" /> : '选择文件'}
              </button>
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
                  一共 {encode(fileText).length} 个tokens，大约{' '}
                  {formatPrice(encode(fileText).length * 3)}元
                </span>
              </label>
              <textarea
                placeholder="文件内容"
                maxLength={-1}
                className="h-full w-full"
                value={fileText}
                onChange={(e) => setFileText(e.target.value)}
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
                className="btn"
                disabled={fileText === ''}
                onClick={() => fileImport()}
              >
                确认导入
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function useSelectFile({ modelId }: { modelId: string }) {
  const [showFileModal, setShowFileModal] = useState(false)

  const ModalCallback = useCallback(() => {
    return (
      <FileModal
        modelId={modelId}
        showModal={showFileModal}
        setShowModal={setShowFileModal}
      />
    )
  }, [modelId, showFileModal])

  return useMemo(
    () => ({ setShowFileModal, FileModal: ModalCallback }),
    [setShowFileModal, ModalCallback]
  )
}
