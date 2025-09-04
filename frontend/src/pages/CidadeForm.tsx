import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

interface CidadeFormProps {
  onClose: () => void;
  onSave: () => void;
  cidadeId?: number;
}

const CidadeForm: React.FC<CidadeFormProps> = ({ onClose, onSave, cidadeId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    uf: '',
    regiao: '',
    codigo_ibge: '',
    latitude: '',
    longitude: ''
  });

  const regioes = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!cidadeId) return;
      
      try {
        setLoading(true);
        
        // Buscar dados da cidade
        const response = await axios.get(`http://localhost:5000/api/cidades/${cidadeId}`);
        const cidade = response.data;
        
        setFormData({
          nome: cidade.nome,
          uf: cidade.uf,
          regiao: cidade.regiao || '',
          codigo_ibge: cidade.codigo_ibge || '',
          latitude: cidade.latitude || '',
          longitude: cidade.longitude || ''
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados da cidade:', err);
        setError('Erro ao carregar dados da cidade. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [cidadeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!formData.nome || !formData.uf) {
        setError('Nome e UF são campos obrigatórios');
        setLoading(false);
        return;
      }
      
      // Validar coordenadas se informadas
      if (formData.latitude && !isValidCoordinate(formData.latitude, true)) {
        setError('Latitude inválida. Deve ser um número entre -90 e 90');
        setLoading(false);
        return;
      }
      
      if (formData.longitude && !isValidCoordinate(formData.longitude, false)) {
        setError('Longitude inválida. Deve ser um número entre -180 e 180');
        setLoading(false);
        return;
      }
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null
      };
      
      // Criar ou atualizar cidade
      if (cidadeId) {
        await axios.put(`http://localhost:5000/api/cidades/${cidadeId}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/cidades', dataToSend);
      }
      
      setLoading(false);
      onSave();
    } catch (err) {
      console.error('Erro ao salvar cidade:', err);
      setError('Erro ao salvar cidade. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const isValidCoordinate = (value: string, isLatitude: boolean) => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    
    if (isLatitude) {
      return num >= -90 && num <= 90;
    } else {
      return num >= -180 && num <= 180;
    }
  };

  if (loading && cidadeId && !formData.nome) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {cidadeId ? 'Editar Cidade' : 'Nova Cidade'}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UF <span className="text-red-500">*</span>
              </label>
              <select
                name="uf"
                value={formData.uf}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecione a UF</option>
                {ufs.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Região
              </label>
              <select
                name="regiao"
                value={formData.regiao}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a região</option>
                {regioes.map(regiao => (
                  <option key={regiao} value={regiao}>{regiao}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código IBGE
              </label>
              <input
                type="text"
                name="codigo_ibge"
                value={formData.codigo_ibge}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="Ex: -23.5505"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="Ex: -46.6333"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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

export default CidadeForm;
