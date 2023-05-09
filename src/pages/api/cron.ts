import { NextApiHandler } from 'next'
import cron from 'node-cron'
import { connectToDatabase, Model } from '@/service/mongo'
import howToUse from '@/utils/howToUse'
import { modelList } from '@/constants/model'
import { ModelSchema } from '@/types/mongoSchema'

const handler: NextApiHandler = async (req, res) => {
  // Check for secret to confirm this is a valid request
  cron.schedule('0 */12 * * *', async () => {
    console.log('执行任务')
    // 这里写你的后端定时任务逻辑
    await connectToDatabase()
    const models = await Model.find()
    for (const model of models) {
      const modelItem = modelList.find(
        (item) => item.model === model.service.modelName
      )

      if (!modelItem) {
        continue
      }
      const how = await howToUse({
        modelName: model.name,
        modelItem,
        userId: undefined,
        description: model.intro,
        query: true,
      })
      await Model.findByIdAndUpdate<ModelSchema>(model.id, {
        howToUse: how,
      })
    }
  })

  res.status(200).json({ message: '定时任务已启动' })
}

export default handler
