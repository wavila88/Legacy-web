export const COUNTRIES = [
  { code: 'BR', flag: '🇧🇷', name: 'Brasil',            dialCode: '55'  },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia',          dialCode: '57'  },
  { code: 'MX', flag: '🇲🇽', name: 'México',            dialCode: '52'  },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina',         dialCode: '54'  },
  { code: 'CL', flag: '🇨🇱', name: 'Chile',             dialCode: '56'  },
  { code: 'PE', flag: '🇵🇪', name: 'Perú / Peru',       dialCode: '51'  },
  { code: 'VE', flag: '🇻🇪', name: 'Venezuela',         dialCode: '58'  },
  { code: 'EC', flag: '🇪🇨', name: 'Ecuador',           dialCode: '593' },
  { code: 'BO', flag: '🇧🇴', name: 'Bolivia',           dialCode: '591' },
  { code: 'PY', flag: '🇵🇾', name: 'Paraguay',          dialCode: '595' },
  { code: 'UY', flag: '🇺🇾', name: 'Uruguay',           dialCode: '598' },
  { code: 'CR', flag: '🇨🇷', name: 'Costa Rica',        dialCode: '506' },
  { code: 'PA', flag: '🇵🇦', name: 'Panamá / Panamá',   dialCode: '507' },
  { code: 'GT', flag: '🇬🇹', name: 'Guatemala',         dialCode: '502' },
  { code: 'HN', flag: '🇭🇳', name: 'Honduras',          dialCode: '504' },
  { code: 'SV', flag: '🇸🇻', name: 'El Salvador',       dialCode: '503' },
  { code: 'NI', flag: '🇳🇮', name: 'Nicaragua',         dialCode: '505' },
  { code: 'DO', flag: '🇩🇴', name: 'Rep. Dominicana',   dialCode: '1809'},
  { code: 'CU', flag: '🇨🇺', name: 'Cuba',              dialCode: '53'  },
  { code: 'PR', flag: '🇵🇷', name: 'Puerto Rico',       dialCode: '1787'},
  { code: 'US', flag: '🇺🇸', name: 'Estados Unidos / EUA', dialCode: '1' },
  { code: 'CA', flag: '🇨🇦', name: 'Canadá',            dialCode: '1'   },
  { code: 'ES', flag: '🇪🇸', name: 'España / Espanha',  dialCode: '34'  },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal',          dialCode: '351' },
  { code: 'GB', flag: '🇬🇧', name: 'Reino Unido / UK',  dialCode: '44'  },
  { code: 'FR', flag: '🇫🇷', name: 'Francia / França',  dialCode: '33'  },
  { code: 'DE', flag: '🇩🇪', name: 'Alemania / Alemanha', dialCode: '49' },
  { code: 'IT', flag: '🇮🇹', name: 'Italia / Itália',   dialCode: '39'  },
  { code: 'NL', flag: '🇳🇱', name: 'Países Bajos / Holanda', dialCode: '31' },
  { code: 'CH', flag: '🇨🇭', name: 'Suiza / Suíça',     dialCode: '41'  },
  { code: 'JP', flag: '🇯🇵', name: 'Japón / Japão',     dialCode: '81'  },
  { code: 'CN', flag: '🇨🇳', name: 'China',             dialCode: '86'  },
  { code: 'IN', flag: '🇮🇳', name: 'India',             dialCode: '91'  },
  { code: 'AU', flag: '🇦🇺', name: 'Australia',         dialCode: '61'  },
];

// Default country per locale
export const DEFAULT_BY_LOCALE = {
  pt: 'BR', // Brasil para portugués
  es: 'CO', // Colombia para español
};

export function getDefaultCountry(locale) {
  const code = DEFAULT_BY_LOCALE[locale] ?? 'BR';
  return COUNTRIES.find(c => c.code === code) ?? COUNTRIES[0];
}
