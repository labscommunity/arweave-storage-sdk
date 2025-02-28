// import React from 'react'

import SideNav from './Sidebar'
// import { useGlobalStore } from '../store/globalStore'
// import SVG from 'react-inlinesvg'
// import { ConnectButton } from '@rainbow-me/rainbowkit';
export default function Layout({ children }) {
  // const [name, setName] = React.useState('')
  // const [isCreatingDrive, setIsCreatingDrive] = React.useState(false)
  // const [fetchingDrive, setFetchingDrive] = React.useState(true)

  // const [address, selectedDrive,  syncAllUserDrives, createDrive] = useGlobalStore((state) => [
  //   state.authState.address,
  //   state.explorerState.selectedDrive,
  //   state.explorerActions.syncAllUserDrives,
  //   state.explorerActions.createDrive
  // ])


  // React.useEffect(() => {
  //   if (address && !selectedDrive) {
  //     fetchAndSetDrive()
  //   }
  // }, [address, selectedDrive])

  // async function fetchAndSetDrive() {
  //   try {
  //     await syncAllUserDrives()
  //   } catch (error) {
  //     console.log({ error })
  //   }

  //   setFetchingDrive(false)
  // }

  // async function handleCreateDrive() {
  //   if (!name) return

  //   try {
  //     setIsCreatingDrive(true)
  //     await createDrive(name, false)
  //   } catch (error) {
  //     console.log({ error })
  //   } finally {
  //     setIsCreatingDrive(false)
  //   }
  // }

  // if (!address) {
  //   return (
  //     <div className="flex min-h-screen w-screen bg-gray-50 items-center justify-center ">
  //       <ConnectButton />
  //     </div>
  //   )
  // }

  // if (address && !selectedDrive && fetchingDrive) {
  //   return (
  //     <div className="flex min-h-screen w-screen bg-gray-50 items-center justify-center ">
  //       <div className="text-center mb-6 animate-pulse ">
  //         <div className="flex w-full items-center justify-center animate-spin">
  //           <SVG className="w-24 h-24" src="/logo.svg" />
  //         </div>
  //         <h1 className="text-2xl font-bold text-gray-800 mt-8">Fetching Capsule Drive</h1>
  //       </div>
  //     </div>
  //   )
  // }

  // if (address && !selectedDrive && !fetchingDrive) {
  //   return (
  //     <div className="flex min-h-screen w-screen bg-gray-50 items-center justify-center ">
  //       <div className="bg-white rounded-lg card-shadow w-full max-w-md p-6">
  //         <div className="text-center mb-6">
  //           <div className="flex w-full items-center justify-center">
  //             <SVG className="w-12 h-12" src="/logo.svg" />
  //           </div>

  //           {/* <i className="bi bi-hdd-stack text-4xl text-[#0061FF]"></i> */}
  //           <h2 className="text-2xl font-bold text-gray-800 mt-2">Setup Capsule Drive</h2>
  //         </div>

  //         <form id="driveForm" className="space-y-4">
  //           <div>
  //             <label htmlFor="driveName" className="block text-sm font-medium text-gray-700 mb-1">
  //               Drive Name
  //             </label>
  //             <input
  //               value={name}
  //               onChange={(e) => setName(e.target.value)}
  //               type="text"
  //               id="driveName"
  //               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#0061FF] focus:border-[#0061FF] outline-none transition-colors"
  //               placeholder="Enter drive name"
  //               required
  //             />
  //           </div>

  //           <button
  //             onClick={handleCreateDrive}
  //             disabled={!name || isCreatingDrive}
  //             type="submit"
  //             className="w-full disabled:opacity-50 disabled:cursor-not-allowed bg-[#0061FF] text-white py-2 px-4 rounded-md hover:bg-[#0061FF] transition-colors duration-200 flex items-center justify-center gap-2"
  //           >
  //             <i className="bi bi-plus-circle"></i>
  //             {isCreatingDrive ? 'Creating...' : 'Create Drive'}
  //           </button>
  //         </form>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="flex min-h-screen w-screen bg-gray-50">
      <SideNav />
      {children}
    </div>
  )
}
