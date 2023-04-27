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
          <p>将图像拖放到此处 ...</p>
        ) : (
          <p>可选：将起始图像拖放到此处</p>
        )}
      </div>
    </div>
  )
}
