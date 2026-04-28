'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { COUNTRIES, getDefaultCountry } from '@/lib/countries';

export default function PhoneInput({ value, onChange, placeholder, className }) {
  const t      = useTranslations('create');
  const locale = useLocale();

  const [open,        setOpen]        = useState(false);
  const [search,      setSearch]      = useState('');
  const [country,     setCountry]     = useState(() => getDefaultCountry(locale));
  const [localNumber, setLocalNumber] = useState('');
  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  // Parse incoming value on prefill
  useEffect(() => {
    if (!value) return;
    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const match = sorted.find(c => value.startsWith(`+${c.dialCode}`));
    if (match) {
      setCountry(match);
      setLocalNumber(value.slice(match.dialCode.length + 1));
    } else {
      setLocalNumber(value.replace(/^\+/, ''));
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const emit = (c, num) => {
    const digits = num.replace(/\D/g, '');
    onChange(digits ? `+${c.dialCode}${digits}` : '');
  };

  const handleLocalChange = (val) => {
    setLocalNumber(val);
    emit(country, val);
  };

  const handleCountrySelect = (c) => {
    setCountry(c);
    setOpen(false);
    setSearch('');
    emit(c, localNumber);
  };

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={s.wrapper} ref={dropdownRef}>
      <div style={s.row}>
        {/* Country button */}
        <button
          type="button"
          style={s.countryBtn}
          onClick={() => setOpen((o) => !o)}
          aria-label={t('selectCountry')}
        >
          <span style={s.flag}>{country.flag}</span>
          <span style={s.dialCode}>+{country.dialCode}</span>
          <span style={s.chevron}>{open ? '▲' : '▼'}</span>
        </button>

        {/* Number input — placeholder is just local format, no country code */}
        <input
          type="tel"
          inputMode="tel"
          value={localNumber}
          onChange={(e) => handleLocalChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          style={s.numberInput}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div style={s.dropdown}>
          <div style={s.searchBox}>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchCountry')}
              style={s.searchInput}
            />
          </div>
          <div style={s.list}>
            {filtered.length === 0 ? (
              <p style={s.noResults}>{t('noCountryResults')}</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  style={{ ...s.option, ...(c.code === country.code ? s.optionActive : {}) }}
                >
                  <span style={s.optionFlag}>{c.flag}</span>
                  <span style={s.optionName}>{c.name}</span>
                  <span style={s.optionDial}>+{c.dialCode}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper:     { position: 'relative', width: '100%' },
  row:         { display: 'flex', gap: 8, alignItems: 'center' },
  countryBtn:  {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '10px 12px', borderRadius: 10,
    border: '1.5px solid #D8B4FE', backgroundColor: '#F5F3FF',
    cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
  },
  flag:        { fontSize: 20, lineHeight: 1 },
  dialCode:    { fontSize: 14, fontWeight: 700, color: '#5B21B6' },
  chevron:     { fontSize: 9, color: '#9CA3AF', marginLeft: 2 },
  numberInput: { flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #D8B4FE', fontSize: 15, outline: 'none', minWidth: 0 },
  dropdown:    {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderRadius: 12, border: '1.5px solid #D8B4FE',
    boxShadow: '0 8px 24px rgba(124,58,237,0.15)', zIndex: 100, overflow: 'hidden',
  },
  searchBox:   { padding: '10px 10px 6px' },
  searchInput: {
    width: '100%', padding: '8px 12px', borderRadius: 8,
    border: '1px solid #E5E7EB', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', backgroundColor: '#F9FAFB',
  },
  list:        { maxHeight: 220, overflowY: 'auto' },
  option:      {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%', padding: '10px 14px',
    border: 'none', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
  },
  optionActive: { backgroundColor: '#F5F3FF' },
  optionFlag:   { fontSize: 18, flexShrink: 0, minWidth: 24 },
  optionName:   { flex: 1, fontSize: 14, color: '#1F2937' },
  optionDial:   { fontSize: 13, color: '#7C3AED', fontWeight: 600 },
  noResults:    { padding: '12px 14px', fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
};
