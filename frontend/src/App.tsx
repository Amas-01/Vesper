import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreateStream = lazy(() => import('./pages/CreateStream'))
const StreamDetail = lazy(() => import('./pages/StreamDetail'))

// Placeholder pages for future features
const Payroll = lazy(() => Promise.resolve({
  default: () => <div className="text-center py-20"><h1>Payroll Management (Coming Soon)</h1></div>
}))
const Governance = lazy(() => Promise.resolve({
  default: () => <div className="text-center py-20"><h1>DAO Governance (Coming Soon)</h1></div>
}))
const Analytics = lazy(() => Promise.resolve({
  default: () => <div className="text-center py-20"><h1>Analytics Dashboard (Coming Soon)</h1></div>
}))

function App() {
  useEffect(() => {
    // Apply dark mode globally
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/create" element={<CreateStream />} />
            <Route path="/stream/:id" element={<StreamDetail />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/governance/proposal/:id" element={<Governance />} />
            <Route path="/analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-dark-text-secondary">Loading Vesper Protocol...</p>
      </div>
    </div>
  )
}

export default App
