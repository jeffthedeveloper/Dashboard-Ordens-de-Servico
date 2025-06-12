import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import dadosCidades from '../assets/dados_cidades.json';
import dadosOS from '../assets/dados_os.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Cidades: React.FC = () => {
  const [cidades, setCidades] = useState<any[]>([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('');
  const [ordensDaCidade, setOrdensDaCidade] = useState<any[]>([]);
  const [estatisticasCidade, setEstatisticasCidade] = useState<any>({});

  useEffect(() => {
    // Filtrar cidades válidas
    const cidadesValidas = dadosCidades.filter(item => item.cidade && item.cidade !== '');
    setCidades(cidadesValidas);
  }, []);

  useEffect(() => {
    if (cidadeSelecionada) {
      // Filtrar ordens da cidade selecionada
      const ordens = dadosOS.filter(item => item.cidade === cidadeSelecionada);
      setOrdensDaCidade(ordens);
      
      // Calcular estatísticas
      const tecnicosNaCidade = Array.from(new Set(ordens.map(item => item.tecnico_campo))).filter(Boolean);
      const bairrosNaCidade = Array.from(new Set(ordens.map(item => item.bairro))).filter(Boolean);
      
      // Contagem por técnico
      const contagemPorTecnico = tecnicosNaCidade.map(tecnico => {
        const count = ordens.filter(item => item.tecnico_campo === tecnico).length;
        return { nome: tecnico, total: count };
      });
      
      // Contagem por bairro
      const contagemPorBairro = bairrosNaCidade.map(bairro => {
        const count = ordens.filter(item => item.bairro === bairro).length;
        return { nome: bairro, total: count };
      });
      
      setEstatisticasCidade({
        total: ordens.length,
        tecnicos: tecnicosNaCidade.length,
        bairros: bairrosNaCidade.length,
        contagemPorTecnico,
        contagemPorBairro
      });
    } else {
      setOrdensDaCidade([]);
      setEstatisticasCidade({});
    }
  }, [cidadeSelecionada]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Análise por Cidade</h1>
      
      {/* Gráfico de distribuição por cidade */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de O.S. por Cidade</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cidades}
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cidade" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total de O.S." fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cidades}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="cidade"
                >
                  {cidades.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Seleção de cidade */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecione uma Cidade para Análise Detalhada</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cidades.map((cidade, index) => (
            <div 
              key={index} 
              className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                cidadeSelecionada === cidade.cidade ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setCidadeSelecionada(cidade.cidade)}
            >
              <h3 className="font-medium text-gray-900">{cidade.cidade}</h3>
              <p className="text-sm font-medium text-blue-600 mt-2">
                {cidade.total} O.S.
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Detalhes da cidade selecionada */}
      {cidadeSelecionada && Object.keys(estatisticasCidade).length > 0 && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Estatísticas de {cidadeSelecionada}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="text-sm font-medium text-gray-500">Total de O.S.</h3>
                <p className="text-2xl font-bold text-gray-800">{estatisticasCidade.total}</p>
              </div>
              <div className="p-4 border rounded-lg bg-green-50">
                <h3 className="text-sm font-medium text-gray-500">Técnicos Atuantes</h3>
                <p className="text-2xl font-bold text-gray-800">{estatisticasCidade.tecnicos}</p>
              </div>
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="text-sm font-medium text-gray-500">Bairros Atendidos</h3>
                <p className="text-2xl font-bold text-gray-800">{estatisticasCidade.bairros}</p>
              </div>
            </div>
          </div>
          
          {/* Gráfico por técnico na cidade */}
          {estatisticasCidade.contagemPorTecnico && estatisticasCidade.contagemPorTecnico.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Distribuição por Técnico em {cidadeSelecionada}
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={estatisticasCidade.contagemPorTecnico}
                    margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" angle={-45} textAnchor="end" height={70} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total de O.S." fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {/* Lista de ordens na cidade */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Últimas Ordens de Serviço em {cidadeSelecionada}
            </h2>
            {ordensDaCidade.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O.S.</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bairro</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordensDaCidade.slice(0, 10).map((ordem, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ordem.os}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.data}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.nome_cliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.bairro}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.tecnico_campo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ordensDaCidade.length > 10 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Mostrando 10 de {ordensDaCidade.length} ordens de serviço
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma ordem de serviço encontrada para esta cidade.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Cidades;
