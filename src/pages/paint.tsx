import React, { useState } from 'react'
import Canvas from '@/components/paint/canvas'
import PromptForm from '@/components/paint/prompt-form'
import Dropzone from '@/components/paint/dropzone'
import Download from '@/components/paint/download'
import { XCircle as StartOverIcon } from 'lucide-react'
import { getImage, getImageById } from '@/api/model'
import { NextSeo } from 'next-seo'
import { toast } from 'react-hot-toast'

const sleep = (ms: any) => new Promise((r) => setTimeout(r, ms))

export interface GetImage {
  prompt: string
  init_image: any
  mask: any
}
export default function Home() {
  const [predictions, setPredictions] = useState([])
  const [error, setError] = useState(null)
  const [maskImage, setMaskImage] = useState(null)
  const [userUploadedImage, setUserUploadedImage] = useState(null)

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const prevPrediction = predictions[predictions.length - 1]
    // @ts-ignore
    const prevPredictionOutput = prevPrediction?.output
      ? // @ts-ignore
        prevPrediction.output[prevPrediction.output.length - 1]
      : null

    const body = {
      prompt: e.target.prompt.value,
      init_image: userUploadedImage
        ? await readAsDataURL(userUploadedImage)
        : // only use previous prediction as init image if there's a mask
        maskImage
        ? prevPredictionOutput
        : null,
      mask: maskImage,
    }

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
            className="relative flex max-h-[512px] w-full items-stretch bg-gray-50"
            // style={{ height: 0, paddingBottom: "100%" }}
          >
            <Canvas
              predictions={predictions}
              userUploadedImage={userUploadedImage}
              onDraw={setMaskImage}
            />
          </div>
        </div>

        <div className="mx-auto max-w-[512px]">
          <PromptForm onSubmit={handleSubmit} />

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
