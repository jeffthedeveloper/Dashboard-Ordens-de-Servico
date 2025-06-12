import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Download, Plus, Edit, Trash2, Users, MapPin } from 'lucide-react';

const Clientes = () => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState({
    nome: '',
    cidade_id: ''
  });
  const [cidades, setCidades] = useState<any[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar clientes
        const clientesResponse = await axios.get('http://localhost:5000/api/clientes');
        setClientes(clientesResponse.data);
        
        // Buscar cidades para filtro
        const cidadesResponse = await axios.get('http://localhost:5000/api/cidades');
        setCidades(cidadesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar clientes. Tente novamente mais tarde.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const aplicarFiltro = async () => {
    try {
      setLoading(true);
      
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtro.cidade_id) params.append('cidade_id', filtro.cidade_id);
      
      const url = `http://localhost:5000/api/clientes?${params.toString()}`;
      const response = await axios.get(url);
      
      // Filtrar por nome localmente (caso tenha sido informado)
      let clientesFiltrados = response.data;
      if (filtro.nome) {
        clientesFiltrados = clientesFiltrados.filter((cliente: any) => 
          cliente.nome_completo.toLowerCase().includes(filtro.nome.toLowerCase())
        );
      }
      
      setClientes(clientesFiltrados);
      setPaginaAtual(1);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao aplicar filtro:', err);
      setError('Erro ao filtrar clientes. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const limparFiltro = async () => {
    setFiltro({
      nome: '',
      cidade_id: ''
    });
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/clientes');
      setClientes(response.data);
      setPaginaAtual(1);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao limpar filtro:', err);
      setError('Erro ao recarregar clientes. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const buscarCliente = async () => {
    if (!filtro.nome || filtro.nome.length < 3) {
      setError('Digite pelo menos 3 caracteres para buscar');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/clientes/busca?termo=${filtro.nome}`);
      setClientes(response.data);
      setPaginaAtual(1);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar cliente:', err);
      setError('Erro ao buscar cliente. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Paginação
  const totalPaginas = Math.ceil(clientes.length / itensPorPagina);
  const clientesExibidos = clientes.slice(
    (paginaAtual - 1) * itensPorPagina,
    paginaAtual * itensPorPagina
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => alert('Funcionalidade de cadastro em implementação')}
        >
          <Plus className="h-5 w-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erro</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <div className="flex">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar por nome..."
                value={filtro.nome}
                onChange={(e) => setFiltro({ ...filtro, nome: e.target.value })}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-r-md"
                onClick={buscarCliente}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.cidade_id}
              onChange={(e) => setFiltro({ ...filtro, cidade_id: e.target.value })}
            >
              <option value="">Todas</option>
              {cidades.map((cidade) => (
                <option key={cidade.id} value={cidade.id}>{cidade.nome} - {cidade.uf}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              onClick={aplicarFiltro}
            >
              <Filter className="h-5 w-5 mr-2" />
              Aplicar Filtros
            </button>
            
            <button
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center ml-2"
              onClick={limparFiltro}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Endereço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bairro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesExibidos.length > 0 ? (
                clientesExibidos.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cliente.nome_completo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.cpf || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.endereco}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cliente.bairro}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cidades.find(c => c.id === cliente.cidade_id)?.nome || '-'} - {cliente.uf}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => alert(`Editar cliente ${cliente.nome_completo}`)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => alert(`Excluir cliente ${cliente.nome_completo}`)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(paginaAtual - 1) * itensPorPagina + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(paginaAtual * itensPorPagina, clientes.length)}
                  </span>{' '}
                  de <span className="font-medium">{clientes.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                    disabled={paginaAtual === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      paginaAtual === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Anterior
                  </button>
                  
                  {[...Array(totalPaginas)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPaginaAtual(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        paginaAtual === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      paginaAtual === totalPaginas ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Próxima
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Clientes;
