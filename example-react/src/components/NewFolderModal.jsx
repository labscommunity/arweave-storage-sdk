import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useGlobalStore } from '../store/globalStore'
import SVG from 'react-inlinesvg'
const NewFolderModal = ({ isOpen, setIsOpen }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [name, setName] = React.useState('')
  const [createFolder] = useGlobalStore((state) => [state.explorerActions.createFolder])

  async function handleSubmit() {
    if (!name) return

    try {
      setIsSubmitting(true)
      await createFolder(name)

      setIsOpen(false)
    } catch (error) {
      console.log({ error })
    } finally {
      setIsSubmitting(false)
    }
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
            className="bg-white rounded-lg card-shadow w-full max-w-md p-6 relative overflow-hidden"
          >
            <div className="bg-white rounded-lg card-shadow w-full max-w-md p-6">
              <div className="text-center mb-6">
                <div className="flex w-full items-center justify-center">
                  <SVG className="w-12 h-12" src="/logo.svg" />
                </div>

                {/* <i className="bi bi-hdd-stack text-4xl text-[#0061FF]"></i> */}
                <h2 className="text-2xl font-bold text-gray-800 mt-2">Create a New Folder</h2>
              </div>

              <form id="driveForm" className="space-y-4">
                <div>
                  <label htmlFor="driveName" className="block text-sm font-medium text-gray-700 mb-1">
                    Folder Name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    id="driveName"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0061FF] focus:border-[#0061FF] outline-none transition-colors"
                    placeholder="Enter folder name"
                    required
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!name || isSubmitting}
                  type="submit"
                  className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-[#0061FF] text-white py-2 px-4 rounded-md hover:bg-[#0061FF] transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <i className="bi bi-plus-circle"></i>
                  {isSubmitting ? 'Creating...' : 'Create Folder'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NewFolderModal
