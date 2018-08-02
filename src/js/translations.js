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
    name: 'era-description',
    selector: '.era-description',
    en: 'imagineRio is a searchable digital atlas that illustrates the social and urban evolution of Rio de Janeiro, as it existed and as it was imagined. Views, historical  maps, and ground floor plans –from iconographic, cartographic, and architectural archives– are located in both time and space while their visual and spatial data are integrated across a number of databases and servers, including a public repository of images, a geographic information system, an open-source relational database, and a content delivery web system. The relationship between the various project elements produces a web environment where vector, spatial, and raster data are simultaneously probed, toggled, viewed, and/or queried in a system that supports multiple expressions of diverse data sources. It is an environment where, for example, historians can visualize specific sites both temporally and spatially, where architects and urbanists can see proposed design projects in situ, where literary scholars can map out novels while visualizing their contexts, and where archaeologists can reconstruct complex stratigraphies. Scaled down into a mobile version, the site allows tourists and residents to walk about town while visualizing the city as it once was as well as it was once projected. Rio de Janeiro\'s urban history is particularly well suited to being captured diachronically considering how much the city\'s natural environment, urban fabric, and self-representation have changed over time. To make Rio what it is today, hills were leveled, swamps drained, shorelines redrawn, and islands joined to the mainland, while its Tijuca Forest was first cleared due to the planting of coffee and charcoal extraction only to later be replanted for the protection of water sources. Such a changing physical and social landscape, with all its political consequences, lends itself to being spatially contextualized in a digital platform that illustrates the change of time.',
    pr: 'O imagineRio é um atlas digital pesquisável que ilustra a evolução social e urbana do Rio de Janeiro, tal como existia e como era imaginado.  Vistas, mapas históricos e plantas baixas -de arquivos iconográficos, cartográficos e arquitetônicos- são localizados no tempo e no espaço, enquanto seus dados visuais e espaciais são integrados em vários bancos de dados e servidores, incluindo um repositório público de imagens, um sistema de informações geográficas, um banco de dados relacional de código aberto e um sistema online de disponibilização de conteúdo. A relação entre os vários elementos do projeto produz um ambiente web onde dados vetoriais, espaciais e matriciais são simultaneamente sondáveis, alternáveis, visualizáveis e/ou consultáveis em um sistema que suporta múltiplas expressões de diversas fontes de dados. É um ambiente onde, por exemplo, historiadores podem visualizar lugares específicos tanto temporalmente quanto espacialmente, onde arquitetos e urbanistas podem ver projetos propostos in situ, onde pesquisadores literários podem mapear romances enquanto visualizam seus contextos, e onde arqueólogos podem reconstruir estratigrafias complexas. Adaptado para uma versão móvel, o site pode ser usado por turistas e moradores enquanto caminham pela cidade visualizando-a como era e como já foi projetada. A história urbana do Rio de Janeiro é particularmente adequada para ser capturada em um mapa diacrônico, considerando o quanto o ambiente natural da cidade, seu tecido urbano e sua auto-representação mudaram no tempo. Para tornar o Rio em o que hoje é, morros foram desmantelados, pântanos drenados, linhas costeiras redesenhadas, e ilhas unidas ao continente, enquanto sua Floresta da Tijuca inicialmente desmatada por causa da cafeicultura e da extração de carvão, foi ao longo do tempo replantada para proteger as fontes de água. Uma paisagem física e social tão mutável, com todas as suas conseqüências políticas, presta-se a ser contextualizada espacialmente em uma plataforma digital que ilustra as mudanças do tempo.',
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
