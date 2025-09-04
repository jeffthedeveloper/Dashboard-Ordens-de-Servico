import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

interface TecnicoFormProps {
  onClose: () => void;
  onSave: () => void;
  tecnicoId?: number;
}

const TecnicoForm: React.FC<TecnicoFormProps> = ({ onClose, onSave, tecnicoId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nome: '',
    identificacao_campo: '',
    identificacao_app: '',
    ativo: true,
    contatos: [{ tipo: 'celular', valor: '', principal: true }]
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!tecnicoId) return;
      
      try {
        setLoading(true);
        
        // Buscar dados do técnico
        const response = await axios.get(`http://localhost:5000/api/tecnicos/${tecnicoId}`);
        const tecnico = response.data;
        
        setFormData({
          nome: tecnico.nome,
          identificacao_campo: tecnico.identificacao_campo || '',
          identificacao_app: tecnico.identificacao_app || '',
          ativo: tecnico.ativo,
          contatos: tecnico.contatos && tecnico.contatos.length > 0 
            ? tecnico.contatos 
            : [{ tipo: 'celular', valor: '', principal: true }]
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar dados do técnico:', err);
        setError('Erro ao carregar dados do técnico. Tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tecnicoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContatoChange = (index: number, field: string, value: any) => {
    const updatedContatos = [...formData.contatos];
    
    if (field === 'principal' && value === true) {
      // Se marcou um contato como principal, desmarca os outros
      updatedContatos.forEach((contato, i) => {
        if (i !== index) {
          contato.principal = false;
        }
      });
    }
    
    updatedContatos[index] = { 
      ...updatedContatos[index], 
      [field]: value 
    };
    
    setFormData(prev => ({ ...prev, contatos: updatedContatos }));
  };

  const addContato = () => {
    setFormData(prev => ({
      ...prev,
      contatos: [...prev.contatos, { tipo: 'celular', valor: '', principal: false }]
    }));
  };

  const removeContato = (index: number) => {
    const updatedContatos = formData.contatos.filter((_, i) => i !== index);
    
    // Se removeu o contato principal, marca o primeiro como principal
    if (formData.contatos[index].principal && updatedContatos.length > 0) {
      updatedContatos[0].principal = true;
    }
    
    setFormData(prev => ({ ...prev, contatos: updatedContatos }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validar campos obrigatórios
      if (!formData.nome) {
        setError('O nome do técnico é obrigatório');
        setLoading(false);
        return;
      }
      
      // Validar contatos
      const contatosValidos = formData.contatos.filter(c => c.valor.trim() !== '');
      if (contatosValidos.length === 0) {
        setError('É necessário informar pelo menos um contato');
        setLoading(false);
        return;
      }
      
      // Preparar dados para envio
      const dataToSend = {
        ...formData,
        contatos: contatosValidos
      };
      
      // Criar ou atualizar técnico
      if (tecnicoId) {
        await axios.put(`http://localhost:5000/api/tecnicos/${tecnicoId}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/tecnicos', dataToSend);
      }
      
      setLoading(false);
      onSave();
    } catch (err) {
      console.error('Erro ao salvar técnico:', err);
      setError('Erro ao salvar técnico. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  if (loading && tecnicoId && !formData.nome) {
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
            {tecnicoId ? 'Editar Técnico' : 'Novo Técnico'}
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
                Identificação de Campo
              </label>
              <input
                type="text"
                name="identificacao_campo"
                value={formData.identificacao_campo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Identificação de App
              </label>
              <input
                type="text"
                name="identificacao_app"
                value={formData.identificacao_app}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
                Ativo
              </label>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Contatos <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={addContato}
                >
                  + Adicionar contato
                </button>
              </div>
              
              {formData.contatos.map((contato, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-3 mb-3">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={contato.tipo}
                        onChange={(e) => handleContatoChange(index, 'tipo', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="telefone">Telefone</option>
                        <option value="celular">Celular</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Valor
                      </label>
                      <input
                        type="text"
                        value={contato.valor}
                        onChange={(e) => handleContatoChange(index, 'valor', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`principal-${index}`}
                        checked={contato.principal}
                        onChange={(e) => handleContatoChange(index, 'principal', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`principal-${index}`} className="ml-2 block text-xs text-gray-700">
                        Principal
                      </label>
                    </div>
                    
                    {formData.contatos.length > 1 && (
                      <button
                        type="button"
                        className="text-xs text-red-600 hover:text-red-800"
                        onClick={() => removeContato(index)}
                      >
                        Remover
                      </button>
                    )}
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

export default TecnicoForm;
