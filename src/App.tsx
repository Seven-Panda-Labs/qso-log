import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LogbookPage from './pages/LogbookPage'
import NotFoundPage from './pages/NotFoundPage'

// A second screen, loaded when an operator goes looking for it.
const StatsPage = lazy(() => import('./pages/StatsPage'))

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LogbookPage />} />
        <Route
          path="stats"
          element={
            <Suspense fallback={null}>
              <StatsPage />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
