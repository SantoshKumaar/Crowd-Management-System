import { AuthProvider } from './context/AuthContext'
import Router from './route/Router'
import Layout from './components/shared/Layout'

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App

