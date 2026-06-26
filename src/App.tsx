import { AppRoutes } from './routes';
import { ToastContainer } from './components/Toast';
import { AuthProvider } from './features/auth/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <ToastContainer />
    </AuthProvider>
  );
}
