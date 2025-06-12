import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

// Importação dos dados
import dadosCidades from '../assets/dados_cidades.json';
import dadosTecnicos from '../assets/dados_tecnicos_count.json';
import dadosDatas from '../assets/dados_datas.json';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard: React.FC = () => {
  const [totalOS, setTotalOS] = useState<number>(0);
  const [dadosCidadesFormatados, setDadosCidadesFormatados] = useState<any[]>([]);
  const [dadosTecnicosFormatados, setDadosTecnicosFormatados] = useState<any[]>([]);
  const [dadosDatasFormatados, setDadosDatasFormatados] = useState<any[]>([]);

  useEffect(() => {
    // Processar dados das cidades
    const cidadesValidas = dadosCidades.filter(item => item.cidade && item.cidade !== '');
    setDadosCidadesFormatados(cidadesValidas);
    
    // Calcular total de OS
    const total = cidadesValidas.reduce((acc, item) => acc + item.total, 0);
    setTotalOS(total);
    
    // Processar dados dos técnicos
    const tecnicosValidos = dadosTecnicos.filter(item => item.tecnico && item.tecnico !== '');
    setDadosTecnicosFormatados(tecnicosValidos);
    
    // Processar dados das datas
    const datasValidas = dadosDatas
      .filter(item => item.data && item.data !== '')
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    setDadosDatasFormatados(datasValidas);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard de Ordens de Serviço</h1>
      
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-sm font-medium text-gray-500">Total de O.S.</h2>
          <p className="text-3xl font-bold text-gray-800">{totalOS}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-sm font-medium text-gray-500">Cidades Atendidas</h2>
          <p className="text-3xl font-bold text-gray-800">{dadosCidadesFormatados.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-sm font-medium text-gray-500">Técnicos Ativos</h2>
          <p className="text-3xl font-bold text-gray-800">{dadosTecnicosFormatados.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-sm font-medium text-gray-500">Média Diária</h2>
          <p className="text-3xl font-bold text-gray-800">
            {dadosDatasFormatados.length > 0 
              ? (totalOS / dadosDatasFormatados.length).toFixed(1) 
              : '0'}
          </p>
        </div>
      </div>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por cidade */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Instalações por Cidade</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosCidadesFormatados}
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
        </div>
        
        {/* Gráfico de pizza por cidade */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Cidade</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosCidadesFormatados}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total"
                  nameKey="cidade"
                >
                  {dadosCidadesFormatados.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de barras por técnico */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Instalações por Técnico</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosTecnicosFormatados}
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tecnico" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total de O.S." fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de linha por data */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Evolução de Instalações</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosDatasFormatados}
                margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="data" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return `Data: ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="total" name="Instalações" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
