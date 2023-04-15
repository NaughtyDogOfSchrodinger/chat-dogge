import { Model, model, Model as MongoModel, models, Schema } from 'mongoose'
import { ModelUserRelSchema, UserModelSchema } from '@/types/mongoSchema'

const ModelUserRelSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  modelId: {
    type: Schema.Types.ObjectId,
    ref: 'model',
    required: true,
  },
})
// @ts-ignore
export const ModelUserRel: MongoModel<ModelUserRelSchema> =
  models['modelUserRel'] || model('modelUserRel', ModelUserRelSchema)
