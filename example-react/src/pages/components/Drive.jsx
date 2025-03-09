import { FaHardDrive } from 'react-icons/fa6'
import { motion } from 'framer-motion'

export default function Drive({ instance, handleDriveClick, handleRigthClick }) {
  return (
    <motion.div
      onClick={() => handleDriveClick(instance)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onContextMenu={(e) => handleRigthClick(e, instance)}
      onBlur={() => console.log('test')}
      className="cursor-pointer flex flex-col items-center gap-2 hover:bg-gray-300 p-4 rounded-md h-full text-gray-500 transition-colors"
    >
      <div className="hover:text-inherit text-inherit">
        <FaHardDrive className="w-8 h-8 hover:text-inherit text-inherit" />
      </div>
      <div className="hover:text-inherit text-inherit text-center">
        <h3 className="text-md tracking-wide leading-6">{instance?.name || 'unknown'}</h3>
      </div>
    </motion.div>
  )
}
