import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

interface OrdemServicoFormProps {
  onClose: () => void;
  onSave: () => void;
  ordemId?: number;
}

const OrdemServicoForm: React.FC<OrdemServicoFormProps> = ({ onClose, onSave, ordemId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [cidades, setCidades] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    numero_os: '',
    status: 'PENDENTE',
    data_criacao: new Date().toISOString().split('T')[0],
    data_vencimento: '',
    data_instalacao: '',
    cliente_id: '',
    tecnico_campo_id: '',
    tecnico_app_id: '',
    cidade_id: '',
    fez_na_rua: false,
    baixou_no_app: false,
    observacoes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar clientes, técnicos e cidades para os selects
        const [clientesRes, tecnicosRes, cidadesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/clientes'),
          axios.get('http://localhost:5000/api/tecnicos'),
          axios.get('http://localhost:5000/api/cidades')
        ]);
        
        setClientes(clientesRes.data);
        setTecnicos(tecnicosRes.data);
        setCidades(cidadesRes.data);
        
        // Se for edição, buscar dados da ordem
        if (ordemId) {
          const ordemRes = await axios.get(`http://localhost:5000/api/ordens/${ordemId}`);
          const ordem = ordemRes.data;
          
          // Formatar datas para o formato do input date
          const formatDate = (dateString: string) => {
            if (!dateString) return '';
            return new Date(dateString).toISOString().split('T')[0];
          };
          
          setFormData({
            numero_os: ordem.numero_os,
            status: ordem.status,
            data_criacao: formatDate(ordem.data_criacao),
            data_vencimento: formatDate(ordem.data_vencimento),
            data_instalacao: formatDate(ordem.data_instalacao),
            cliente_id: ordem.cliente_id.toString(),
            tecnico_campo_id: ordem.tecnico_campo_id.toString(),
            tecnico_app_id: ordem.tecnico_app_id ? ordem.tecnico_app_id.toString() : '',
            cidade_id: ordem.cidade_id.toString(),
            fez_na_rua: ordem.fez_na_rua,
            baixou_no_app: ordem.baixou_no_app,
            observacoes: ordem.observacoes || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [ordemId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      const requiredFields = ['numero_os', 'status', 'data_vencimento', 'cliente_id', 'tecnico_campo_id', 'cidade_id'];
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          setError(`Campo obrigatório não preenchido: ${field}`);
          setLoading(false);
          return;
        }
      }
      
      // Converter IDs para números
      const dataToSend = {
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        tecnico_campo_id: parseInt(formData.tecnico_campo_id),
        tecnico_app_id: formData.tecnico_app_id ? parseInt(formData.tecnico_app_id) : null,
        cidade_id: parseInt(formData.cidade_id)
      };
      
      // Criar ou atualizar ordem
      if (ordemId) {
        await axios.put(`http://localhost:5000/api/ordens/${ordemId}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/ordens', dataToSend);
      }
      
      setLoading(false);
      onSave();
    } catch (err) {
      console.error('Erro ao salvar ordem:', err);
      setError('Erro ao salvar ordem de serviço. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  if (loading && !clientes.length) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {ordemId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
          </h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
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
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número O.S. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero_os"
                value={formData.numero_os}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="PENDENTE">Pendente</option>
                <option value="INSTALADA">Instalada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Criação <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="data_criacao"
                value={formData.data_criacao}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Vencimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="data_vencimento"
                value={formData.data_vencimento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Instalação
              </label>
              <input
                type="date"
                name="data_instalacao"
                value={formData.data_instalacao}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome_completo}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Técnico de Campo <span className="text-red-500">*</span>
              </label>
              <select
                name="tecnico_campo_id"
                value={formData.tecnico_campo_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um técnico</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Técnico do App
              </label>
              <select
                name="tecnico_app_id"
                value={formData.tecnico_app_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione um técnico</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade <span className="text-red-500">*</span>
              </label>
              <select
                name="cidade_id"
                value={formData.cidade_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione uma cidade</option>
                {cidades.map(cidade => (
                  <option key={cidade.id} value={cidade.id}>
                    {cidade.nome} - {cidade.uf}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="fez_na_rua"
                  name="fez_na_rua"
                  checked={formData.fez_na_rua}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="fez_na_rua" className="ml-2 block text-sm text-gray-700">
                  Fez na rua
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="baixou_no_app"
                  name="baixou_no_app"
                  checked={formData.baixou_no_app}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="baixou_no_app" className="ml-2 block text-sm text-gray-700">
                  Baixou no app
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              onClick={onClose}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
              disabled={loading}
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdemServicoForm;
