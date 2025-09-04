/**
 * Utilitários para anonimização de dados
 */

// Mapeamento de nomes reais para nomes genéricos
const tecnicoMap: Record<string, string> = {};
const cidadeMap: Record<string, string> = {};
const empresaMap: Record<string, string> = {};
const clienteMap: Record<string, string> = {};

// Letras para nomenclatura genérica
const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Gera um nome genérico para técnicos
 * @param nome Nome real do técnico
 * @returns Nome genérico (ex: "Técnico A")
 */
export const anonimizarTecnico = (nome: string): string => {
  if (!nome) return '';
  
  if (!tecnicoMap[nome]) {
    const index = Object.keys(tecnicoMap).length;
    tecnicoMap[nome] = `Técnico ${letras[index % letras.length]}`;
  }
  
  return tecnicoMap[nome];
};

/**
 * Gera um nome genérico para cidades
 * @param nome Nome real da cidade
 * @returns Nome genérico (ex: "Cidade X")
 */
export const anonimizarCidade = (nome: string): string => {
  if (!nome) return '';
  
  if (!cidadeMap[nome]) {
    const index = Object.keys(cidadeMap).length;
    cidadeMap[nome] = `Cidade ${letras[index % letras.length]}`;
  }
  
  return cidadeMap[nome];
};

/**
 * Gera um nome genérico para empresas
 * @param nome Nome real da empresa
 * @returns Nome genérico (ex: "Empresa Delta")
 */
export const anonimizarEmpresa = (nome: string): string => {
  if (!nome) return '';
  
  if (!empresaMap[nome]) {
    const index = Object.keys(empresaMap).length;
    const empresas = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
    empresaMap[nome] = `Empresa ${empresas[index % empresas.length]}`;
  }
  
  return empresaMap[nome];
};

/**
 * Gera um nome genérico para clientes
 * @param nome Nome real do cliente
 * @returns Nome genérico (ex: "Cliente 001")
 */
export const anonimizarCliente = (nome: string): string => {
  if (!nome) return '';
  
  if (!clienteMap[nome]) {
    const index = Object.keys(clienteMap).length + 1;
    clienteMap[nome] = `Cliente ${index.toString().padStart(3, '0')}`;
  }
  
  return clienteMap[nome];
};

/**
 * Gera um endereço genérico
 * @returns Endereço genérico
 */
export const gerarEnderecoGenerico = (): string => {
  const tipos = ['Rua', 'Avenida', 'Alameda', 'Travessa'];
  const nomes = ['das Flores', 'dos Ipês', 'Principal', 'Central', 'Comercial', 'Industrial', 'Residencial'];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const nome = nomes[Math.floor(Math.random() * nomes.length)];
  const numero = Math.floor(Math.random() * 1000) + 1;
  
  return `${tipo} ${nome}, ${numero}`;
};

/**
 * Gera um telefone genérico
 * @returns Telefone genérico no formato (XX) XXXXX-XXXX
 */
export const gerarTelefoneGenerico = (): string => {
  const ddd = Math.floor(Math.random() * 89) + 11; // DDDs entre 11 e 99
  const parte1 = Math.floor(Math.random() * 90000) + 10000; // 5 dígitos
  const parte2 = Math.floor(Math.random() * 9000) + 1000; // 4 dígitos
  
  return `(${ddd}) ${parte1}-${parte2}`;
};

/**
 * Ajusta valores numéricos para torná-los mais genéricos
 * @param valor Valor original
 * @param variacao Percentual máximo de variação (0.1 = 10%)
 * @returns Valor ajustado
 */
export const ajustarValorNumerico = (valor: number, variacao: number = 0.1): number => {
  if (!valor) return 0;
  
  const fatorAjuste = 1 + (Math.random() * 2 - 1) * variacao;
  return Math.round(valor * fatorAjuste);
};

/**
 * Anonimiza um conjunto de dados de ordens de serviço
 * @param dados Dados originais
 * @returns Dados anonimizados
 */
export const anonimizarDadosOS = (dados: any[]): any[] => {
  return dados.map(item => ({
    ...item,
    nome_cliente: anonimizarCliente(item.nome_cliente),
    tecnico_campo: anonimizarTecnico(item.tecnico_campo),
    cidade: anonimizarCidade(item.cidade),
    endereco: gerarEnderecoGenerico(),
    telefone: item.telefone ? gerarTelefoneGenerico() : '',
    empresa: item.empresa ? anonimizarEmpresa(item.empresa) : ''
  }));
};

/**
 * Anonimiza dados de cidades
 * @param dados Dados originais
 * @returns Dados anonimizados
 */
export const anonimizarDadosCidades = (dados: any[]): any[] => {
  return dados.map(item => ({
    ...item,
    cidade: anonimizarCidade(item.cidade),
    total: ajustarValorNumerico(item.total)
  }));
};

/**
 * Anonimiza dados de técnicos
 * @param dados Dados originais
 * @returns Dados anonimizados
 */
export const anonimizarDadosTecnicos = (dados: any[]): any[] => {
  return dados.map(item => ({
    ...item,
    tecnico: anonimizarTecnico(item.tecnico),
    total: ajustarValorNumerico(item.total)
  }));
};

/**
 * Anonimiza dados de datas
 * @param dados Dados originais
 * @returns Dados anonimizados
 */
export const anonimizarDadosDatas = (dados: any[]): any[] => {
  return dados.map(item => ({
    ...item,
    total: ajustarValorNumerico(item.total)
  }));
};
