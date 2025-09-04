/**
 * Utilitários para melhorar a acessibilidade do site
 */

/**
 * Adiciona atributos ARIA para melhorar a acessibilidade de elementos interativos
 * @param element Elemento HTML a ser aprimorado
 * @param label Descrição do elemento para leitores de tela
 * @param role Função do elemento na interface
 */
export const enhanceAccessibility = (element: HTMLElement, label: string, role?: string) => {
  if (label) {
    element.setAttribute('aria-label', label);
  }
  
  if (role) {
    element.setAttribute('role', role);
  }
  
  // Garantir que elementos interativos sejam focáveis
  if (!element.hasAttribute('tabindex') && 
      !['a', 'button', 'input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
    element.setAttribute('tabindex', '0');
  }
};

/**
 * Aumenta o contraste de texto para melhorar a legibilidade
 * @param element Elemento de texto
 * @param highContrast Se verdadeiro, aplica contraste mais alto
 */
export const enhanceTextContrast = (element: HTMLElement, highContrast: boolean = false) => {
  if (highContrast) {
    element.classList.add('text-high-contrast');
  } else {
    element.classList.add('text-enhanced-contrast');
  }
};

/**
 * Adiciona dicas de navegação por teclado
 * @param container Elemento contêiner
 */
export const addKeyboardNavigationTips = (container: HTMLElement) => {
  const tip = document.createElement('div');
  tip.className = 'sr-only';
  tip.textContent = 'Use as teclas Tab para navegar e Enter para selecionar';
  container.prepend(tip);
};

/**
 * Verifica e melhora o contraste de cores
 * @param foreground Cor de primeiro plano (texto)
 * @param background Cor de fundo
 * @returns Cor de primeiro plano ajustada se necessário
 */
export const ensureColorContrast = (foreground: string, background: string): string => {
  // Implementação simplificada - em um cenário real, usaríamos cálculos de contraste WCAG
  // Esta é apenas uma demonstração do conceito
  
  // Converter cores para valores RGB
  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };
  
  // Calcular luminância (simplificado)
  const calculateLuminance = (color: string) => {
    const rgb = hexToRgb(color);
    return 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  };
  
  const foregroundLuminance = calculateLuminance(foreground);
  const backgroundLuminance = calculateLuminance(background);
  
  // Se o contraste não for suficiente, ajustar a cor do texto
  const contrastRatio = Math.abs(foregroundLuminance - backgroundLuminance);
  
  if (contrastRatio < 128) {  // Valor arbitrário para demonstração
    // Escurecer ou clarear o texto dependendo do fundo
    return backgroundLuminance > 128 ? '#000000' : '#ffffff';
  }
  
  return foreground;
};

/**
 * Adiciona atributos para suporte a leitores de tela em imagens
 * @param imgElement Elemento de imagem
 * @param altText Texto alternativo descritivo
 * @param isDecorative Se a imagem é apenas decorativa
 */
export const enhanceImageAccessibility = (
  imgElement: HTMLImageElement, 
  altText: string, 
  isDecorative: boolean = false
) => {
  if (isDecorative) {
    imgElement.setAttribute('alt', '');
    imgElement.setAttribute('aria-hidden', 'true');
    imgElement.setAttribute('role', 'presentation');
  } else {
    imgElement.setAttribute('alt', altText);
    
    // Se a imagem transmite informações complexas, adicionar descrição mais detalhada
    if (altText.length > 100) {
      const id = `desc-${Math.random().toString(36).substring(2, 9)}`;
      const descElement = document.createElement('div');
      descElement.id = id;
      descElement.className = 'sr-only';
      descElement.textContent = altText;
      
      imgElement.setAttribute('aria-describedby', id);
      imgElement.parentNode?.appendChild(descElement);
    }
  }
};
