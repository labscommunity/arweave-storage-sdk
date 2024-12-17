import { HashRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import FilesPage from './pages/FilesPage'

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
        {/* <Route
          index
          path="/drive/:id"
          element={
            <Layout>
              <ExplorerPage />
            </Layout>
          }
        /> */}
      </Routes>
    </HashRouter>
  )
}

export default App
