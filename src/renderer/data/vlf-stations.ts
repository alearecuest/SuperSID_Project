export interface VLFStation {
  id: string;
  callsign: string;
  name: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  frequency: number[];
  power?: number;
  purpose: string;
  status: 'active' | 'inactive' | 'intermittent';
}

export const VLF_STATIONS: VLFStation[] = [
  // USA
  {
    id: 'naa',
    callsign: 'NAA',
    name: 'Cutler Naval Radio Station',
    location: 'Cutler, Maine',
    country: 'USA',
    latitude: 44.6449,
    longitude: -67.2811,
    frequency: [24.0, 17.8],
    power: 1000,
    purpose: 'Military submarine communication',
    status: 'active',
  },
  {
    id: 'nlk',
    callsign: 'NLK',
    name: 'Jim Creek Naval Communications Station',
    location: 'Concrete, Washington',
    country: 'USA',
    latitude: 48.203,
    longitude: -121.917,
    frequency: [24.8],
    power: 250,
    purpose: 'Military submarine communication',
    status: 'active',
  },
  {
    id: 'npm',
    callsign: 'NPM',
    name: 'Naval Transmitter Facility',
    location: 'Lualualei, Hawaii',
    country: 'USA',
    latitude: 21.421,
    longitude: -158.151,
    frequency: [21.4],
    power: 566,
    purpose: 'Military submarine communication',
    status: 'active',
  },
  {
    id: 'nml',
    callsign: 'NML',
    name: 'Naval Transmitter Facility',
    location: 'LaMoure, North Dakota',
    country: 'USA',
    latitude: 46.366,
    longitude: -98.335,
    frequency: [25.2, 12.1],
    power: 500,
    purpose: 'Military submarine communication',
    status: 'active',
  },

  // AUSTRALIA
  {
    id: 'nwc',
    callsign: 'NWC',
    name: 'Naval Communication Station',
    location: 'Exmouth, Western Australia',
    country: 'Australia',
    latitude: -21.816,
    longitude: 114.166,
    frequency: [19.8],
    power: 1000,
    purpose: 'Military submarine communication',
    status: 'active',
  },

  // GERMANY
  {
    id: 'dho38',
    callsign: 'DHO38',
    name: 'Military VLF Transmitter',
    location: 'Rhauderfehn',
    country: 'Germany',
    latitude: 53.079,
    longitude: 7.615,
    frequency: [23.4, 23.8],
    power: 500,
    purpose: 'Military communication',
    status: 'active',
  },

  // FRANCE
  {
    id: 'hwu',
    callsign: 'HWU',
    name: 'VLF Transmitter',
    location: 'Rosnay',
    country: 'France',
    latitude: 46.714,
    longitude: 1.244,
    frequency: [15.1, 18.3, 21.75],
    power: 400,
    purpose: 'Time signal & navigation',
    status: 'active',
  },
  {
    id: 'fta',
    callsign: 'FTA/FTA27',
    name: 'Transmitter Station',
    location: 'Saint-Assise',
    country: 'France',
    latitude: 48.544,
    longitude: 2.579,
    frequency: [16.8, 20.9],
    power: 300,
    purpose: 'Time signal',
    status: 'active',
  },

  // NORWAY
  {
    id: 'jxn',
    callsign: 'JXN',
    name: 'Januszelek VLF Station',
    location: 'Noviken',
    country: 'Norway',
    latitude: 66.974,
    longitude: 13.873,
    frequency: [16.4],
    power: 45,
    purpose: 'Navigation',
    status: 'active',
  },

  // UNITED KINGDOM
  {
    id: 'gbz',
    callsign: 'GBZ/GQD',
    name: 'Anthorn Radio Station',
    location: 'Anthorn, Cumbria',
    country: 'United Kingdom',
    latitude: 54.911,
    longitude: -3.279,
    frequency: [19.58, 22.10],
    power: 500,
    purpose: 'Time signals and navigation',
    status: 'active',
  },
  {
    id: 'gqd',
    callsign: 'GQD',
    name: 'Skelton Radio Station',
    location: 'Skelton',
    country: 'United Kingdom',
    latitude: 54.731,
    longitude: -2.882,
    frequency: [22.1],
    power: 500,
    purpose: 'Time signals',
    status: 'active',
  },

  // ITALY
  {
    id: 'icv',
    callsign: 'ICV',
    name: 'Tavolara VLF Station',
    location: 'Isola di Tavolara',
    country: 'Italy',
    latitude: 40.889,
    longitude: 9.731,
    frequency: [20.27, 20.76],
    power: 43,
    purpose: 'Scientific research',
    status: 'active',
  },

  // SWEDEN
  {
    id: 'saq',
    callsign: 'SAQ',
    name: 'Grimeton VLF Transmitter',
    location: 'Grimeton',
    country: 'Sweden',
    latitude: 57.114,
    longitude: 12.404,
    frequency: [17.2],
    power: 200,
    purpose: 'Historic transmissions',
    status: 'intermittent',
  },

  // TURKEY
  {
    id: 'tbb',
    callsign: 'TBB',
    name: 'Bafa VLF Station',
    location: 'Bafa',
    country: 'Turkey',
    latitude: 37.413,
    longitude: 27.323,
    frequency: [26.7],
    purpose: 'Military communication',
    status: 'active',
  },

  // ICELAND
  {
    id: 'nrk',
    callsign: 'NRK/TFK',
    name: 'Grindavik VLF Station',
    location: 'Grindavik',
    country: 'Iceland',
    latitude: 63.851,
    longitude: -22.467,
    frequency: [37.5],
    power: 100,
    purpose: 'Navigation',
    status: 'active',
  },

  // JAPAN
  {
    id: 'ndt',
    callsign: 'NDT',
    name: 'VLF Transmitter',
    location: 'Ebino',
    country: 'Japan',
    latitude: 32.082,
    longitude: 130.827,
    frequency: [22.2],
    purpose: 'Scientific',
    status: 'active',
  },
  {
    id: 'jjy',
    callsign: 'JJY',
    name: 'Time Signal Station',
    location: 'Mt. Ootakadoya',
    country: 'Japan',
    latitude: 37.372,
    longitude: 140.849,
    frequency: [40.0, 60.0],
    purpose: 'Time signal',
    status: 'active',
  },

  // INDIA
  {
    id: 'vtx',
    callsign: 'VTX1/2/3/4',
    name: 'VLF Transmitter Station',
    location: 'Vijayanarayanam',
    country: 'India',
    latitude: 8.387,
    longitude: 77.752,
    frequency: [16.3, 19.2],
    power: 250,
    purpose: 'Scientific research',
    status: 'active',
  },

  // RUSSIA (LF/VLF)
  {
    id: 'rdl',
    callsign: 'RDL',
    name: 'VLF Time Signal Station',
    location: 'Moscow Region',
    country: 'Russia',
    latitude: 55.502,
    longitude: 37.807,
    frequency: [14.88],
    purpose: 'Time signal',
    status: 'active',
  },

  // CHINA
  {
    id: '3sa',
    callsign: '3SA',
    name: 'VLF Transmitter',
    location: 'Beijing',
    country: 'China',
    latitude: 39.904,
    longitude: 116.408,
    frequency: [23.5],
    purpose: 'Government',
    status: 'active',
  },

  // BRAZIL
  {
    id: 'pwb',
    callsign: 'PWB',
    name: 'Rio de Janeiro Radio',
    location: 'Rio de Janeiro',
    country: 'Brazil',
    latitude: -22.903,
    longitude: -43.209,
    frequency: [16.9],
    purpose: 'Time signal',
    status: 'active',
  },

  // SOUTH AFRICA
  {
    id: 'zse',
    callsign: 'ZSE',
    name: 'VLF Station',
    location: 'Sendelingsdrift',
    country: 'South Africa',
    latitude: -27.655,
    longitude: 25.525,
    frequency: [23.27],
    purpose: 'Scientific',
    status: 'active',
  },

  // EGYPT
  {
    id: 'seu',
    callsign: 'SEU',
    name: 'Abis Radio Station',
    location: 'Abis',
    country: 'Egypt',
    latitude: 30.949,
    longitude: 29.849,
    frequency: [22.84],
    purpose: 'Time signal',
    status: 'active',
  },

  // THAILAND
  {
    id: 'hs',
    callsign: 'HS',
    name: 'Bangkok VLF Station',
    location: 'Bangkok',
    country: 'Thailand',
    latitude: 13.727,
    longitude: 100.526,
    frequency: [16.0],
    purpose: 'Navigation',
    status: 'active',
  },
];

export const getStationById = (id: string): VLFStation | undefined => {
  return VLF_STATIONS.find(station => station.id === id);
};

export const getStationsByCountry = (country: string): VLFStation[] => {
  return VLF_STATIONS.filter(station => station.country === country);
};

export const getCountries = (): string[] => {
  return Array.from(new Set(VLF_STATIONS.map(s => s.country))).sort();
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};