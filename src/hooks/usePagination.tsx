import React, { useState, useCallback, useMemo, useEffect } from 'react'
import type { PagingData } from '@/types'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

export const usePagination = <T = any,>({
  api,
  pageSize = 10,
  params = {},
}: {
  api: (data: any) => any
  pageSize?: number
  params?: Record<string, any>
}) => {
  const [pageNum, setPageNum] = useState(1)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState<T[]>([])
  const maxPage = useMemo(() => Math.ceil(total / pageSize), [pageSize, total])

  const { mutate, isLoading } = useMutation({
    mutationFn: async (num: number = pageNum) => {
      try {
        const res: PagingData<T> = await api({
          pageNum: num,
          pageSize,
          ...params,
        })
        setPageNum(num)
        setTotal(res.total)
        setData(res.data)
      } catch (error: any) {
        toast(error?.message || '获取数据异常', { icon: `🔴` })
        console.log(error)
      }
    },
  })

  useEffect(() => {
    mutate(1)
  }, [mutate])

  const Pagination = useCallback(() => {
    return (
      <div className="flex items-start justify-end py-2">
        <div className="btn-group items-center">
          <button
            disabled={pageNum == 1}
            className="btn-xs btn"
            onClick={() => mutate(pageNum - 1)}
          >
            上一页
          </button>
          <input
            className="input h-5 w-full text-xs"
            defaultValue={pageNum}
            type={'number'}
            min={1}
            max={maxPage}
            onBlur={(e) => {
              const val = +e.target.value
              if (val === pageNum) return
              if (val >= maxPage) {
                mutate(maxPage)
              } else if (val < 1) {
                mutate(1)
              } else {
                mutate(+e.target.value)
              }
            }}
          />
          <button className="btn-xs btn">{maxPage}</button>
          <button
            className="btn-xs btn"
            disabled={pageNum === maxPage}
            onClick={() => mutate(pageNum + 1)}
          >
            下一页
          </button>
        </div>
      </div>
    )
  }, [maxPage, mutate, pageNum])

  return {
    pageNum,
    pageSize,
    total,
    data,
    isLoading,
    Pagination,
    getData: mutate,
  }
}
