// Based on common RapidLEI supported jurisdictions
export interface SupportedJurisdiction {
  code: string;
  name: string;
  supported: boolean;
}

export const supportedJurisdictions: SupportedJurisdiction[] = [
  { code: "US", name: "United States", supported: true },
  { code: "GB", name: "United Kingdom", supported: true },
  { code: "DE", name: "Germany", supported: true },
  { code: "FR", name: "France", supported: true },
  { code: "IT", name: "Italy", supported: true },
  { code: "ES", name: "Spain", supported: true },
  { code: "NL", name: "Netherlands", supported: true },
  { code: "BE", name: "Belgium", supported: true },
  { code: "CH", name: "Switzerland", supported: true },
  { code: "AT", name: "Austria", supported: true },
  { code: "LU", name: "Luxembourg", supported: true },
  { code: "IE", name: "Ireland", supported: true },
  { code: "DK", name: "Denmark", supported: true },
  { code: "SE", name: "Sweden", supported: true },
  { code: "NO", name: "Norway", supported: true },
  { code: "FI", name: "Finland", supported: true },
  { code: "PL", name: "Poland", supported: true },
  { code: "CZ", name: "Czech Republic", supported: true },
  { code: "HU", name: "Hungary", supported: true },
  { code: "SK", name: "Slovakia", supported: true },
  { code: "SI", name: "Slovenia", supported: true },
  { code: "EE", name: "Estonia", supported: true },
  { code: "LV", name: "Latvia", supported: true },
  { code: "LT", name: "Lithuania", supported: true },
  { code: "MT", name: "Malta", supported: true },
  { code: "CY", name: "Cyprus", supported: true },
  { code: "BG", name: "Bulgaria", supported: true },
  { code: "RO", name: "Romania", supported: true },
  { code: "HR", name: "Croatia", supported: true },
  { code: "GR", name: "Greece", supported: true },
  { code: "PT", name: "Portugal", supported: true },
  { code: "CA", name: "Canada", supported: true },
  { code: "JP", name: "Japan", supported: true },
  { code: "SG", name: "Singapore", supported: true },
  { code: "HK", name: "Hong Kong", supported: true },
  { code: "LI", name: "Liechtenstein", supported: true },
  { code: "IS", name: "Iceland", supported: true },
  // Add more as needed based on actual RapidLEI support
];

export const getSupportedJurisdictions = (): SupportedJurisdiction[] => {
  return supportedJurisdictions.filter(j => j.supported);
};

export const isJurisdictionSupported = (code: string): boolean => {
  const jurisdiction = supportedJurisdictions.find(j => j.code === code);
  return jurisdiction ? jurisdiction.supported : false;
};