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
    pr: 'Este produto tem fins informativos e não foi preparado nem é adequado para fins legais, de engenharia ou de levantamento topográfico. Não representa um estudo in sitiu e apenas representa localizações relativas aproximadas. Não há qualquer garantia referente à precisão específica ou ao caráter integral deste produto e a Rice University assim como a equipe de pesquisa de imagineRio não assumem qualquer responsabilidade nem respondem por danos decorrentes de erros e omissões.',
  },
  {
    name: 'legend-title-text',
    selector: '.legend-title-text',
    en: 'Map Legend',
    pr: 'Legenda do Mapa',
  },
  {
    name: 'explore-map-button-text',
    selector: '.explore-map-button-text',
    en: 'Begin Exploring',
    pr: 'Ver o mapa',
  },
  {
    name: 'go-to-map',
    en: 'Go to Map',
    pr: 'Go to Map',
  },
  {
    name: 'back-to-text',
    selector: '.back-to-text',
    en: 'Back to ',
    pr: 'Back to ',
  },
  {
    name: 'start',
    en: 'start',
    pr: 'start',
  },
  {
    name: 'click-for-details',
    en: 'Click for details',
    pr: 'Click for details',
  },
  {
    name: 'probe-hint-text',
    selector: '.probe-hint-text',
    en: 'Click the map to explore, or',
    pr: 'Click the map to explore, or',
  },
  {
    name: 'probe-area-text',
    selector: '.probe-area-text',
    en: 'Expore by area ',
    pr: 'Explore by area ',
  },
  {
    name: 'probe-hint-text--mobile',
    selector: '.probe-hint-text--mobile',
    en: 'Tap the map to explore...',
    pr: 'Tap the map to explore...',
  },
];

const eraTranslations = [
  {
    name: '1502-1808',
    en: 'Colonial Rule',
    pr: 'Colonial Rule',
  },
  {
    name: '1808-1821',
    en: 'Royal Rule',
    pr: 'Royal Rule',
  },
  {
    name: '1822-1831',
    en: 'Imperial Rule I',
    pr: 'Imperial Rule I',
  },
  {
    name: '1831-1839',
    en: 'Regency',
    pr: 'Regency',
  },
  {
    name: '1840-1889',
    en: 'Imperial Rule II',
    pr: 'Imperial Rule II',
  },
  {
    name: '1889-1930',
    en: 'First Republic',
    pr: 'First Republic',
  },
  {
    name: '1930-1945',
    en: 'Vargas Era',
    pr: 'Vargas Era',
  },
  {
    name: '1946-1964',
    en: 'Democratic Interlude',
    pr: 'Democratic Interlude',
  },
  {
    name: '1964-1985',
    en: 'Military Dictatorship',
    pr: 'Military Dictatorship',
  },
  {
    name: `1985-${new Date().getFullYear()}`,
    en: 'New Republic',
    pr: 'New Republic',
  },
];

export default [...translations, ...eraTranslations];
