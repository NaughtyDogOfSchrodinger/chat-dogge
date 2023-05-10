import { useState } from 'react'

const samplePrompts = [
  '19世纪肖像画中的绅士水獭',
  '漫画风格的拉面碗',
  '让-雅克·塞姆佩笔下的花田',
  '以R·克拉姆布风格插画的出租车',
  '多彩超空间',
  '一幅以雷蒙兹·斯塔普兰斯风格为主题的桌上水果绘画',
  '一幅铅笔素描，描绘了机器人在玩扑克牌',
  '一张描绘宇航员骑马的照片',
]
// @ts-ignore
import sample from 'lodash/sample'

export default function PromptForm(props: any) {
  const [prompt] = useState(sample(samplePrompts))

  return (
    <form
      onSubmit={props.onSubmit}
      className="py-5 animate-in fade-in duration-700"
    >
      <div className="flex max-w-[512px]">
        <input
          type="text"
          defaultValue={prompt}
          name="prompt"
          placeholder="输入提示词..."
          className="w-full rounded-md border-2 border-black p-3 text-black shadow-sm focus:border-black focus:outline-0 "
        />

        <button
          className="text-small btn inline-block flex-none rounded-r-md bg-black px-3 text-white"
          type="submit"
        >
          生成
        </button>
      </div>
    </form>
  )
}
