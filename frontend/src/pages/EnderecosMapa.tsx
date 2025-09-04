import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, Download, MapPin } from 'lucide-react';
import MapView from '../components/MapView';

const EnderecosMapa = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [ordens, setOrdens] = useState<any[]>([]);
  const [filtro, setFiltro] = useState({
    cidade_id: '',
    status: '',
    tecnico_id: ''
  });
  const [cidades, setCidades] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-15.7801, -47.9292]); // Brasil
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedOrdem, setSelectedOrdem] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados necessários
        const [clientesRes, ordensRes, cidadesRes, tecnicosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/clientes'),
          axios.get('http://localhost:5000/api/ordens'),
          axios.get('http://localhost:5000/api/cidades'),
          axios.get('http://localhost:5000/api/tecnicos')
        ]);
        
        setClientes(clientesRes.data);
        setOrdens(ordensRes.data);
        setCidades(cidadesRes.data);
        setTecnicos(tecnicosRes.data);
        
        // Preparar marcadores para o mapa
        prepareMapMarkers(ordensRes.data, clientesRes.data, cidadesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const prepareMapMarkers = (ordens: any[], clientes: any[], cidades: any[]) => {
    // Mapeamento de status para cores
    const statusColors = {
      'PENDENTE': '#f59e0b', // Âmbar
      'INSTALADA': '#10b981', // Verde
      'CANCELADA': '#ef4444'  // Vermelho
    };
    
    // Criar marcadores para ordens que têm clientes com coordenadas válidas
    const markers: any[] = [];
    
    ordens.forEach(ordem => {
      const cliente = clientes.find(c => c.id === ordem.cliente_id);
      const cidade = cidades.find(c => c.id === cliente?.cidade_id);
      
      // Verificar se temos coordenadas válidas
      if (cidade?.latitude && cidade?.longitude) {
        // Usar coordenadas da cidade como fallback
        let latitude = cidade.latitude;
        let longitude = cidade.longitude;
        
        // Se o cliente tiver coordenadas específicas, usar elas
        if (cliente?.latitude && cliente?.longitude) {
          latitude = cliente.latitude;
          longitude = cliente.longitude;
        }
        
        // Adicionar marcador
        markers.push({
          id: ordem.id,
          latitude,
          longitude,
          title: `O.S. ${ordem.numero_os}`,
          description: `Cliente: ${cliente?.nome_completo || 'N/A'}<br/>Status: ${ordem.status}<br/>Cidade: ${cidade?.nome || 'N/A'}`,
          color: statusColors[ordem.status] || '#3b82f6', // Azul como cor padrão
          ordem,
          cliente,
          cidade
        });
      }
    });
    
    setMapMarkers(markers);
  };

  const aplicarFiltro = async () => {
    try {
      setLoading(true);
      
      // Construir query string com filtros
      const params = new URLSearchParams();
      if (filtro.cidade_id) params.append('cidade_id', filtro.cidade_id);
      if (filtro.status) params.append('status', filtro.status);
      if (filtro.tecnico_id) params.append('tecnico_id', filtro.tecnico_id);
      
      const url = `http://localhost:5000/api/ordens?${params.toString()}`;
      const response = await axios.get(url);
      
      // Atualizar ordens e marcadores do mapa
      setOrdens(response.data);
      prepareMapMarkers(response.data, clientes, cidades);
      
      // Se filtrou por cidade, centralizar o mapa nela
      if (filtro.cidade_id) {
        const cidadeSelecionada = cidades.find(c => c.id === parseInt(filtro.cidade_id));
        if (cidadeSelecionada?.latitude && cidadeSelecionada?.longitude) {
          setMapCenter([cidadeSelecionada.latitude, cidadeSelecionada.longitude]);
          setMapZoom(12);
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erro ao aplicar filtro:', err);
      setError('Erro ao filtrar ordens. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const limparFiltro = async () => {
    setFiltro({
      cidade_id: '',
      status: '',
      tecnico_id: ''
    });
    
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/ordens');
      setOrdens(response.data);
      prepareMapMarkers(response.data, clientes, cidades);
      setMapCenter([-15.7801, -47.9292]); // Voltar para o centro do Brasil
      setMapZoom(5);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao limpar filtro:', err);
      setError('Erro ao recarregar ordens. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const handleMarkerClick = (id: number) => {
    const marker = mapMarkers.find(m => m.id === id);
    if (marker) {
      setSelectedOrdem(marker);
    }
  };

  if (loading && !clientes.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando mapa de endereços...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Ordens de Serviço</h1>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.status}
              onChange={(e) => setFiltro({ ...filtro, status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="INSTALADA">Instalada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={filtro.tecnico_id}
              onChange={(e) => setFiltro({ ...filtro, tecnico_id: e.target.value })}
            >
              <option value="">Todos</option>
              {tecnicos.map((tecnico) => (
                <option key={tecnico.id} value={tecnico.id}>{tecnico.nome}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            onClick={aplicarFiltro}
          >
            <Filter className="h-5 w-5 mr-2" />
            Aplicar Filtros
          </button>
          
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center"
            onClick={limparFiltro}
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Mapa e detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Visualização Geográfica</h2>
          <div className="h-[600px]">
            <MapView
              latitude={mapCenter[0]}
              longitude={mapCenter[1]}
              zoom={mapZoom}
              markers={mapMarkers}
              height="100%"
              onMarkerClick={handleMarkerClick}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[#f59e0b] mr-2"></div>
              <span className="text-sm">Pendente</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[#10b981] mr-2"></div>
              <span className="text-sm">Instalada</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-[#ef4444] mr-2"></div>
              <span className="text-sm">Cancelada</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Detalhes da Ordem</h2>
          
          {selectedOrdem ? (
            <div>
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium text-lg">O.S. {selectedOrdem.ordem.numero_os}</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                      ${selectedOrdem.ordem.status === 'INSTALADA' ? 'bg-green-100 text-green-800' : 
                        selectedOrdem.ordem.status === 'CANCELADA' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {selectedOrdem.ordem.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Data Criação:</span> {new Date(selectedOrdem.ordem.data_criacao).toLocaleDateString('pt-BR')}</p>
                  <p><span className="font-medium">Data Vencimento:</span> {new Date(selectedOrdem.ordem.data_vencimento).toLocaleDateString('pt-BR')}</p>
                  
                  {selectedOrdem.ordem.data_instalacao && (
                    <p><span className="font-medium">Data Instalação:</span> {new Date(selectedOrdem.ordem.data_instalacao).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium">Cliente</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Nome:</span> {selectedOrdem.cliente.nome_completo}</p>
                  <p><span className="font-medium">Endereço:</span> {selectedOrdem.cliente.endereco}, {selectedOrdem.cliente.numero}</p>
                  <p><span className="font-medium">Bairro:</span> {selectedOrdem.cliente.bairro}</p>
                  <p><span className="font-medium">Cidade:</span> {selectedOrdem.cidade.nome} - {selectedOrdem.cidade.uf}</p>
                  {selectedOrdem.cliente.cep && (
                    <p><span className="font-medium">CEP:</span> {selectedOrdem.cliente.cep}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center w-full justify-center"
                  onClick={() => window.open(`http://localhost:5000/api/relatorios/tecnicos/pdf?ordem_id=${selectedOrdem.ordem.id}`, '_blank')}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Gerar PDF para Técnico
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <MapPin className="h-12 w-12 mb-2" />
              <p>Selecione uma ordem no mapa para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnderecosMapa;
