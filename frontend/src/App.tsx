import { lazy, useState, Suspense, useEffect } from 'react'
import AuthPage from './AuthPage'
import PendingFigure from './components/PendingFigure'
import { getSocket } from './SocketController'
const Main = lazy(
  () => import('./Main')
)
import '@fortawesome/fontawesome-free/css/all.css';
// import { getSocket } from './SocketController';


function App() {
  const [token, setToken] = useState<string>(
    sessionStorage.getItem('token') || ""
  )
  const loginHandler = (token: string) => {
    sessionStorage.setItem('token', token);
    setToken(token);
  }
  useEffect(() => {
    if (token) {
      try {
        const socket = getSocket(token);
        socket.emit("message", "hello");
      } catch (e) {
        console.error(e);
       }
    }
  }, [token])
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
