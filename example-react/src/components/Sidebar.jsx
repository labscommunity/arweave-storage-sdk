import SVG from 'react-inlinesvg'
import { FaPlus } from 'react-icons/fa6'
import NewOptionsList from './NewOptionsList'
import React from 'react'
import NewFolderModal from './NewFolderModal'
import FileFolderUploader from './FileFolderUploader'
import UploadFile from './UploadFile'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

const SideNav = () => {
  const { pathname } = useLocation()
  const [isNewOptionsListOpen, setIsNewOptionsListOpen] = React.useState(false)
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = React.useState(false)
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = React.useState(false)
  const [isUploadFileModalOpen, setIsUploadFileModalOpen] = React.useState(false)
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isNewOptionsListOpen && !event.target.closest('#contextMenu')) {
        setIsNewOptionsListOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNewOptionsListOpen])

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
      <div className="mb-8 flex items-center gap-3">
        <SVG className="w-12 h-12" src="/logo.svg" />
        <span className="text-xl font-bold text-black">CAPSULE</span>
      </div>

      <nav className="space-y-2">
        <div className="relative">
          <button
            onClick={() => setIsUploadFileModalOpen(true)}
            className="flex items-center bg-[#0061FF] py-2 px-6 rounded-lg text-white mb-4"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Upload File
          </button>
          {isNewOptionsListOpen && (
            <NewOptionsList
              setIsNewFolderModalOpen={setIsNewFolderModalOpen}
              setIsFileUploadModalOpen={setIsFileUploadModalOpen}
            />
          )}
        </div>

        <Link to="/" className={clsx(
            'flex items-center text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-lg',
            pathname === '/' && 'bg-gray-100'
          )}
        >
          <i className="bi bi-folder mr-3"></i>
          Files
        </Link>
        <Link to="/arfs" className={clsx(
            'flex items-center text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-lg',
            pathname === '/arfs' && 'bg-gray-100'
          )}
        >
          <i className="bi bi-hdd mr-3"></i>
          Drive
        </Link>
        <a href="#" className={clsx(
            'flex items-center text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-lg',
            pathname === '/recents' && 'bg-gray-100'
          )}
        >
          <i className="bi bi-clock-history mr-3"></i>
          Recents
        </a>
      </nav>
      <UploadFile isOpen={isUploadFileModalOpen} setIsOpen={setIsUploadFileModalOpen} />
      <NewFolderModal isOpen={isNewFolderModalOpen} setIsOpen={setIsNewFolderModalOpen} />
      <FileFolderUploader isOpen={isFileUploadModalOpen} setIsOpen={setIsFileUploadModalOpen} />
    </div>
  )
}

export default SideNav
