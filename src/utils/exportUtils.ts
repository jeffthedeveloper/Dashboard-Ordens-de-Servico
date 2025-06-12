// Utilitários para exportação de dados

/**
 * Exporta dados para CSV
 * @param data Array de objetos a serem exportados
 * @param filename Nome do arquivo a ser baixado
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || !data.length) {
    console.error('Nenhum dado para exportar');
    return;
  }

  // Obter cabeçalhos das colunas (chaves do primeiro objeto)
  const headers = Object.keys(data[0]);
  
  // Criar linha de cabeçalho
  let csvContent = headers.join(',') + '\n';
  
  // Adicionar linhas de dados
  data.forEach(item => {
    const row = headers.map(header => {
      // Escapar aspas e adicionar aspas em volta de strings com vírgulas
      const cell = item[header] === null || item[header] === undefined ? '' : item[header].toString();
      const escaped = cell.replace(/"/g, '""');
      return cell.includes(',') || cell.includes('"') || cell.includes('\n') 
        ? `"${escaped}"` 
        : escaped;
    }).join(',');
    csvContent += row + '\n';
  });
  
  // Criar blob e link para download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Prepara dados para exportação PDF via backend
 * @param data Dados a serem enviados para o backend
 * @param reportType Tipo de relatório
 * @param filters Filtros aplicados
 */
export const exportToPDF = async (data: any[], reportType: string, filters: any) => {
  try {
    // Em um cenário real, aqui enviaríamos os dados para o backend gerar o PDF
    // Como estamos em um ambiente de demonstração, vamos simular o download
    
    // Criar um objeto com os dados e metadados do relatório
    const reportData = {
      type: reportType,
      filters,
      data,
      generatedAt: new Date().toISOString(),
    };
    
    // Converter para JSON e criar um blob
    const jsonData = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    
    // Criar link para download (simulando o PDF)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_${reportType}_${new Date().getTime()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Exibir mensagem informativa
    alert('Em um ambiente de produção, esta função enviaria os dados para o backend gerar um PDF usando WeasyPrint. Para esta demonstração, os dados foram exportados em formato JSON.');
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    return false;
  }
};
