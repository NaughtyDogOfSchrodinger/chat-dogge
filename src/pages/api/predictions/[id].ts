import { NextApiRequest, NextApiResponse } from 'next'
import { jsonRes } from '@/service/response'

const API_HOST = process.env.REPLICATE_API_HOST || 'https://api.replicate.com'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    const response = await fetch(`${API_HOST}/v1/predictions/${req.query.id}`, {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    if (response.status !== 200) {
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
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err,
    })
  }
}
