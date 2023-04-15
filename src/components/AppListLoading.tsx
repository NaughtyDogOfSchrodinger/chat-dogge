import { FlameIcon, HeartIcon } from 'lucide-react'
import Link from 'next/link'

const AppListLoading = () => {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
    >
      {[1, 2, 3].map((index) => (
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
              <div>
                <HeartIcon
                  className="h-5 w-5 text-[#eb3313] hover:fill-[#eb3313]"
                  aria-hidden="true"
                />
              </div>
              <Link href="#" className="btn-sm btn bg-black text-white">
                &nbsp; &nbsp; &nbsp; &nbsp;
              </Link>
            </div>
          </div>
        </div>
      ))}
    </ul>
  )
}

export default AppListLoading
