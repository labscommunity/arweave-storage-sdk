import React from 'react'
import { useDropzone } from 'react-dropzone'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobalStore } from '../store/globalStore'

export default function FileFolderUploader({ isOpen, setIsOpen }) {
  const [files, setFiles] = React.useState([])
  const [createFile] = useGlobalStore((state) => [state.explorerActions.createFile])
  const [isUploading, setIsUploading] = React.useState(false)
  const [showIncompleteFiles, setShowIncompleteFiles] = React.useState(false)
  const onDrop = React.useCallback((acceptedFiles) => {
    // Do something with the files
    console.log({ acceptedFiles })
    setFiles(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase()
    const iconMap = {
      pdf: 'file-earmark-pdf',
      doc: 'file-earmark-word',
      docx: 'file-earmark-word',
      xls: 'file-earmark-excel',
      xlsx: 'file-earmark-excel',
      png: 'file-earmark-image',
      jpg: 'file-earmark-image',
      jpeg: 'file-earmark-image',
      gif: 'file-earmark-image'
    }
    return `bi-${iconMap[extension] || 'file-earmark'}`
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(2) + ' MB'
  }

  async function uploadFiles() {
    console.log({ files })
    if (files.length === 0) return

    setIsUploading(true)
    for (const file of files) {
      try {
        await createFile(file)
      } catch (error) {
        console.error(error)
        if (!showIncompleteFiles) setShowIncompleteFiles(true)
      }
    }
    setIsUploading(false)
    setIsOpen(false)
  }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="bg-slate-900/20 backdrop-blur p-8 fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0, rotate: '0deg' }}
            animate={{ scale: 1, rotate: '0deg' }}
            exit={{ scale: 0, rotate: '0deg' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-xl rounded-xl shadow-lg p-6 mb-6 cursor-default relative overflow-hidden"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Upload Files</h2>
            {files.length === 0 && (
              <div
                className="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer relative"
                id="dropZone"
              >
                <div className="space-y-4">
                  <i className="bi bi-cloud-upload text-5xl text-blue-500"></i>
                  <div {...getRootProps()} onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-gray-700">Drag and drop files here</h3>
                    <p className="text-gray-500 text-sm my-2">or</p>
                    <label className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg">
                      Choose Files
                      <input {...getInputProps()} />
                    </label>
                  </div>
                  <p className="text-sm text-gray-400">Supported files: All common formats</p>
                </div>
              </div>
            )}
            {files.length > 0 && (
              <div id="fileList" className="space-y-3 max-h-[300px] overflow-y-auto w-full">
                {files.map((file, index) => (
                  <div key={index} className="file-card flex items-center space-x-4 w-full">
                    <div className="flex items-center space-x-4 flex-grow">
                      <i className={`bi ${getFileIcon(file.name)} text-2xl text-gray-500`}></i>
                      <div className="file-info">
                        <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {files.length > 0 && (
              <div className="flex items-center mt-8 gap-4">
                <button
                  disabled={isUploading}
                  onClick={() => {
                    setFiles([])
                    setShowIncompleteFiles(false)
                  }}
                  className="border-blue-500 border-[1px] hover:text-white text-blue-500 px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                >
                  Reset
                </button>
                <button
                  disabled={isUploading}
                  onClick={uploadFiles}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
            {showIncompleteFiles && (
              <div className="text-red-500 text-sm mt-4">Some files failed to upload. Please try again.</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
