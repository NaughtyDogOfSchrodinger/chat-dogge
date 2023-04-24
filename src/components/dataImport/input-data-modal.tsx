import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  getWebContent,
  postModelDataInput,
  postModelDataSplitData,
  putModelDataById,
} from '@/api/model'
import { toast } from 'react-hot-toast'
import Modal from '@/components/share/modal'
import LoadingDots from '@/components/LoadingDots'
import { useForm } from 'react-hook-form'
import { nanoid } from 'nanoid'

export type FormData = { dataId?: string; text: string; q: string }

const InputDataModal = ({
  showModal,
  setShowModal,
  modelId,
  defaultValues = {
    text: '',
    q: '',
  },
}: {
  showModal: boolean
  setShowModal: Dispatch<SetStateAction<boolean>>
  modelId: string
  defaultValues?: FormData
}) => {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues,
  })

  const [importing, setImporting] = useState(false)

  /**
   * 确认导入新数据
   */
  const sureImportData = useCallback(
    async (e: FormData) => {
      setImporting(true)

      try {
        const res = await postModelDataInput({
          modelId: modelId,
          data: [
            {
              text: e.text,
              q: {
                id: nanoid(),
                text: e.q,
              },
            },
          ],
        })
        setShowModal(false)
        toast(res === 0 ? '导入数据成功,需要一段时间训练' : '数据导入异常', {
          icon: res === 0 ? '✅' : '🔴',
        })
        reset({
          text: '',
          q: '',
        })
      } catch (err) {
        console.log(err)
      }
      setImporting(false)
    },
    [modelId, reset, setShowModal]
  )

  const updateData = useCallback(
    async (e: FormData) => {
      if (!e.dataId) return

      if (e.text !== defaultValues.text || e.q !== defaultValues.q) {
        await putModelDataById({
          dataId: e.dataId,
          text: e.text,
          q: e.q === defaultValues.q ? '' : e.q,
        })
      }
      setShowModal(false)
      toast('修改回答成功', { icon: '✅' })
    },
    [defaultValues, setShowModal]
  )
  return (
    <Modal showModal={showModal} setShowModal={setShowModal}>
      <div className="container card mx-auto h-3/4 bg-white text-neutral-content">
        <div className="card-body items-center text-center ">
          <div className="card-body w-full items-center text-center text-black ">
            <div className="h-full w-full">
              <label className="label">
                <span className="label-text-alt">
                  相关问题，可以回车输入多个问法, 最多500字
                </span>
              </label>
              <textarea
                placeholder="网站的内容"
                maxLength={-1}
                className="h-full w-full"
                {...register(`q`, {
                  required: '相关问题，可以回车输入多个问法',
                })}
              />
            </div>
          </div>
          <div className="card-body w-full items-center text-center text-black ">
            <div className="h-full w-full">
              <label className="label">
                <span className="label-text-alt">知识点,最多1000字</span>
              </label>
              <textarea
                placeholder="知识点"
                maxLength={-1}
                className="h-full w-full"
                {...register(`text`, {
                  required: '知识点',
                })}
              />
            </div>
          </div>
          <div className="items-center justify-items-end">
            <button className="btn" onClick={() => setShowModal(false)}>
              取消
            </button>
            <button
              className={`${importing ? 'disabled' : ''} btn`}
              onClick={handleSubmit(
                defaultValues.dataId ? updateData : sureImportData
              )}
            >
              {importing ? <LoadingDots color="#808080" /> : '确认导入'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
export function useInputData({
  modelId,
  defaultValues = {
    text: '',
    q: '',
  },
}: {
  modelId: string
  defaultValues?: FormData
}) {
  const [showInputModal, setShowInputModal] = useState(false)

  const ModalCallback = useCallback(() => {
    return (
      <InputDataModal
        modelId={modelId}
        showModal={showInputModal}
        setShowModal={setShowInputModal}
        defaultValues={defaultValues}
      />
    )
  }, [defaultValues, modelId, showInputModal])

  return useMemo(
    () => ({ setShowInputModal, InputModal: ModalCallback }),
    [setShowInputModal, ModalCallback]
  )
}
