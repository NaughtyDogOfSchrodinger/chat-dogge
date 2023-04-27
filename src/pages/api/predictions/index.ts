import { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'
import { authToken } from '@/service/utils/tools'
import { pushChatBill, pushImageBill } from '@/service/events/pushBill'
import { ChatModelNameEnum } from '@/constants/model'

const API_HOST = process.env.REPLICATE_API_HOST || 'https://api.replicate.com'
const addBackgroundToPNG = require('lib/add-background-to-png')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const { authorization } = req.headers
    if (!authorization) {
      throw new Error('请先登录')
    }
    // remnove null and undefined values
    req.body = Object.entries(req.body).reduce(
      // @ts-ignore
      (a, [k, v]) => (v == null ? a : ((a[k] = v), a)),
      {}
    )

    if (req.body.mask) {
      req.body.mask = addBackgroundToPNG(req.body.mask)
    }

    const body = JSON.stringify({
      // Pinned to a specific version of Stable Diffusion, fetched from:
      // https://replicate.com/stability-ai/stable-diffusion
      version:
        'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
      input: req.body,
    })

    const response = await fetch(`${API_HOST}/v1/predictions`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    })

    if (response.status !== 201) {
      let error = await response.json()
      jsonRes(res, {
        code: 500,
        error: error.detail,
      })
      return
    }

    const prediction = await response.json()
    jsonRes(res, {
      data: prediction,
    })
    const userId = await authToken(authorization)
    // 只有使用平台的 key 才计费
    pushImageBill({
      isPay: true,
      modelName: ChatModelNameEnum.IMAGE,
      userId,
    })
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
