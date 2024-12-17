import { FaFolderPlus } from 'react-icons/fa6'
import { FaFileUpload, FaEllipsisH } from 'react-icons/fa'
import { RiFolderUploadFill } from 'react-icons/ri'

export default function NewOptionsList({ setIsNewFolderModalOpen, setIsFileUploadModalOpen }) {
  return (
    <div
      id="contextMenu"
      className="context-menu w-64 bg-slate-50 border border-gray-200 shadow-lg absolute top-4 left-4"
    >
      <div className="py-2">
        <div
          onClick={() => setIsNewFolderModalOpen(true)}
          className="menu-item px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-100"
        >
          <FaFolderPlus className="w-4 h-4" />
          <span>New folder</span>
        </div>
        <hr className="my-2" />

        <div
          onClick={() => setIsFileUploadModalOpen(true)}
          className="menu-item px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-100"
        >
          <FaFileUpload className="w-4 h-4" />
          <span>File upload</span>
        </div>
        <div
          onClick={() => setIsFileUploadModalOpen(true)}
          className="menu-item px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-100"
        >
          <RiFolderUploadFill className="w-4 h-4" />
          <span>Folder upload</span>
        </div>
        <hr className="my-2" />

        <div className="menu-item px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-100">
          <FaEllipsisH className="w-4 h-4" />
          <span>More</span>
          <i className="bi bi-chevron-right ml-auto"></i>
        </div>
      </div>
    </div>
  )
}
