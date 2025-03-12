import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

const EntityDetailsModal = ({ isOpen, setIsOpen, selectedEntity }) => {
  const [entityTags, setEntityTags] = React.useState([])
  const [entityMetaData, setEntityMetaData] = React.useState({})

  React.useEffect(() => {
    if (selectedEntity) {
      const tags = selectedEntity.toArweaveTags()
      const metaData = selectedEntity.getMetaData()

      setEntityTags(tags)
      setEntityMetaData(metaData)
    }
  }, [selectedEntity])

  function handleInspectViewBlock() {
    if (!selectedEntity) return

    window.open(`https://viewblock.io/arweave/tx/${selectedEntity.id}`, '_blank')
  }

  const { entityType } = selectedEntity || {}
  console.log(JSON.stringify(entityMetaData, null, 4))
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
            className="bg-white text-black p-6 rounded-lg w-full max-w-xl shadow-xl cursor-default relative overflow-hidden"
          >
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-center mb-6 capitalize">{entityType} Details</h3>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold">Tags</h2>
                <div className="flex flex-col gap-4 text-black p-4 border-[1px] border-gray-200 rounded-md">
                  {entityTags.map((tag, idx) => (
                    <div key={idx + 1} className="flex gap-4 items-center">
                      <span className="bg-gray-300 px-4 py-1 rounded-md">{tag.name}</span>
                      <span>{tag.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <h2 className="text-xl font-bold">Data</h2>
                <pre className="w-full gap-4 overflow-x-auto text-black p-4 bg-gray-200 rounded-md">
                  {JSON.stringify(entityMetaData, null, 4)}
                </pre>
              </div>
              <div className="flex gap-2 mt-8">
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-transparent hover:bg-white/10 transition-colors border-[#0061FF] border-[2px] text-[#0061FF] font-semibold w-full py-2 rounded"
                >
                  Close
                </button>
                <button
                  onClick={handleInspectViewBlock}
                  className="text-white hover:opacity-90 transition-opacity bg-[#0061FF] items-center font-semibold w-full py-2 rounded flex justify-center"
                >
                  Viewblock
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EntityDetailsModal
