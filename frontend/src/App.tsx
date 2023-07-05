import { lazy, useState, Suspense } from 'react'
import AuthForm from './components/AuthForm'
import PendingFigure from './components/PendingFigure'
const Home = lazy(
  () => import('./components/Home')
)
import '@fortawesome/fontawesome-free/css/all.css';


function App() {
  const [token, setToken] = useState<string>(
    sessionStorage.getItem('token') || ""
  )

  const loginHandler = (token: string) => {
    console.log(token);
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
            <Home token={token} />
          </Suspense>
          :
          <AuthForm onLogin={loginHandler} />

      }
    </>
  )
}

export default App
