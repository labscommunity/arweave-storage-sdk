import { AnimatePresence, motion } from 'framer-motion'
import { FadeLoader } from 'react-spinners'

const SyncingModal = ({ isOpen, setIsOpen }) => {
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
            className="bg-transparent text-white p-6 rounded-lg w-full max-w-lg cursor-default relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex py-8 justify-center">
                <FadeLoader color="#0061FF" />
              </div>
              <h3 className="text-xl font-medium text-center text-black/40">Syncing your files. Hang on!</h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SyncingModal
