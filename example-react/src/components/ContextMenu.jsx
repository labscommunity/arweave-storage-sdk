import { FaEye, FaEdit, FaGlobe, FaDownload } from 'react-icons/fa'
import { getArFSClient } from '../utils/getArFSClient'
const ContextMenu = ({ selectedInstance, handleEntityDetailsClick }) => {
  const { id, entityType } = selectedInstance || {}

  function handleInspectViewBlock() {
    if (!id) return

    window.open(`https://viewblock.io/arweave/tx/${id}`, '_blank')
  }

  async function handleDownloadClick() {
    if (!entityType || entityType !== 'file') return

    const arfs = getArFSClient()

    const blob = await arfs.file.decryptFile(selectedInstance)

    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.download = `${selectedInstance.name}` // Set the desired filename for the ZIP file
    downloadLink.style.display = 'none'
    document.body.appendChild(downloadLink)

    // Simulate a click on the download link
    downloadLink.click()

    // Clean up the temporary URL object
    URL.revokeObjectURL(downloadLink.href)

    // Remove the download link from the DOM
    document.body.removeChild(downloadLink)
  }

  return (
    <div className={`z-20 w-80 rounded-md bg-slate-900 text-neutral-300`}>
      <button
        onClick={handleEntityDetailsClick}
        className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center"
      >
        <FaEye />
        <span>View Detail</span>
      </button>
      {entityType && entityType === 'file' && (
        <button
          onClick={handleDownloadClick}
          className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center"
        >
          <FaDownload />
          <span>Download</span>
        </button>
      )}
      <button className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center">
        <FaEdit />
        <span>Rename</span>
      </button>
      <button
        onClick={handleInspectViewBlock}
        className="w-full px-5 py-3 hover:bg-indigo-500 duration-200 flex space-x-4 items-center"
      >
        <FaGlobe />
        <span>Inspect on Viewblock</span>
      </button>
    </div>
  )
}

export default ContextMenu
