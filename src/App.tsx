import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import LogbookPage from './pages/LogbookPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LogbookPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
