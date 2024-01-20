import { lazy, useState, Suspense, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PendingFigure from './components/PendingFigure';
import BackGround from './components/BackGround';
const SocketProvider = lazy(() => import('./components/SocketProvider'))
const Auth = lazy(() => import('./pages/Auth'));
const Main = lazy(() => import('./pages/Main'));
const Meet = lazy(() => import('./pages/Meet'));

import '@fortawesome/fontawesome-free/css/all.css';
import NotFound from './pages/404';

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

  return (<>
    <BackGround />
    <Routes>
      <Route path="/"
        element={
          <Suspense fallback={<PendingFigure size={300} />}>
            <SocketProvider token={token}>
              <Main token={token} />
            </SocketProvider >
          </Suspense>
        }
      />
      <Route path="/auth"
        element={
          <Suspense fallback={<PendingFigure size={300} />}>
            <Auth onLogin={loginHandler} />
          </Suspense>
        }
      />
      <Route path="/meet/:meetId"
        element={
          <Suspense fallback={<PendingFigure size={300} />}>
            <Meet />
          </Suspense>
        }
      />
      <Route path="/*"
        element={<NotFound />}
      />
    </Routes>
  </>
  );
}

export default App;
