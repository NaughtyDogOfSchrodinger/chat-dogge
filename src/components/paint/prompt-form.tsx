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

export default function PromptForm(props: {
  callback: any
  setInput: (input: Text2ImgInput) => void
  input?: Text2ImgInput
}) {
  const [model, setModel] = useState<Text2ImgModel>(defaultText2ImgModel)
  const aaa = sample(defaultText2ImgModel.promptList)
  const [haha, setHaha] = useState<string>(aaa)
  const [prompt, setPrompt] = useState<string>(aaa.prompt)
  props.setInput(aaa)
  const modelSelect = (version: string) => {
    const modelItem = text2ImgModelList.find((item) => item.version === version)
    if (!modelItem) {
      toast('text2Img模型不存在', { icon: `🔴` })
      return
    }
    setModel(modelItem)
    const p = sample(modelItem.promptList)
    props.setInput(p)
    setHaha(p)
    setPrompt(p.prompt)
  }
  return (
    // <form
    //   onSubmit={props.callback}
    //   className="py-5 animate-in fade-in duration-700"
    // >
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
          value={prompt}
          name="prompt"
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入提示词..."
        />
      </div>

      <button
        className="text-small btn inline-block flex-none rounded-r-md bg-black px-3 text-white"
        // type="submit"
        onClick={() => props.callback(haha)}
      >
        生成
      </button>
    </div>
    // </form>
  )
}
