import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

export default function Dropzone(props: any) {
  const onImageDropped = props.onImageDropped
  const onDrop = useCallback(
    // @ts-ignore
    (acceptedFiles) => {
      onImageDropped(acceptedFiles[0])
    },
    [onImageDropped]
  )
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  if (props.predictions.length) return null

  if (props.userUploadedImage) return null

  return (
    <div
      className="absolute z-50 flex h-full h-full w-full w-full cursor-pointer select-none text-center text-sm text-gray-500"
      {...getRootProps()}
    >
      <div className="m-auto">
        <input {...getInputProps()} />
        {isDragActive ? (
          <button className="btn">选择图片 ...</button>
        ) : (
          <button className="btn">可选：选择图片</button>
        )}
      </div>
    </div>
  )
}
