import { FlameIcon, HeartIcon } from 'lucide-react'
import React from 'react'

const AppListLoading = () => {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => (
        <div key={index} className="card w-auto bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="mx-auto flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-3xl">
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            </div>
            <div className="card-title justify-between">
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              <div className="badge badge-xs modal-middle border-white bg-white text-black">
                <FlameIcon className="h-8 w-8 fill-[#f25207] text-[#f25207]" />
                <p className="text-sm text-black">
                  &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                </p>
              </div>
              {/*<div className="badge-secondary badge">NEW</div>*/}
            </div>
            <p className="text-sm text-gray-500">
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
            </p>
            <div className="card-actions modal-middle justify-between">
              <div
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-7 sm:w-7"
                onClick={(event) => event.preventDefault()}
              />
              {/*<p className="text-xs text-black"> {app.userId.email}</p>*/}
              <div className="flex gap-1">
                <HeartIcon
                  onClick={(event) => {
                    event.preventDefault()
                  }}
                  className={`fill-[#eb3313]hover:fill-[#eb3313]  h-5 w-5 text-[#eb3313] hover:scale-110`}
                  aria-hidden="true"
                />
                {/*<p className="text-sm text-black"> {app.favCount}</p>*/}
              </div>
            </div>
          </div>
        </div>
      ))}
    </ul>
  )
}

export default AppListLoading
