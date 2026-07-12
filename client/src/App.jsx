import { useAuth } from './context/AuthContext';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import './App.css';

export default function App() {
  const { username, login, logout } = useAuth();

  if (!username) {
    return <LoginScreen onLogin={login} />;
  }

  return <ChatWindow username={username} onLogout={logout} />;
}
