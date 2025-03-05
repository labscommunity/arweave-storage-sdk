import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { FiFile } from 'react-icons/fi'
import { useGlobalStore } from '../store/globalStore'
import BarLoader from './BarLoader'
import toast from 'react-hot-toast'

const UploadFile = ({ isOpen, setIsOpen }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState('')
  const [selectedFile, setSelectedFile] = React.useState(null)
  const fileRef = React.useRef(null)
  const [estimatesUSDC, setEstimatesUSDC] = React.useState('')
  const [estimatesUSD, setEstimatesUSD] = React.useState('')
  const [uploadFile, fetchProfile, getEstimates] = useGlobalStore((state) => [
    state.explorerActions.uploadFile,
    state.authActions.fetchProfile,
    state.explorerActions.getEstimates
  ])

  React.useEffect(() => {
    if (selectedFile) {
      getCostEstimates()
    }
  }, [selectedFile])

  async function handleSubmit() {
    if (!name) return

    setIsSubmitting(true)
    try {
      await uploadFile(selectedFile)
      await fetchProfile()
    } catch (error) {
      toast.error(error.message)
    }
    setIsSubmitting(false)

    setIsOpen(false)
  }

  function handleFileChange(evt) {
    const file = evt.target.files[0]

    setSelectedFile(file)
    setName(file.name)
  }

  async function getCostEstimates() {
    const response = await getEstimates(selectedFile.size)
    setEstimatesUSDC(response.usdc.amount)
    setEstimatesUSD(response.usd)
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
            className="bg-white text-gray-500 p-6 py-8 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="bg-white w-16 h-16 mb-2 rounded-full text-3xl text-indigo-600 grid place-items-center mx-auto">
                <FiFile className="text-gray-500 w-16 h-16" />
              </div>
              <h3 className="text-3xl font-bold text-center mb-2">Lets upload a file</h3>
              <div className="flex flex-col mt-6">
                <div className="flex gap-2">
                  <input
                    value={name}
                    disabled
                    type="text"
                    placeholder="No file selected"
                    className={`bg-gray-200 w-[70%] h-10 transition-colors duration-[750ms] placeholder-gray-500/70 p-2 rounded-md focus:outline-0`}
                  />
                  <input type="file" hidden ref={fileRef} onChange={handleFileChange} />
                  <button
                    onClick={() => fileRef.current.click()}
                    className="flex items-center h-10 bg-[#0061FF] py-2 px-6 rounded-lg text-white mb-4"
                  >
                    Select file
                  </button>
                </div>
                {estimatesUSDC && (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="flex justify-between text-sm w-full">
                      <p>Uploading this file will cost you</p>
                      <p>
                        {estimatesUSDC} USDC (US${parseFloat(estimatesUSD).toFixed(6)})
                      </p>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent border border-gray-200 hover:bg-gray-200/10 transition-colors text-gray-500 font-semibold w-full py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="text-white hover:opacity-90 transition-opacity bg-[#0061FF] font-semibold w-full py-2 rounded flex justify-center"
                >
                  {!isSubmitting && 'Upload'}
                  {isSubmitting && <BarLoader />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default UploadFile
