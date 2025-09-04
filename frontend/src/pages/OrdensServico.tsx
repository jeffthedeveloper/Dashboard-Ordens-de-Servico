import React, { useState, useEffect } from 'react';
import dadosOS from '../assets/dados_os.json';

const OrdensServico: React.FC = () => {
  const [ordens, setOrdens] = useState<any[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCidade, setFilterCidade] = useState('');
  const [filterTecnico, setFilterTecnico] = useState('');
  const [cidades, setCidades] = useState<string[]>([]);
  const [tecnicos, setTecnicos] = useState<string[]>([]);

  useEffect(() => {
    // Carregar dados
    const dadosValidos = dadosOS.filter(item => item.status && item.status !== '');
    setOrdens(dadosValidos);
    setFilteredOrdens(dadosValidos);
    
    // Extrair cidades únicas
    const cidadesUnicas = Array.from(new Set(dadosValidos.map(item => item.cidade))).filter(Boolean) as string[];
    setCidades(cidadesUnicas);
    
    // Extrair técnicos únicos
    const tecnicosUnicos = Array.from(new Set(dadosValidos.map(item => item.tecnico_campo))).filter(Boolean) as string[];
    setTecnicos(tecnicosUnicos);
  }, []);

  useEffect(() => {
    // Aplicar filtros
    let result = ordens;
    
    if (searchTerm) {
      result = result.filter(item => 
        item.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.os.toString().includes(searchTerm) ||
        item.endereco.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCidade) {
      result = result.filter(item => item.cidade === filterCidade);
    }
    
    if (filterTecnico) {
      result = result.filter(item => item.tecnico_campo === filterTecnico);
    }
    
    setFilteredOrdens(result);
    setCurrentPage(1);
  }, [searchTerm, filterCidade, filterTecnico, ordens]);

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrdens.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrdens.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Ordens de Serviço</h1>
      
      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Buscar</label>
            <input
              type="text"
              id="search"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Nome, O.S. ou Endereço"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
            <select
              id="cidade"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filterCidade}
              onChange={(e) => setFilterCidade(e.target.value)}
            >
              <option value="">Todas as cidades</option>
              {cidades.map((cidade, index) => (
                <option key={index} value={cidade}>{cidade}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="tecnico" className="block text-sm font-medium text-gray-700">Técnico</label>
            <select
              id="tecnico"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={filterTecnico}
              onChange={(e) => setFilterTecnico(e.target.value)}
            >
              <option value="">Todos os técnicos</option>
              {tecnicos.map((tecnico, index) => (
                <option key={index} value={tecnico}>{tecnico}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabela de Ordens de Serviço */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O.S.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((ordem, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ordem.os}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.data}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.nome_cliente}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.cidade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.tecnico_campo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredOrdens.length)}</span> de <span className="font-medium">{filteredOrdens.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;
                  
                  if (pageNumber <= 0 || pageNumber > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === pageNumber ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdensServico;
