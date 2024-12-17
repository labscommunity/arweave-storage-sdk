import { FiEdit, FiChevronDown, FiPlusSquare } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useState } from 'react'
import NewDriveModal from './NewDriveModal'
import NewFolderModal from './NewFolderModal'
import NewFileModal from './NewFileModal'

const ArFSActionsDropDown = () => {
  const [openDropDown, setOpenDropDown] = useState(false)
  const [openDriveModal, setOpenDriveModal] = useState(false)
  const [openFolderModal, setOpenFolderModal] = useState(false)
  const [openFileModal, setOpenFileModal] = useState(false)

  function handleDriveModalOpen() {
    setOpenDropDown(false)
    setOpenDriveModal(true)
  }

  function handleFolderModalOpen() {
    setOpenDropDown(false)
    setOpenFolderModal(true)
  }

  function handleFileModalOpen() {
    setOpenDropDown(false)
    setOpenFileModal(true)
  }

  return (
    <motion.div animate={openDropDown ? 'open' : 'closed'} className="relative">
      <button
        onClick={() => setOpenDropDown((pv) => !pv)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-indigo-50 bg-indigo-500 hover:bg-indigo-500 transition-colors"
      >
        <span className="font-medium text-sm">ArFS Actions</span>
        <motion.span variants={iconVariants}>
          <FiChevronDown />
        </motion.span>
      </button>

      <motion.ul
        initial={wrapperVariants.closed}
        variants={wrapperVariants}
        style={{ originY: 'top', translateX: '-50%' }}
        className="flex flex-col gap-2 p-2 rounded-lg bg-white shadow-xl absolute top-[120%] left-[25%] w-48 overflow-hidden"
      >
        <Option setOpen={handleDriveModalOpen} Icon={FiPlusSquare} text="New Drive" />
        <Option setOpen={handleFolderModalOpen} Icon={FiPlusSquare} text="New Folder" />
        <Option setOpen={handleFileModalOpen} Icon={FiEdit} text="New File" />
      </motion.ul>
      <NewDriveModal isOpen={openDriveModal} setIsOpen={setOpenDriveModal} />
      <NewFolderModal isOpen={openFolderModal} setIsOpen={setOpenFolderModal} />
      <NewFileModal isOpen={openFileModal} setIsOpen={setOpenFileModal} />
    </motion.div>
  )
}

const Option = ({ text, Icon, setOpen }) => {
  return (
    <motion.li
      variants={itemVariants}
      onClick={() => setOpen()}
      className="flex items-center gap-2 w-full p-2 text-sm font-medium whitespace-nowrap rounded-md hover:bg-indigo-100 text-slate-700 hover:text-indigo-500 transition-colors cursor-pointer"
    >
      <motion.span variants={actionIconVariants}>
        <Icon />
      </motion.span>
      <span>{text}</span>
    </motion.li>
  )
}

export default ArFSActionsDropDown

const wrapperVariants = {
  open: {
    scaleY: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  },
  closed: {
    scaleY: 0,
    transition: {
      when: 'afterChildren',
      staggerChildren: 0.1
    }
  }
}

const iconVariants = {
  open: { rotate: 180 },
  closed: { rotate: 0 }
}

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: {
      when: 'beforeChildren'
    }
  },
  closed: {
    opacity: 0,
    y: -15,
    transition: {
      when: 'afterChildren'
    }
  }
}

const actionIconVariants = {
  open: { scale: 1, y: 0 },
  closed: { scale: 0, y: -7 }
}
