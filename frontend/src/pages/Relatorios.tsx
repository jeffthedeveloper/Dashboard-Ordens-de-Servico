import React, { useState } from 'react';
import dadosOS from '../assets/dados_os.json';
import dadosCidades from '../assets/dados_cidades.json';
import dadosTecnicos from '../assets/dados_tecnicos_count.json';

const Relatorios: React.FC = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>('os');
  const [filtroData, setFiltroData] = useState<string>('');
  const [filtroCidade, setFiltroCidade] = useState<string>('');
  const [filtroTecnico, setFiltroTecnico] = useState<string>('');
  const [relatorioGerado, setRelatorioGerado] = useState<boolean>(false);
  
  // Extrair cidades únicas
  const cidades = Array.from(new Set(dadosOS.map(item => item.cidade))).filter(Boolean) as string[];
  
  // Extrair técnicos únicos
  const tecnicos = Array.from(new Set(dadosOS.map(item => item.tecnico_campo))).filter(Boolean) as string[];
  
  const gerarRelatorio = () => {
    setRelatorioGerado(true);
  };
  
  const exportarCSV = () => {
    alert('Funcionalidade de exportação para CSV será implementada');
  };
  
  const exportarPDF = () => {
    alert('Funcionalidade de exportação para PDF será implementada');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Relatórios</h1>
      
      {/* Seleção de tipo de relatório */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Gerar Relatório</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  tipoRelatorio === 'os' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setTipoRelatorio('os')}
              >
                <h3 className="font-medium text-gray-900">Ordens de Serviço</h3>
                <p className="text-sm text-gray-500">Relatório detalhado de todas as O.S.</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  tipoRelatorio === 'tecnicos' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setTipoRelatorio('tecnicos')}
              >
                <h3 className="font-medium text-gray-900">Desempenho de Técnicos</h3>
                <p className="text-sm text-gray-500">Análise de produtividade por técnico</p>
              </div>
              <div 
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                  tipoRelatorio === 'cidades' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setTipoRelatorio('cidades')}
              >
                <h3 className="font-medium text-gray-900">Análise por Cidade</h3>
                <p className="text-sm text-gray-500">Distribuição geográfica das instalações</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700">Período</label>
              <select
                id="data"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              >
                <option value="">Todos os períodos</option>
                <option value="maio">Maio/2024</option>
                <option value="abril">Abril/2024</option>
                <option value="marco">Março/2024</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">Cidade</label>
              <select
                id="cidade"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filtroCidade}
                onChange={(e) => setFiltroCidade(e.target.value)}
              >
                <option value="">Todas as cidades</option>
                {cidades.map((cidade, index) => (
                  <option key={index} value={cidade}>{cidade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="tecnico" className="block text-sm font-medium text-gray-700">Técnico</label>
              <select
                id="tecnico"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={filtroTecnico}
                onChange={(e) => setFiltroTecnico(e.target.value)}
              >
                <option value="">Todos os técnicos</option>
                {tecnicos.map((tecnico, index) => (
                  <option key={index} value={tecnico}>{tecnico}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={gerarRelatorio}
            >
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
      
      {/* Relatório gerado */}
      {relatorioGerado && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {tipoRelatorio === 'os' && 'Relatório de Ordens de Serviço'}
              {tipoRelatorio === 'tecnicos' && 'Relatório de Desempenho de Técnicos'}
              {tipoRelatorio === 'cidades' && 'Relatório de Análise por Cidade'}
            </h2>
            <div className="space-x-2">
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={exportarCSV}
              >
                Exportar CSV
              </button>
              <button
                type="button"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={exportarPDF}
              >
                Exportar PDF
              </button>
            </div>
          </div>
          
          {/* Conteúdo do relatório */}
          <div className="overflow-x-auto">
            {tipoRelatorio === 'os' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O.S.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosOS
                    .filter(item => !filtroCidade || item.cidade === filtroCidade)
                    .filter(item => !filtroTecnico || item.tecnico_campo === filtroTecnico)
                    .slice(0, 10)
                    .map((ordem, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ordem.os}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.data}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.status}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.nome_cliente}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.cidade}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ordem.tecnico_campo}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
            
            {tipoRelatorio === 'tecnicos' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de O.S.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Média Diária</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% do Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosTecnicos
                    .filter(item => !filtroTecnico || item.tecnico === filtroTecnico)
                    .map((tecnico, index) => {
                      const totalGeral = dadosTecnicos.reduce((acc, curr) => acc + curr.total, 0);
                      const percentual = ((tecnico.total / totalGeral) * 100).toFixed(1);
                      const mediaDiaria = (tecnico.total / 30).toFixed(1); // Estimativa mensal
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tecnico.tecnico}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tecnico.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mediaDiaria}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{percentual}%</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
            
            {tipoRelatorio === 'cidades' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total de O.S.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% do Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnicos Atuantes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosCidades
                    .filter(item => !filtroCidade || item.cidade === filtroCidade)
                    .map((cidade, index) => {
                      const totalGeral = dadosCidades.reduce((acc, curr) => acc + curr.total, 0);
                      const percentual = ((cidade.total / totalGeral) * 100).toFixed(1);
                      
                      // Contar técnicos únicos por cidade
                      const tecnicosNaCidade = new Set(
                        dadosOS
                          .filter(item => item.cidade === cidade.cidade)
                          .map(item => item.tecnico_campo)
                      ).size;
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cidade.cidade}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cidade.total}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{percentual}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tecnicosNaCidade}</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Relatorios;
