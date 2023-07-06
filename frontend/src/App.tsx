import { lazy, useState, Suspense } from 'react'
import AuthPage from './AuthPage'
import PendingFigure from './components/PendingFigure'
const Main = lazy(
  () => import('./Main')
)
import '@fortawesome/fontawesome-free/css/all.css';


function App() {
  const [token, setToken] = useState<string>(
    sessionStorage.getItem('token') || ""
  )
  const loginHandler = (token: string) => {
    sessionStorage.setItem('token', token);
    setToken(token);
  }
  return (
    <>
      {
        token ?
          <Suspense fallback=
            {
              <PendingFigure size={200} />
            }
          >
            <Main token={token} />
          </Suspense>
          :
          <AuthPage onLogin={loginHandler} />

      }
    </>
  )
}

export default App
