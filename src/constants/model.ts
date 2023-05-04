import type {
  ServiceName,
  ModelDataType,
  ModelSchema,
} from '@/types/mongoSchema'
import type { RedisModelDataItemType } from '@/types/redis'
import { SortOrder } from 'mongoose'

export enum ChatModelNameEnum {
  GPT35 = 'gpt-3.5-turbo',
  VECTOR_GPT = 'VECTOR_GPT',
  GPT3 = 'text-davinci-003',
  VECTOR = 'text-embedding-ada-002',
  IMAGE = 'stable-diffusion',
}

export const ChatModelNameMap = {
  [ChatModelNameEnum.GPT35]: 'gpt-3.5-turbo',
  [ChatModelNameEnum.VECTOR_GPT]: 'gpt-3.5-turbo',
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
    maxToken: -1,
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
