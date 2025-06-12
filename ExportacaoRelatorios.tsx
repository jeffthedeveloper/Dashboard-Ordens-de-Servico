import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Users, MapPin, Calendar, Filter } from 'lucide-react';

const ExportacaoRelatorios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [cidades, setCidades] = useState<any[]>([]);
  const [filtro, setFiltro] = useState({
    tipo: 'os',
    formato: 'pdf',
    data_inicio: '',
    data_fim: '',
    tecnico_id: '',
    cidade_id: '',
    status: '',
    incluir_mapa: true
  });
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados para os selects
        const [tecnicosRes, cidadesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/tecnicos'),
          axios.get('http://localhost:5000/api/cidades')
        ]);
        
        setTecnicos(tecnicosRes.data);
        setCidades(cidadesRes.data);
        
        // Definir datas padrão (último mês)
        const hoje = new Date();
        const mesPassado = new Date();
        mesPassado.setMonth(hoje.getMonth() - 1);
        
        setFiltro(prev => ({
          ...prev,
          data_inicio: mesPassado.toISOString().split('T')[0],
          data_fim: hoje.toISOString().split('T')[0]
        }));
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFiltro(prev => ({ ...prev, [name]: checked }));
    } else {
      setFiltro(prev => ({ ...prev, [name]: value }));
    }
  };

  const gerarRelatorio = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string com filtros
      const params = new URLSearchParams();
      params.append('tipo', filtro.tipo);
      if (filtro.data_inicio) params.append('data_inicio', filtro.data_inicio);
      if (filtro.data_fim) params.append('data_fim', filtro.data_fim);
      if (filtro.tecnico_id) params.append('tecnico_id', filtro.tecnico_id);
      if (filtro.cidade_id) params.append('cidade_id', filtro.cidade_id);
      if (filtro.status) params.append('status', filtro.status);
      if (filtro.incluir_mapa) params.append('incluir_mapa', 'true');
      
      // Determinar URL com base no formato
      let url = '';
      if (filtro.formato === 'pdf') {
        url = `http://localhost:5000/api/relatorios/admin/pdf?${params.toString()}`;
      } else {
        url = `http://localhost:5000/api/relatorios/admin/csv?${params.toString()}`;
      }
      
      // Abrir em nova aba
      window.open(url, '_blank');
      
      setLoading(false);
      setExportSuccess(`Relatório ${filtro.formato.toUpperCase()} gerado com sucesso!`);
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setExportSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      setError('Erro ao gerar relatório. Tente novamente mais tarde.');
      setLoading(false);
      setExportSuccess(null);
    }
  };

  const gerarRelatorioTecnicos = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtro.tecnico_id) params.append('tecnico_id', filtro.tecnico_id);
      if (filtro.cidade_id) params.append('cidade_id', filtro.cidade_id);
      if (filtro.status) params.append('status', filtro.status);
      if (filtro.incluir_mapa) params.append('incluir_mapa', 'true');
      
      // Abrir em nova aba
      window.open(`http://localhost:5000/api/relatorios/tecnicos/pdf?${params.toString()}`, '_blank');
      
      setLoading(false);
      setExportSuccess('Relatório para técnicos gerado com sucesso!');
      
      // Limpar mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setExportSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Erro ao gerar relatório para técnicos:', err);
      setError('Erro ao gerar relatório para técnicos. Tente novamente mais tarde.');
      setLoading(false);
      setExportSuccess(null);
    }
  };

  if (loading && !tecnicos.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Exportação de Relatórios</h1>

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

      {exportSuccess && (
        <div className="bg-green-50 p-4 rounded-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Sucesso</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{exportSuccess}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Relatórios Administrativos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Relatórios Administrativos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
            <select
              name="tipo"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.tipo}
              onChange={handleChange}
            >
              <option value="os">Ordens de Serviço</option>
              <option value="tecnicos">Desempenho de Técnicos</option>
              <option value="cidades">Desempenho por Cidade</option>
              <option value="clientes">Lista de Clientes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
            <select
              name="formato"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.formato}
              onChange={handleChange}
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.status}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="INSTALADA">Instalada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <input
              type="date"
              name="data_inicio"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.data_inicio}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <input
              type="date"
              name="data_fim"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.data_fim}
              onChange={handleChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
            <select
              name="tecnico_id"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.tecnico_id}
              onChange={handleChange}
            >
              <option value="">Todos</option>
              {tecnicos.map(tecnico => (
                <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <select
              name="cidade_id"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.cidade_id}
              onChange={handleChange}
            >
              <option value="">Todas</option>
              {cidades.map(cidade => (
                <option key={cidade.id} value={cidade.id}>{cidade.nome} - {cidade.uf}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="incluir_mapa"
              name="incluir_mapa"
              checked={filtro.incluir_mapa}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="incluir_mapa" className="ml-2 block text-sm text-gray-700">
              Incluir mapa (apenas PDF)
            </label>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={gerarRelatorio}
            disabled={loading}
          >
            <Download className="h-5 w-5 mr-2" />
            {loading ? 'Gerando...' : 'Gerar Relatório Administrativo'}
          </button>
        </div>
      </div>

      {/* Relatórios para Técnicos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Relatório para Técnicos</h2>
        <p className="text-gray-600 mb-4">
          Gere relatórios de ordens de serviço pendentes para distribuição aos técnicos.
          Estes relatórios incluem detalhes completos dos endereços e instruções para instalação.
        </p>
        
        <div className="mt-6">
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={gerarRelatorioTecnicos}
            disabled={loading}
          >
            <Download className="h-5 w-5 mr-2" />
            {loading ? 'Gerando...' : 'Gerar Relatório para Técnicos'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Utiliza os mesmos filtros de técnico, cidade e status definidos acima.
          </p>
        </div>
      </div>

      {/* Cards de Relatórios Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium">Ordens Pendentes</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Relatório de todas as ordens de serviço pendentes com prazos de vencimento.
          </p>
          <button
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-md flex items-center justify-center"
            onClick={() => {
              setFiltro(prev => ({ ...prev, tipo: 'os', formato: 'pdf', status: 'PENDENTE' }));
              setTimeout(gerarRelatorio, 100);
            }}
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-700">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium">Desempenho Técnicos</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Relatório de desempenho dos técnicos com taxas de conclusão e tempos médios.
          </p>
          <button
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 px-4 py-2 rounded-md flex items-center justify-center"
            onClick={() => {
              setFiltro(prev => ({ ...prev, tipo: 'tecnicos', formato: 'pdf' }));
              setTimeout(gerarRelatorio, 100);
            }}
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="ml-3 text-lg font-medium">Vencimentos Próximos</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Relatório de ordens com vencimento nos próximos 7 dias, ordenadas por prioridade.
          </p>
          <button
            className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 py-2 rounded-md flex items-center justify-center"
            onClick={() => {
              // Calcular data atual e data daqui a 7 dias
              const hoje = new Date();
              const em7dias = new Date();
              em7dias.setDate(hoje.getDate() + 7);
              
              setFiltro(prev => ({
                ...prev,
                tipo: 'os',
                formato: 'pdf',
                status: 'PENDENTE',
                data_inicio: hoje.toISOString().split('T')[0],
                data_fim: em7dias.toISOString().split('T')[0]
              }));
              
              setTimeout(gerarRelatorio, 100);
            }}
          >
            <Download className="h-5 w-5 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportacaoRelatorios;
