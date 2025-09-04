import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

interface KitFormProps {
  onClose: () => void;
  onSave: () => void;
  kitId?: number;
}

const KitForm: React.FC<KitFormProps> = ({ onClose, onSave, kitId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    numero_serie: '',
    modelo: '',
    fornecedor_id: '',
    data_aquisicao: '',
    status: 'DISPONIVEL',
    observacoes: '',
    componentes: [
      { tipo: 'ANTENA', numero_serie: '', status: 'OK' },
      { tipo: 'LNB', numero_serie: '', status: 'OK' },
      { tipo: 'PARABOLA', numero_serie: '', status: 'OK' },
      { tipo: 'CABO', quantidade_metros: 20, status: 'OK' }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar fornecedores para o select
        const fornecedoresResponse = await axios.get('http://localhost:5000/api/fornecedores');
        setFornecedores(fornecedoresResponse.data);
        
        // Se for edição, buscar dados do kit
        if (kitId) {
          const kitResponse = await axios.get(`http://localhost:5000/api/kits/${kitId}`);
          const kit = kitResponse.data;
          
          // Formatar data para o formato do input date
          const formatDate = (dateString: string) => {
            if (!dateString) return '';
            return new Date(dateString).toISOString().split('T')[0];
          };
          
          // Preparar componentes
          let componentes = [...formData.componentes];
          if (kit.componentes && kit.componentes.length > 0) {
            componentes = kit.componentes;
          }
          
          setFormData({
            numero_serie: kit.numero_serie,
            modelo: kit.modelo || '',
            fornecedor_id: kit.fornecedor_id ? kit.fornecedor_id.toString() : '',
            data_aquisicao: formatDate(kit.data_aquisicao),
            status: kit.status,
            observacoes: kit.observacoes || '',
            componentes
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
  }, [kitId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComponenteChange = (index: number, field: string, value: any) => {
    const updatedComponentes = [...formData.componentes];
    updatedComponentes[index] = { 
      ...updatedComponentes[index], 
      [field]: value 
    };
    
    setFormData(prev => ({ ...prev, componentes: updatedComponentes }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!formData.numero_serie || !formData.fornecedor_id) {
        setError('Número de série e fornecedor são campos obrigatórios');
        setLoading(false);
        return;
      }
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        fornecedor_id: parseInt(formData.fornecedor_id),
        componentes: formData.componentes.map(comp => {
          if (comp.tipo === 'CABO') {
            return {
              ...comp,
              quantidade_metros: parseInt(comp.quantidade_metros.toString())
            };
          }
          return comp;
        })
      };
      
      // Criar ou atualizar kit
      if (kitId) {
        await axios.put(`http://localhost:5000/api/kits/${kitId}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/kits', dataToSend);
      }
      
      setLoading(false);
      onSave();
    } catch (err) {
      console.error('Erro ao salvar kit:', err);
      setError('Erro ao salvar kit. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  if (loading && !fornecedores.length) {
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
            {kitId ? 'Editar Kit' : 'Novo Kit'}
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
                Número de Série <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="numero_serie"
                value={formData.numero_serie}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor <span className="text-red-500">*</span>
              </label>
              <select
                name="fornecedor_id"
                value={formData.fornecedor_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione um fornecedor</option>
                {fornecedores.map(fornecedor => (
                  <option key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Aquisição
              </label>
              <input
                type="date"
                name="data_aquisicao"
                value={formData.data_aquisicao}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="DISPONIVEL">Disponível</option>
                <option value="EM_USO">Em Uso</option>
                <option value="MANUTENCAO">Em Manutenção</option>
                <option value="DEFEITO">Com Defeito</option>
              </select>
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
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-medium text-gray-700 mb-3">Componentes</h3>
            
            <div className="space-y-4">
              {formData.componentes.map((componente, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">{componente.tipo}</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {componente.tipo === 'CABO' ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quantidade (metros)
                        </label>
                        <input
                          type="number"
                          value={componente.quantidade_metros}
                          onChange={(e) => handleComponenteChange(index, 'quantidade_metros', e.target.value)}
                          min="1"
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Número de Série
                        </label>
                        <input
                          type="text"
                          value={componente.numero_serie}
                          onChange={(e) => handleComponenteChange(index, 'numero_serie', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={componente.status}
                        onChange={(e) => handleComponenteChange(index, 'status', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="OK">OK</option>
                        <option value="DEFEITO">Com Defeito</option>
                        <option value="SUBSTITUIDO">Substituído</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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

export default KitForm;
