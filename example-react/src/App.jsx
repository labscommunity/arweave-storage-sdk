import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import FilesPage from './pages/FilesPage'
import FileSystemPage from './pages/FileSystem'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route
          index
          path="/"
          element={
            <Layout>
              <FilesPage />
            </Layout>
          }
        />
        <Route
          index
          path="/arfs"
          element={
            <Layout>
              <FileSystemPage />
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  )
}

export default App
