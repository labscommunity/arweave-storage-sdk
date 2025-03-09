import { FaFile } from 'react-icons/fa6'
import { motion } from 'framer-motion'

export default function File({ instance, handleFileClick, handleRigthClick }) {
  return (
    <motion.div
      onClick={() => handleFileClick(instance)}
      whileHover={{ scale: 1.05 }}
      onContextMenu={(e) => handleRigthClick(e, instance)}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-300 p-4 rounded-md h-full text-gray-500 transition-colors"
    >
      <div className="hover:text-inherit text-inherit">
        <FaFile className="w-8 h-8 hover:text-inherit text-inherit" />
      </div>
      <div className="hover:text-inherit text-inherit text-center">
        <h3 className="text-md tracking-wide leading-6">{instance?.name || 'unknown'}</h3>
      </div>
    </motion.div>
  )
}
