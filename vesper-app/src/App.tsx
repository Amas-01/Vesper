import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from '../../frontend/src/pages/Home'
import Dashboard from '../../frontend/src/pages/Dashboard'
import CreateStream from '../../frontend/src/pages/CreateStream'
import StreamDetail from '../../frontend/src/pages/StreamDetail'
import './App.css'

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
