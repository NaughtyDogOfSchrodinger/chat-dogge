import { getToken } from '../utils/user'
interface StreamFetchProps {
  url: string
  data: any
  onMessage: (text: string) => void
  abortSignal: AbortController
}
export const streamFetch = ({
  url,
  data,
  onMessage,
  abortSignal,
}: StreamFetchProps) =>
  new Promise(async (resolve, reject) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getToken() || '',
      },
      body: JSON.stringify(data),
      signal: abortSignal.signal,
    })
    // This data is a ReadableStream
    const ddd = res.body
    if (!ddd) {
      return
    }

    const reader = ddd.getReader()
    const decoder = new TextDecoder()
    let done = false
    let count = 0
    let lastMessage = ''
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      lastMessage = lastMessage + chunkValue
      count++
      onMessage(chunkValue)
    }
    // onMessage(lastMessage)

    resolve(lastMessage)
    //   const reader = res.body?.getReader()
    //   if (!reader) return
    //   const decoder = new TextDecoder()
    //   let responseText = ''
    //
    //   const read = async () => {
    //     const { done, value } = await reader?.read()
    //     if (done) {
    //       if (res.status === 200) {
    //         resolve(responseText)
    //       } else {
    //         try {
    //           const parseError = JSON.parse(responseText)
    //           reject(parseError?.message || '请求异常')
    //         } catch (err) {
    //           reject('请求异常')
    //         }
    //       }
    //
    //       return
    //     }
    //     const text = decoder.decode(value).replace(/<br\/>/g, '\n')
    //     res.status === 200 && onMessage(text)
    //     responseText += text
    //     read()
    //   }
    //   read()
    // } catch (err: any) {
    //   console.log(err, '====')
    //   reject(typeof err === 'string' ? err : err?.message || '请求异常')
    // }
  })
