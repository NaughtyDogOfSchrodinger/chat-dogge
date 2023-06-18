import type { ServiceName, ModelSchema } from '@/types/mongoSchema'
import type { RedisModelDataItemType } from '@/types/redis'
import { SortOrder } from 'mongoose'

export enum ChatModelNameEnum {
  GPT35 = 'gpt-3.5-turbo-16k-0613',
  VECTOR_GPT = 'VECTOR_GPT',
  GPT3 = 'text-davinci-003',
  VECTOR = 'text-embedding-ada-002',
  IMAGE = 'stable-diffusion',
}

export const ChatModelNameMap = {
  [ChatModelNameEnum.GPT35]: 'gpt-3.5-turbo-16k-0613',
  [ChatModelNameEnum.VECTOR_GPT]: 'gpt-3.5-turbo-16k-0613',
  [ChatModelNameEnum.GPT3]: 'text-davinci-003',
  [ChatModelNameEnum.VECTOR]: 'text-embedding-ada-002',
  [ChatModelNameEnum.IMAGE]: 'stable-diffusion',
}

export type ModelConstantsData = {
  serviceCompany: `${ServiceName}`
  name: string
  model: `${ChatModelNameEnum}`
  trainName: string // 空字符串代表不能训练
  maxToken: number
  contextMaxToken: number
  maxTemperature: number
  price: number // 多少钱 / 1token，单位: 0.00001元
}

export const modelList: ModelConstantsData[] = [
  {
    serviceCompany: 'openai',
    name: '基础类型',
    model: ChatModelNameEnum.GPT35,
    trainName: '',
    maxToken: 4000,
    contextMaxToken: 7500,
    maxTemperature: 2,
    price: 6,
  },
  {
    serviceCompany: 'openai',
    name: '知识库类型',
    model: ChatModelNameEnum.VECTOR_GPT,
    trainName: 'vector',
    maxToken: 4000,
    contextMaxToken: 7000,
    maxTemperature: 1,
    price: 6,
  },
  {
    serviceCompany: 'stable-diffusion',
    name: '图片',
    model: ChatModelNameEnum.IMAGE,
    trainName: 'image',
    maxToken: 4000,
    contextMaxToken: -1,
    maxTemperature: 1,
    price: 20000,
  },
  // {
  //   serviceCompany: 'openai',
  //   name: 'GPT3',
  //   model: ChatModelNameEnum.GPT3,
  //   trainName: 'davinci',
  //   maxToken: 4000,
  //   contextMaxToken: 7500,
  //   maxTemperature: 2,
  //   price: 30
  // }
]

export type ModelSort = {
  name: string
  hitCount?: SortOrder
  favCount?: SortOrder
}

export const modelSortList: ModelSort[] = [
  {
    name: '默认排序',
    hitCount: undefined,
    favCount: undefined,
  },
  {
    name: '热度高 -> 低',
    hitCount: -1,
    favCount: undefined,
  },
  {
    name: '热度低 -> 高',
    hitCount: 1,
    favCount: undefined,
  },
  {
    name: '喜欢多 -> 少',
    hitCount: undefined,
    favCount: -1,
  },
  {
    name: '喜欢少 -> 多',
    hitCount: undefined,
    favCount: 1,
  },
]

export type WidthOrHeight = 128 | 256 | 512 | 640 | 768 | 1024
export enum Text2ImgSchedulerEnum {
  DDIM = 'DDIM',
  K_EULER = 'K_EULER',
  DPMSolverMultistep = 'DPMSolverMultistep',
  K_EULER_ANCESTRAL = 'K_EULER_ANCESTRAL',
  PNDM = 'PNDM',
  KLMS = 'KLMS',
  EULERa = 'EULERa',
  ddim_sampler = 'ddim_sampler',
  p_sampler = 'p_sampler',
  plms_sampler = 'plms_sampler',
}

export type Text2ImgInput = {
  prompt: string
  negative_prompt?: string
  width?: WidthOrHeight
  height?: WidthOrHeight
  ori_width?: WidthOrHeight
  ori_height?: WidthOrHeight
  prior_cf_scale?: number
  prior_steps?: string
  image_dimensions?: string
  num_outputs?: number
  num_inference_steps?: number
  guidance_scale?: number
  batch_size?: number
  scale?: number
  steps?: number
  scheduler?: `${Text2ImgSchedulerEnum}`
  seed?: number
  version?: string
}

export type Text2ImgModel = {
  name: string
  version: string
  description: string
  tag: string
  promptList: Text2ImgInput[]
}

export const text2ImgModelList: Text2ImgModel[] = [
  {
    name: 'openjourney',
    version: '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
    description: 'Stable Diffusion fine tuned on Midjourney v4 images.',
    tag: 'Midjourney v4风格的图片',
    promptList: [
      {
        prompt:
          'mdjrny-v4 style a highly detailed matte painting of a man on a hill watching a rocket launch in the distance by studio ghibli, makoto shinkai, by artgerm, by wlop, by greg rutkowski, volumetric lighting, octane render, 4 k resolution, trending on artstation, masterpiece',
        width: 768,
        height: 768,
        num_outputs: 1,
        guidance_scale: 14,
        num_inference_steps: 50,
        version:
          '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
      },
      {
        prompt:
          'mdjrny-v4 style portrait of female elf, intricate, elegant, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by artgerm and greg rutkowski and alphonse mucha, 8k',
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 7,
        num_inference_steps: 50,
        version:
          '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
      },
      {
        prompt:
          'anatomical correct detailed skull, cyborg head, Dramatic, Dark, Super-Resolution, Evil, Neon Lamp, Cinematic Lighting, Chromatic Aberration, insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed, Unreal Engine',
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 7,
        num_inference_steps: 50,
        seed: 50490,
        version:
          '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
      },
      {
        prompt:
          'mdjrny-v4 style portrait of a gorgeous blond female in the style of stefan kostic, realistic, half body shot, sharp focus, 8 k high definition, insanely detailed, intricate, elegant, art by stanley lau and artgerm, extreme blur flames background',
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 17,
        num_inference_steps: 80,
        seed: 2913619048,
        version:
          '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
      },
      {
        prompt:
          'devil of the old world, awake under the sea, emanating dark energy, terrible presence, arcane magic, intricate artwork . octane render, trending on artstation. cinematic, hyper realism, high detail, octane render, 8k',
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 70,
        seed: 55440,
        version:
          '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
      },
    ],
  },
  {
    name: 'lookbook',
    version: 'afd0956c8dd6a67cbf163411fa9507475e92bd956d473d10751a49b67fb79522',
    description: 'Fashion Diffusion by PromptHero',
    tag: '人像风格的图片',
    promptList: [
      {
        prompt: 'a close up of a cap weared by a man with stubble beard',
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 7,
        num_inference_steps: 150,
        scheduler: Text2ImgSchedulerEnum.EULERa,
        version:
          'afd0956c8dd6a67cbf163411fa9507475e92bd956d473d10751a49b67fb79522',
      },
      {
        prompt: 'a close up of a person wearing a brown shirt',
        width: 512,
        height: 512,
        num_outputs: 1,
        guidance_scale: 7,
        num_inference_steps: 100,
        scheduler: Text2ImgSchedulerEnum.EULERa,
        version:
          'afd0956c8dd6a67cbf163411fa9507475e92bd956d473d10751a49b67fb79522',
      },
      {
        prompt:
          'a photography of a handsome fashion model wearing a beige jacket',
        width: 512,
        height: 640,
        num_outputs: 1,
        guidance_scale: 7,
        num_inference_steps: 150,
        scheduler: Text2ImgSchedulerEnum.EULERa,
        version:
          'afd0956c8dd6a67cbf163411fa9507475e92bd956d473d10751a49b67fb79522',
      },
    ],
  },
  {
    name: 'stable-diffusion-high-resolution',
    version: '231e401da17b34aac8f8b3685f662f7fdad9ce1cf504ec0828ba4aac19f7882f',
    description: 'Detailed, higher-resolution images from Stable Diffusion',
    tag: '富有细节且高分辨率的图片',
    promptList: [
      {
        prompt:
          'female cyborg assimilated by alien fungus, intricate Three-point lighting portrait, by Ching Yeh and Greg Rutkowski, detailed cyberpunk in the style of GitS 1995',
        ori_width: 512,
        ori_height: 512,
        scale: 7.5,
        steps: 10,
        version:
          '231e401da17b34aac8f8b3685f662f7fdad9ce1cf504ec0828ba4aac19f7882f',
      },
      {
        prompt:
          'old harbour, tone mapped, shiny, intricate, cinematic lighting, highly detailed, digital painting, artstation, concept art, smooth, sharp focus, illustration, art by terry moore and greg rutkowski and alphonse mucha',
        ori_width: 512,
        ori_height: 512,
        scale: 7.5,
        steps: 100,
        version:
          '231e401da17b34aac8f8b3685f662f7fdad9ce1cf504ec0828ba4aac19f7882f',
      },
      {
        prompt:
          'painting of girl from behind looking a fleet of imperial ships in the sky, in a meadow of flowers by donato giancola and Eddie Mendoza, elegant, dynamic lighting, beautiful, poster, trending on artstation, poster, anato finnstark, wallpaper, 4 k, award winning, digital art, imperial colors, fantastic view',
        ori_width: 768,
        ori_height: 768,
        scale: 7.5,
        steps: 100,
        version:
          '231e401da17b34aac8f8b3685f662f7fdad9ce1cf504ec0828ba4aac19f7882f',
      },
    ],
  },
  {
    name: 'stable-diffusion',
    version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
    description:
      'A latent text-to-image diffusion model capable of generating photo-realistic images given any text input',
    tag: '写实风格的图片',
    promptList: [
      {
        prompt: 'multicolor hyperspace',
        negative_prompt: '',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        scheduler: Text2ImgSchedulerEnum.DPMSolverMultistep,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
      {
        prompt: 'a gentleman otter in a 19th century portrait',
        negative_prompt: '',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 100,
        scheduler: Text2ImgSchedulerEnum.DPMSolverMultistep,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
      {
        prompt: 'pencil sketch of robots playing poker',
        negative_prompt: '',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 100,
        scheduler: Text2ImgSchedulerEnum.DPMSolverMultistep,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
      {
        prompt: 'phase shift into an era of human+AI art collab',
        negative_prompt: '',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 301,
        scheduler: Text2ImgSchedulerEnum.DPMSolverMultistep,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
      {
        prompt:
          'Beautiful digital matte pastel paint sunflowers poppies chillwave greg rutkowski artstation',
        negative_prompt: '',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        scheduler: Text2ImgSchedulerEnum.DPMSolverMultistep,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
      {
        prompt:
          'Ragdoll cat king wearing a golden crown, intricate, elegant, highly detailed, centered, digital painting, artstation, concept art, smooth, sharp focus, illustration, artgerm, Tomasz Alen Kopera, Peter Mohrbacher, donato giancola, Joseph Christian Leyendecker, WLOP, Boris Vallejo',
        negative_prompt: 'yellow color, nose',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 30,
        scheduler: Text2ImgSchedulerEnum.K_EULER_ANCESTRAL,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
      {
        prompt:
          'an astronaut riding a horse on mars artstation, hd, dramatic lighting, detailed',
        negative_prompt: 'yellow color, nose',
        image_dimensions: '768x768',
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        scheduler: Text2ImgSchedulerEnum.K_EULER,
        version:
          'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      },
    ],
  },
  {
    name: 'kandinsky-2',
    version: '601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f',
    description:
      'text2img model trained on LAION HighRes and fine-tuned on internal datasets',
    tag: '高解析度的图片',
    promptList: [
      {
        prompt: 'red cat, 4k photo',
        prior_cf_scale: 4,
        prior_steps: '5',
        width: 512,
        height: 512,
        guidance_scale: 4,
        num_inference_steps: 100,
        batch_size: 1,
        scheduler: Text2ImgSchedulerEnum.p_sampler,
        version:
          '601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f',
      },
      {
        prompt:
          'a film still of a cute bird in a tree from a 2.5d animated movie, sharp focus',
        prior_cf_scale: 4,
        prior_steps: '5',
        width: 512,
        height: 512,
        guidance_scale: 4,
        num_inference_steps: 100,
        batch_size: 1,
        scheduler: Text2ImgSchedulerEnum.p_sampler,
        version:
          '601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f',
      },
      {
        prompt:
          'a beautiful landscape photo, epic, dawn light, 8k, mountains, river, dramatic, award winning',
        prior_cf_scale: 4,
        prior_steps: '5',
        width: 512,
        height: 512,
        guidance_scale: 4,
        num_inference_steps: 100,
        batch_size: 1,
        scheduler: Text2ImgSchedulerEnum.p_sampler,
        version:
          '601eea49d49003e6ea75a11527209c4f510a93e2112c969d548fbb45b9c4f19f',
      },
    ],
  },
]

export const defaultText2ImgModel = text2ImgModelList[0] as Text2ImgModel

export enum TrainingStatusEnum {
  pending = 'pending',
  succeed = 'succeed',
  errored = 'errored',
  canceled = 'canceled',
}

export enum ModelStatusEnum {
  running = 'running',
  training = 'training',
  pending = 'pending',
  closed = 'closed',
}

export const formatModelStatus = {
  [ModelStatusEnum.running]: {
    colorTheme: 'green',
    text: '运行中',
  },
  [ModelStatusEnum.training]: {
    colorTheme: 'blue',
    text: '训练中',
  },
  [ModelStatusEnum.pending]: {
    colorTheme: 'gray',
    text: '加载中',
  },
  [ModelStatusEnum.closed]: {
    colorTheme: 'red',
    text: '已关闭',
  },
}

export const ModelDataStatusMap: Record<
  RedisModelDataItemType['status'],
  string
> = {
  ready: '训练完成',
  waiting: '训练中',
}

export const defaultModel: ModelSchema = {
  _id: '',
  userId: '',
  name: '',
  avatar: '',
  status: ModelStatusEnum.pending,
  updateTime: Date.now(),
  trainingTimes: 0,
  systemPrompt: '',
  intro: '',
  howToUse: '',
  temperature: 5,
  hitCount: 0,
  favCount: 0,
  service: {
    company: 'openai',
    trainId: '',
    chatModel: ChatModelNameEnum.GPT35,
    modelName: ChatModelNameEnum.GPT35,
  },
  security: {
    domain: ['*'],
    contextMaxLen: 1,
    contentMaxLen: 1,
    expiredTime: 9999,
    maxLoadAmount: 1,
  },
}
