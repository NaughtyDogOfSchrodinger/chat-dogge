import React, { useState } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'

const Test = () => {
  const [sliderValue, setSliderValue] = useState(50)

  function handleSliderChange(event: any) {
    setSliderValue(event.target.value)
  }
  return (
    <>
      <main className="w-full bg-slate-50 bg-gradient-to-br  from-indigo-50 via-white to-cyan-100 pb-20 pt-10">
        <div className="container mx-auto overflow-x-auto">
          <div className="flex w-full flex-col lg:flex-row">
            <div className="h-100 card rounded-box grid flex-grow place-items-center bg-white pb-20 pt-10">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">模型ID</span>
                </label>
                <input
                  type="text"
                  placeholder="modelID"
                  className="input-bordered input w-full max-w-xs"
                  disabled={true}
                />
                <label className="label">
                  <span className="label-text">模型名称</span>
                </label>
                <input
                  type="text"
                  placeholder="model"
                  className="input-bordered input w-full max-w-xs"
                />
                <label className="label">
                  <span className="label-text">Temprature</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={handleSliderChange}
                  className="range"
                />
                <label className="label">
                  <span className="label-text">
                    越高发散能力越强，越低越严谨
                  </span>
                </label>
              </div>
            </div>
            <div className="divider lg:divider-horizontal"></div>
            <div className="h-200 card rounded-box grid flex-grow place-items-center bg-white">
              <div className="form-control w-full max-w-xs">
                <label className="label">
                  <span className="label-text">系统指令</span>
                </label>
                <textarea
                  className="textarea-bordered textarea h-40 resize-none"
                  placeholder="system prompt"
                ></textarea>
              </div>
            </div>
          </div>
          <div className="divider"></div>
          <div className="card rounded-box grid w-full flex-grow overflow-x-auto bg-white py-5 px-5">
            <div className="flex items-start justify-between py-1">
              <p className=" text-xl text-sm">模型数据: 141组（测试版本）</p>
              <p>
                <Link className="btn-xs btn mr-2" href="#">
                  刷新
                </Link>
                <Link className="btn-xs btn mr-2" href="#">
                  导入
                </Link>
                <button className="btn-xs btn">导出</button>
              </p>
            </div>
            <table className="table-compact table w-full border-collapse border border-gray-100">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Q</th>
                  <th>A</th>
                  <th>status</th>
                  <th>setting</th>
                  <th>delete</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="text-center">1</th>
                  <td>Cy Ganderton</td>
                  <td>Quality Control Specialist</td>
                  <td>Blue</td>
                  <th>
                    <Link className="link-neutral link" href="#">
                      编辑
                    </Link>
                  </th>
                  <th>
                    <button className="btn-error btn-xs btn">删除</button>
                  </th>
                </tr>
                <tr>
                  <th className="text-center">2</th>
                  <td>Hart Hagerty</td>
                  <td>Desktop Support Technician</td>
                  <td>Purple</td>
                  <th>
                    <Link className="link-neutral link" href="#">
                      编辑
                    </Link>
                  </th>
                  <th>
                    <button className="btn-error btn-xs btn">删除</button>
                  </th>
                </tr>
                <tr>
                  <th className="text-center">3</th>
                  <td>Brice Swyre</td>
                  <td>Tax Accountant</td>
                  <td>Red</td>
                  <th>
                    <Link className="link-neutral link" href="#">
                      编辑
                    </Link>
                  </th>
                  <th>
                    <button className="btn-error btn-xs btn">删除</button>
                  </th>
                </tr>
              </tbody>
            </table>
            <div className="flex items-start justify-end py-2">
              <div className="btn-group">
                <button className="btn-xs btn">1</button>
                <button className="btn-xs btn">2</button>
                <button className=" btn-disabled btn-xs btn">...</button>
                <button className=" btn-xs btn">99</button>
                <button className=" btn-xs btn">100</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default Test
