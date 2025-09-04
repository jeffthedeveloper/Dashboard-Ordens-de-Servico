import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

interface ClienteFormProps {
  onClose: () => void;
  onSave: () => void;
  clienteId?: number;
}

const ClienteForm: React.FC<ClienteFormProps> = ({ onClose, onSave, clienteId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cidades, setCidades] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade_id: '',
    cep: '',
    contatos: [{ tipo: 'celular', valor: '', principal: true }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Buscar cidades para o select
        const cidadesResponse = await axios.get('http://localhost:5000/api/cidades');
        setCidades(cidadesResponse.data);
        
        // Se for edição, buscar dados do cliente
        if (clienteId) {
          const clienteResponse = await axios.get(`http://localhost:5000/api/clientes/${clienteId}`);
          const cliente = clienteResponse.data;
          
          setFormData({
            nome_completo: cliente.nome_completo,
            cpf: cliente.cpf || '',
            endereco: cliente.endereco || '',
            numero: cliente.numero || '',
            complemento: cliente.complemento || '',
            bairro: cliente.bairro || '',
            cidade_id: cliente.cidade_id ? cliente.cidade_id.toString() : '',
            cep: cliente.cep || '',
            contatos: cliente.contatos && cliente.contatos.length > 0 
              ? cliente.contatos 
              : [{ tipo: 'celular', valor: '', principal: true }]
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
  }, [clienteId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!formData.nome_completo || !formData.endereco || !formData.bairro || !formData.cidade_id) {
        setError('Preencha todos os campos obrigatórios');
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
        cidade_id: parseInt(formData.cidade_id),
        contatos: contatosValidos
      };
      
      // Criar ou atualizar cliente
      if (clienteId) {
        await axios.put(`http://localhost:5000/api/clientes/${clienteId}`, dataToSend);
      } else {
        await axios.post('http://localhost:5000/api/clientes', dataToSend);
      }
      
      setLoading(false);
      onSave();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Erro ao salvar cliente. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  if (loading && !cidades.length) {
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
            {clienteId ? 'Editar Cliente' : 'Novo Cliente'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número
              </label>
              <input
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
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
          </div>
          
          <div className="mt-6">
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

export default ClienteForm;
