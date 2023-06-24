import { useState } from 'react'
import './App.css'
import AuthForm from './components/AuthForm/AuthForm'
import Home from './components/Home/Home'

function App() {
  const [token, setToken] = useState<string>(
    sessionStorage.getItem('token') || ""
  )

  const loginHanlder = (token: string) => {
    console.log(token);
    setToken(token);

  }
  return (
    <>
      {
        token ?
          <Home token={token} />
          :
          <AuthForm onLogin={loginHanlder} />

      }
    </>
  )
}

export default App
