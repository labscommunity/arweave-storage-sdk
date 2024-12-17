import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiLoader } from 'react-icons/fi'

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
            className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-6 rounded-lg w-full max-w-lg shadow-xl cursor-default relative overflow-hidden"
          >
            <FiLoader className="text-white/10 rotate-12 text-[250px] absolute z-0 -top-24 -left-24" />
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-center my-2">Syncing your files. Hang on!</h3>
              <div className="flex py-14 justify-center">
                <ShuffleLoader />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const NUM_BLOCKS = 5
const BLOCK_SIZE = 32

const DURATION_IN_MS = 175
const DURATION_IN_SECS = DURATION_IN_MS * 0.001

const TRANSITION = {
  ease: 'easeInOut',
  duration: DURATION_IN_SECS
}

const ShuffleLoader = () => {
  const [blocks, setBlocks] = useState(Array.from(Array(NUM_BLOCKS).keys()).map((n) => ({ id: n })))
  const [scope, animate] = useAnimate()

  useEffect(() => {
    shuffle()
  }, [])

  const shuffle = async () => {
    const condition = true

    while (condition) {
      const [first, second] = pickTwoRandom()

      animate(`[data-block-id="${first.id}"]`, { y: -BLOCK_SIZE }, TRANSITION)

      await animate(`[data-block-id="${second.id}"]`, { y: BLOCK_SIZE }, TRANSITION)

      await delay(DURATION_IN_MS)

      setBlocks((pv) => {
        const copy = [...pv]

        const indexForFirst = copy.indexOf(first)
        const indexForSecond = copy.indexOf(second)

        copy[indexForFirst] = second
        copy[indexForSecond] = first

        return copy
      })

      await delay(DURATION_IN_MS * 2)

      animate(`[data-block-id="${first.id}"]`, { y: 0 }, TRANSITION)

      await animate(`[data-block-id="${second.id}"]`, { y: 0 }, TRANSITION)

      await delay(DURATION_IN_MS)
    }
  }

  const pickTwoRandom = () => {
    const index1 = Math.floor(Math.random() * blocks.length)
    let index2 = Math.floor(Math.random() * blocks.length)

    while (index2 === index1) {
      index2 = Math.floor(Math.random() * blocks.length)
    }

    return [blocks[index1], blocks[index2]]
  }

  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  return (
    <div ref={scope} className="flex divide-x divide-neutral-950">
      {blocks.map((b) => {
        return (
          <motion.div
            layout
            data-block-id={b.id}
            key={b.id}
            transition={TRANSITION}
            style={{
              width: BLOCK_SIZE,
              height: BLOCK_SIZE
            }}
            className="bg-white"
          />
        )
      })}
    </div>
  )
}

export default SyncingModal
