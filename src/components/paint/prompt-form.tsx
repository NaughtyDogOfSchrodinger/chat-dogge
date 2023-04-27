import { useState } from 'react'

const samplePrompts = [
  'a gentleman otter in a 19th century portrait',
  'bowl of ramen in the style of a comic book',
  'flower field drawn by Jean-Jacques Sempé',
  'illustration of a taxi cab in the style of r crumb',
  'multicolor hyperspace',
  'painting of fruit on a table in the style of Raimonds Staprans',
  'pencil sketch of robots playing poker',
  'photo of an astronaut riding a horse',
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
          className="block w-full flex-grow rounded-l-md"
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
