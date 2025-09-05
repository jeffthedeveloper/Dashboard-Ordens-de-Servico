import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OrdensServico from './pages/OrdensServico';
import Tecnicos from './pages/Tecnicos';
import Cidades from './pages/Cidades';
import Relatorios from './pages/Relatorios';
// Verificando se o Layout existe, caso contrário criamos um básico
import './App.css';

// Componente Layout básico caso o original não exista
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout">
      <header>
        <h1>Dashboard OS</h1>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ordens-servico" element={<OrdensServico />} />
          <Route path="/tecnicos" element={<Tecnicos />} />
          <Route path="/cidades" element={<Cidades />} />
          <Route path="/relatorios" element={<Relatorios />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
