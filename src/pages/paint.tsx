import React, { useCallback, useState } from 'react'
import Canvas from '@/components/paint/canvas'
import PromptForm from '@/components/paint/prompt-form'
import Dropzone from '@/components/paint/dropzone'
import Download from '@/components/paint/download'
import { XCircle as StartOverIcon } from 'lucide-react'
import { getImage, getImageById } from '@/api/model'
import { NextSeo } from 'next-seo'
import { toast } from 'react-hot-toast'
import { Text2ImgInput } from '@/constants/model'

const sleep = (ms: any) => new Promise((r) => setTimeout(r, ms))

export interface GetImage {
  width: number
  height: number
  num_outputs: number
  num_inference_steps: number
  guidance_scale: number
  seed: number
  prompt: string
  init_image: any
  mask: any
  version: string
}
export default function Home() {
  const [predictions, setPredictions] = useState([])
  const [error, setError] = useState(null)
  const [maskImage, setMaskImage] = useState(null)
  const [userUploadedImage, setUserUploadedImage] = useState(null)
  const [input, setInput] = useState<Text2ImgInput>()
  const callback = (e: Text2ImgInput) => setInput(e)
  const handleSubmit = async (input: Text2ImgInput) => {
    const prevPrediction = predictions[predictions.length - 1]
    // @ts-ignore
    const prevPredictionOutput = prevPrediction?.output
      ? // @ts-ignore
        prevPrediction.output[prevPrediction.output.length - 1]
      : null
    console.log(`${JSON.stringify(input)}`)
    const body = {
      init_image: userUploadedImage
        ? await readAsDataURL(userUploadedImage)
        : // only use previous prediction as init image if there's a mask
        maskImage
        ? prevPredictionOutput
        : null,
      mask: maskImage,
      ...input,
    } as GetImage

    try {
      let prediction = await getImage(body)
      // @ts-ignore
      setPredictions(predictions.concat([prediction]))

      while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed'
      ) {
        await sleep(1000)
        prediction = await getImageById(prediction.id)
        // @ts-ignore
        setPredictions(predictions.concat([prediction]))

        if (prediction.status === 'succeeded') {
          setUserUploadedImage(null)
        }
      }
    } catch (e: any) {
      toast(e?.message || '生成图像出错', {
        icon: '🔴',
      })
    }
  }

  const startOver = async (e: any) => {
    e.preventDefault()
    setPredictions([])
    setError(null)
    setMaskImage(null)
    setUserUploadedImage(null)
  }
  return (
    <div>
      <NextSeo
        title={'paintDogged'}
        description={'chatdogge绘画'}
        additionalLinkTags={[
          {
            rel: 'icon',
            href: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎨</text></svg>`,
          },
        ]}
      />

      <main className="container mx-auto p-5">
        {error && <div>{error}</div>}

        <div className="border-hairline relative mx-auto max-w-[512px]">
          <Dropzone
            onImageDropped={setUserUploadedImage}
            predictions={predictions}
            userUploadedImage={userUploadedImage}
          />
          <div
            className={`w-${
              input?.ori_width ||
              (input?.width
                ? input?.width
                : input?.image_dimensions?.split('x')[0])
            } h-${
              input?.ori_height ||
              (input?.ori_height
                ? input?.height
                : input?.image_dimensions?.split('x')[1])
            } relative flex w-full items-stretch bg-white`}
            // style={{ height: 0, paddingBottom: '100%' }}
          >
            <Canvas
              width={
                input?.ori_width ||
                (!input?.width
                  ? Number(input?.image_dimensions?.split('x')[0])
                  : input?.width)
              }
              height={
                input?.ori_height ||
                (!input?.height
                  ? Number(input?.image_dimensions?.split('x')[1])
                  : input?.height)
              }
              predictions={predictions}
              userUploadedImage={userUploadedImage}
              onDraw={setMaskImage}
            />
          </div>
        </div>

        <div className="mx-auto max-w-[512px]">
          <PromptForm
            callback={handleSubmit}
            setInput={callback}
            input={input}
          />

          <div className="text-center">
            {((predictions.length > 0 && // @ts-ignore
              predictions[predictions.length - 1].output) ||
              maskImage ||
              userUploadedImage) && (
              <button className="lil-button" onClick={startOver}>
                <StartOverIcon className="icon" />
                重新开始
              </button>
            )}

            <Download predictions={predictions} />
          </div>
        </div>
      </main>
    </div>
  )
}

function readAsDataURL(file: any) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = reject
    fr.onload = () => {
      resolve(fr.result)
    }
    fr.readAsDataURL(file)
  })
}
