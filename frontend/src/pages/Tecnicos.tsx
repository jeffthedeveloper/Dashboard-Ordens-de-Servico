import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// IMPORs Corrigidos
import dadosTecnicosCount from '../../assets/dados_tecnicos_count.json';
import dadosOS from '../../assets/dados_os.json';

const Tecnicos: React.FC = () => {
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string>('');
  const [ordensDoTecnico, setOrdensDoTecnico] = useState<any[]>([]);
  const [desempenhoTecnicos, setDesempenhoTecnicos] = useState<any[]>([]);

  useEffect(() => {
    // Como não temos dados_tecnicos.json, vamos criar a lista a partir dos dados que temos
    const nomesTecnicos = Array.from(new Set(dadosTecnicosCount.map(item => item.tecnico)));
    
    const tecnicosValidos = nomesTecnicos
      .filter(nome => nome && nome !== '')
      .map(nome => ({
        nome: nome,
        identificacao_rua: '', // Você pode ajustar isso se tiver esses dados
        identificacao_app: ''   // Você pode ajustar isso se tiver esses dados
      }));
    
    setTecnicos(tecnicosValidos);

    // Preparar dados de desempenho
    const desempenho = dadosTecnicosCount
      .filter(item => item.tecnico && item.tecnico !== '')
      .map(item => ({
        nome: item.tecnico,
        total: item.total,
        media_diaria: (item.total / 30).toFixed(1)
      }));
    
    setDesempenhoTecnicos(desempenho);
  }, []);

  useEffect(() => {
    if (tecnicoSelecionado) {
      // Filtrar ordens do técnico selecionado
      const ordens = dadosOS.filter(item => 
        item.tecnico_campo === tecnicoSelecionado || 
        item.tecnico_app === tecnicoSelecionado
      );
      setOrdensDoTecnico(ordens);
    } else {
      setOrdensDoTecnico([]);
    }
  }, [tecnicoSelecionado]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Técnicos</h1>
      
      {/* Gráfico de desempenho */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Desempenho dos Técnicos</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={desempenhoTecnicos}
              margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Total de O.S." fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Lista de técnicos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Lista de Técnicos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tecnicos.map((tecnico, index) => (
            <div 
              key={index} 
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                tecnicoSelecionado === tecnico.nome ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setTecnicoSelecionado(tecnico.nome)}
            >
              <h3 className="font-medium text-gray-900">{tecnico.nome}</h3>
              {tecnico.identificacao_rua && (
                <p className="text-sm text-gray-500">ID Campo: {tecnico.identificacao_rua}</p>
              )}
              {tecnico.identificacao_app && (
                <p className="text-sm text-gray-500">ID App: {tecnico.identificacao_app}</p>
              )}
              <p className="text-sm font-medium text-blue-600 mt-2">
                {desempenhoTecnicos.find(t => t.nome === tecnico.nome)?.total || 0} O.S. realizadas
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Ordens do técnico selecionado */}
      {tecnicoSelecionado && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Ordens de Serviço - {tecnicoSelecionado}
          </h2>
          {ordensDoTecnico.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O.S.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordensDoTecnico.slice(0, 10).map((ordem, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ordem.os}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.data}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.nome_cliente}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.cidade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ordensDoTecnico.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Mostrando 10 de {ordensDoTecnico.length} ordens de serviço
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma ordem de serviço encontrada para este técnico.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Tecnicos;
