import React, { useCallback, useState } from 'react'

// @ts-ignore
import sample from 'lodash/sample'
import {
  defaultText2ImgModel,
  Text2ImgInput,
  Text2ImgModel,
  text2ImgModelList,
} from '@/constants/model'
import { toast } from 'react-hot-toast'

export default function PromptForm(props: any) {
  const [model, setModel] = useState<Text2ImgModel>(defaultText2ImgModel)
  const [promptList, setPromptList] = useState<Text2ImgInput[]>(
    model.promptList
  )
  const [prompt, setPrompt] = useState<string>(sample(promptList).prompt)
  props.setInput(prompt)

  const modelSelect = useCallback(
    (version: string) => {
      const modelItem = text2ImgModelList.find(
        (item) => item.version === version
      )
      if (!modelItem) {
        toast('text2Img模型不存在', { icon: `🔴` })
        return
      }
      setModel(modelItem)
      setPromptList(modelItem.promptList)
      const p = sample(modelItem.promptList)
      setPrompt(p.prompt)
      props.setInput(p)
    },
    [props]
  )
  return (
    <form
      onSubmit={props.onSubmit}
      className="py-5 animate-in fade-in duration-700"
    >
      <div className=" max-w-[512px]">
        <div>
          <label className="label">
            <span className="label-text-alt">{model.description}</span>
          </label>
          <select
            defaultValue={undefined}
            className="select-bordered select select-xs h-full w-full font-normal"
            onChange={(e) => {
              modelSelect(e.target.value)
            }}
          >
            {text2ImgModelList.map((item) => (
              <option key={item.version} value={item.version}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text-alt">提示词</span>
          </label>
          <textarea
            className="textarea-bordered textarea h-40 w-full resize-none"
            defaultValue={prompt}
            name="prompt"
            placeholder="输入提示词..."
          />
        </div>

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
