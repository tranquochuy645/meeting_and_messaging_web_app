import { lazy, useState, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PendingFigure from './components/PendingFigure';
const SocketProvider = lazy(() => import('./components/SocketProvider'))
const Auth = lazy(() => import('./pages/Auth'));
const Main = lazy(() => import('./pages/Main'));
const Meet = lazy(() => import('./pages/Meet'));

import '@fortawesome/fontawesome-free/css/all.css';

function App() {
  const [token, setToken] = useState<string>(sessionStorage.getItem('token') || '');
  const navigate = useNavigate();
  const loginHandler = (token: string) => {
    sessionStorage.setItem('token', token);
    setToken(token);
    navigate('/');
  };
  useEffect(() => {
    if (!token) {
      // Redirect to the auth page if no token is available
      navigate("/auth")
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/"
        element={
          <Suspense fallback={<PendingFigure size={500} />}>
            <SocketProvider token={token}>
              <Main token={token} />
            </SocketProvider >
          </Suspense>
        }
      />
      <Route path="/auth"
        element={
          <Suspense fallback={<PendingFigure size={500} />}>
            <Auth onLogin={loginHandler} />
          </Suspense>
        }
      />
      <Route path="/meet/:meetId"
        element={
          <Suspense fallback={<PendingFigure size={500} />}>
            <Meet />
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
