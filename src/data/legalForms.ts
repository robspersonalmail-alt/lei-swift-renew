export interface LegalForm {
  code: string;
  name: string;
  jurisdiction?: string;
}

export const legalForms: LegalForm[] = [
  // Common international forms
  { code: "XTNT", name: "Limited Company" },
  { code: "8888", name: "Corporation" },
  { code: "LLCO", name: "Limited Liability Company (LLC)" },
  { code: "PART", name: "Partnership" },
  { code: "SOLE", name: "Sole Proprietorship" },
  { code: "COOP", name: "Cooperative" },
  { code: "FOUN", name: "Foundation" },
  { code: "TRUS", name: "Trust" },
  { code: "ASSO", name: "Association" },
  { code: "BRAN", name: "Branch" },
  { code: "SUCC", name: "Branch (Succursale)" },
  { code: "REPR", name: "Representative Office" },
  
  // UK specific
  { code: "PRIV", name: "Private Company Limited by Shares", jurisdiction: "GB" },
  { code: "PUBL", name: "Public Limited Company (PLC)", jurisdiction: "GB" },
  { code: "LIMI", name: "Private Company Limited by Guarantee", jurisdiction: "GB" },
  { code: "UNLM", name: "Unlimited Company", jurisdiction: "GB" },
  { code: "LLPS", name: "Limited Liability Partnership (LLP)", jurisdiction: "GB" },
  { code: "GENP", name: "General Partnership", jurisdiction: "GB" },
  { code: "LIPA", name: "Limited Partnership", jurisdiction: "GB" },
  { code: "CHAR", name: "Charitable Incorporated Organisation", jurisdiction: "GB" },
  
  // US specific
  { code: "CORP", name: "Corporation (Inc.)", jurisdiction: "US" },
  { code: "SCOR", name: "S Corporation", jurisdiction: "US" },
  { code: "CCOR", name: "C Corporation", jurisdiction: "US" },
  { code: "LLC", name: "Limited Liability Company", jurisdiction: "US" },
  { code: "PLLC", name: "Professional Limited Liability Company", jurisdiction: "US" },
  { code: "LP", name: "Limited Partnership", jurisdiction: "US" },
  { code: "LLP", name: "Limited Liability Partnership", jurisdiction: "US" },
  { code: "GP", name: "General Partnership", jurisdiction: "US" },
  { code: "PC", name: "Professional Corporation", jurisdiction: "US" },
  { code: "REIT", name: "Real Estate Investment Trust", jurisdiction: "US" },
  
  // German specific
  { code: "GMBH", name: "Gesellschaft mit beschränkter Haftung (GmbH)", jurisdiction: "DE" },
  { code: "AG", name: "Aktiengesellschaft", jurisdiction: "DE" },
  { code: "KG", name: "Kommanditgesellschaft", jurisdiction: "DE" },
  { code: "OHG", name: "Offene Handelsgesellschaft", jurisdiction: "DE" },
  { code: "GMBHKG", name: "GmbH & Co. KG", jurisdiction: "DE" },
  { code: "UG", name: "Unternehmergesellschaft", jurisdiction: "DE" },
  
  // French specific
  { code: "SARL", name: "Société à responsabilité limitée", jurisdiction: "FR" },
  { code: "SA", name: "Société anonyme", jurisdiction: "FR" },
  { code: "SAS", name: "Société par actions simplifiée", jurisdiction: "FR" },
  { code: "SASU", name: "Société par actions simplifiée unipersonnelle", jurisdiction: "FR" },
  { code: "EURL", name: "Entreprise unipersonnelle à responsabilité limitée", jurisdiction: "FR" },
  { code: "SNC", name: "Société en nom collectif", jurisdiction: "FR" },
  { code: "SCS", name: "Société en commandite simple", jurisdiction: "FR" },
  
  // Netherlands specific
  { code: "BV", name: "Besloten Vennootschap", jurisdiction: "NL" },
  { code: "NV", name: "Naamloze Vennootschap", jurisdiction: "NL" },
  { code: "VOF", name: "Vennootschap onder Firma", jurisdiction: "NL" },
  { code: "CV", name: "Commanditaire Vennootschap", jurisdiction: "NL" },
  { code: "COOP", name: "Coöperatie", jurisdiction: "NL" },
  { code: "STICHT", name: "Stichting", jurisdiction: "NL" },
  { code: "VERR", name: "Vereniging", jurisdiction: "NL" },
  
  // Other European
  { code: "SRL", name: "Società a responsabilità limitata", jurisdiction: "IT" },
  { code: "SPA", name: "Società per azioni", jurisdiction: "IT" },
  { code: "SL", name: "Sociedad Limitada", jurisdiction: "ES" },
  { code: "SA", name: "Sociedad Anónima", jurisdiction: "ES" },
  { code: "LDA", name: "Sociedade por Quotas", jurisdiction: "PT" },
  { code: "SA", name: "Sociedade Anónima", jurisdiction: "PT" },
  
  // Nordic countries
  { code: "AB", name: "Aktiebolag", jurisdiction: "SE" },
  { code: "HB", name: "Handelsbolag", jurisdiction: "SE" },
  { code: "KB", name: "Kommanditbolag", jurisdiction: "SE" },
  { code: "AS", name: "Aksjeselskap", jurisdiction: "NO" },
  { code: "ASA", name: "Allmennaksjeselskap", jurisdiction: "NO" },
  { code: "AS", name: "Aktieselskab", jurisdiction: "DK" },
  { code: "APS", name: "Anpartsselskab", jurisdiction: "DK" },
  
  // Canada
  { code: "CORP", name: "Corporation", jurisdiction: "CA" },
  { code: "INC", name: "Incorporated", jurisdiction: "CA" },
  { code: "LTD", name: "Limited", jurisdiction: "CA" },
  { code: "LTEE", name: "Limitée", jurisdiction: "CA" },
  { code: "ULC", name: "Unlimited Liability Corporation", jurisdiction: "CA" },
  
  // Australia
  { code: "PTY", name: "Proprietary Company", jurisdiction: "AU" },
  { code: "LTD", name: "Public Company", jurisdiction: "AU" },
  { code: "PART", name: "Partnership", jurisdiction: "AU" },
  { code: "TRUST", name: "Trust", jurisdiction: "AU" },
  
  // Asia
  { code: "LTD", name: "Limited Company", jurisdiction: "HK" },
  { code: "PTE", name: "Private Limited Company", jurisdiction: "SG" },
  { code: "LTD", name: "Public Limited Company", jurisdiction: "SG" },
  { code: "KK", name: "Kabushiki Kaisha", jurisdiction: "JP" },
  { code: "GK", name: "Godo Kaisha", jurisdiction: "JP" },
];

export const getLegalFormsByJurisdiction = (jurisdiction: string): LegalForm[] => {
  return legalForms.filter(form => !form.jurisdiction || form.jurisdiction === jurisdiction);
};

export const getLegalFormByCode = (code: string): LegalForm | undefined => {
  return legalForms.find(form => form.code === code);
};

export const getLegalFormName = (code: string): string => {
  const form = getLegalFormByCode(code);
  return form ? form.name : code;
};
