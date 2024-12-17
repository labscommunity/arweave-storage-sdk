import { FaFolder } from 'react-icons/fa6'

import { motion } from 'framer-motion'

export default function Folder({ instance, handleFolderClick, handleRigthClick }) {
  return (
    <motion.div
      onClick={() => handleFolderClick(instance)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onContextMenu={(e) => handleRigthClick(e, instance)}
      className="cursor-pointer flex flex-col items-center gap-2 hover:bg-slate-700 p-4 rounded-md h-full text-neutral-200 hover:text-white transition-colors"
    >
      <div className="hover:text-inherit text-inherit">
        <FaFolder className="w-8 h-8 hover:text-inherit text-inherit" />
      </div>
      <div className="hover:text-inherit text-inherit text-center">
        <h3 className="text-md tracking-wide leading-6">{instance?.name || 'unknown'}</h3>
      </div>
    </motion.div>
  )
}
