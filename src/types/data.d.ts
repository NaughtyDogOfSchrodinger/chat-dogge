import type { DataSchema } from './mongoSchema'

export type DataType = 'QA' | 'abstract' | 'Q'

export interface DataListItem extends DataSchema {
  trainingData: number
  totalData: number
}
