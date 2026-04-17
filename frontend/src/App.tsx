import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreateStream from './pages/CreateStream'
import StreamDetail from './pages/StreamDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreateStream />} />
          <Route path="/stream/:id" element={<StreamDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
