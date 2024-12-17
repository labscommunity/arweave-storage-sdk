import { motion } from 'framer-motion'

const BarLoader = () => {
  const variants = {
    initial: {
      scaleY: 0.5,
      opacity: 0
    },
    animate: {
      scaleY: 1,
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: 'mirror',
        duration: 1,
        ease: 'circIn'
      }
    }
  }
  return (
    <motion.div
      transition={{
        staggerChildren: 0.25
      }}
      initial="initial"
      animate="animate"
      className="flex gap-1"
    >
      <motion.div variants={variants} className="h-6 w-1 bg-indigo-600" />
      <motion.div variants={variants} className="h-6 w-1 bg-indigo-600" />
      <motion.div variants={variants} className="h-6 w-1 bg-indigo-600" />
      <motion.div variants={variants} className="h-6 w-1 bg-indigo-600" />
      <motion.div variants={variants} className="h-6 w-1 bg-indigo-600" />
    </motion.div>
  )
}

export default BarLoader
