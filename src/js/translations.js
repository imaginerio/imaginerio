const translations = [
  {
    name: 'jump-to-era',
    selector: '.era-dropdown-text',
    en: 'Jump to era... ',
    pr: 'Ir direto para o período... ',
  },
  {
    name: 'h1',
    selector: 'h1',
    en: 'imagineRio',
    pr: 'imagináRio',
  },
  {
    name: 'disclaimer-text',
    selector: '.disclaimer-text',
    en: 'This product is for informational purposes and was neither prepared nor is suitable for legal, engineering, or surveying purposes. Represented objects have approximate locations relative to a particular moment of the research project. No warranty is made regarding specific accuracy or completeness. Rice University and the imagineRio research team assume no liability or damages due to errors or omissions.',
    pr: 'Este produto tem fins informativos e não foi produzido nem é adequado para fins legais, de engenharia ou de levantamento topográfico. Os elementos representados têm localizações aproximadas e correspondem a um momento particular do projeto de pesquisa, não havendo garantia quanto a sua exatidão. A Rice University e a equipe de pesquisa de imagineRio não assumem qualquer responsabilidade em relação a danos devidos a erros ou omissões.',
  },
  {
    name: 'legend-title-text',
    selector: '.legend-title-text',
    en: 'Map Legend',
    pr: 'Legenda',
  },
  {
    name: 'explore-map-button-text',
    selector: '.explore-map-button-text',
    en: 'Begin Exploring',
    pr: 'Explore',
  },
  {
    name: 'go-to-map',
    en: 'Go to Map',
    pr: 'Ir para o mapa',
  },
  {
    name: 'back-to-text',
    selector: '.back-to-text',
    en: 'Back to ',
    pr: 'Retornar para ',
  },
  {
    name: 'start',
    en: 'start',
    pr: 'o início',
  },
  {
    name: 'click-for-details',
    en: 'Click for details',
    pr: 'Cliquar para ver os detalhes',
  },
  {
    name: 'probe-hint-text',
    selector: '.probe-hint-text',
    en: 'Click the map to explore, or',
    pr: 'Cliquar no mapa para explorar, ou',
  },
  {
    name: 'probe-area-text',
    selector: '.probe-area-text',
    en: 'Expore by area ',
    pr: 'Explorar por área ',
  },
  {
    name: 'probe-hint-text--mobile',
    selector: '.probe-hint-text--mobile',
    en: 'Tap the map to explore...',
    pr: 'Clique o mapa para explorar...',
  },
  {
    name: 'plans',
    en: 'Urban Projects',
    pr: 'Projetos Urbanos',
  },
  {
    name: 'search-map-layers',
    selector: '.search-map-layers-text',
    en: 'Search map layers...',
    pr: 'Buscar nas camadas do mapa...',
  },
];

const eraTranslations = [
  {
    name: '1502-1808',
    en: 'Colonial Rule',
    pr: 'Período colonial',
  },
  {
    name: '1808-1821',
    en: 'Royal Rule',
    pr: 'Período Joanino',
  },
  {
    name: '1822-1831',
    en: 'Imperial Rule I',
    pr: 'Primeiro Império',
  },
  {
    name: '1831-1839',
    en: 'Regency',
    pr: 'Regência',
  },
  {
    name: '1840-1889',
    en: 'Imperial Rule II',
    pr: 'Segundo Império',
  },
  {
    name: '1889-1930',
    en: 'First Republic',
    pr: 'Primeira República',
  },
  {
    name: '1930-1945',
    en: 'Vargas Era',
    pr: 'Era Vargas',
  },
  {
    name: '1946-1964',
    en: 'Democratic Interlude',
    pr: 'Período Democrático',
  },
  {
    name: '1964-1985',
    en: 'Military Dictatorship',
    pr: 'Ditadura Militar',
  },
  {
    name: `1985-${new Date().getFullYear()}`,
    en: 'New Republic',
    pr: 'Nova República',
  },
];

export default [...translations, ...eraTranslations];
