import { useSettings } from '../contexts/SettingsContext';

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  INR: '₹',
  NPR: 'रू',
};

const currencyLocales: { [key: string]: string } = {
  USD: 'en-US',
  INR: 'en-IN',
  NPR: 'en-IN', // Nepali numbering format is similar to Indian for this purpose
};

export const useCurrency = () => {
  const { currency } = useSettings();

  const formatCurrency = (value: number, options: { compact?: boolean, minimumFractionDigits?: number, maximumFractionDigits?: number } = {}) => {
    if (typeof value !== 'number') {
      value = 0;
    }

    const symbol = currencySymbols[currency];

    if (options.compact) {
      // Use US locale for consistent K/M/B suffixes regardless of currency
      const maxDigits = options.maximumFractionDigits ?? 1;
      // If minDigits is provided, use it, otherwise default it to be no more than maxDigits.
      const minDigits = options.minimumFractionDigits ?? Math.min(1, maxDigits);

      const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        minimumFractionDigits: minDigits,
        maximumFractionDigits: maxDigits,
      });
      return `${symbol}${formatter.format(value)}`;
    }

    const locale = currencyLocales[currency];
    const maxDigits = options.maximumFractionDigits ?? 2;
    // If minDigits is provided, use it, otherwise default it to be no more than maxDigits.
    const minDigits = options.minimumFractionDigits ?? Math.min(2, maxDigits);
    
    const numberPart = new Intl.NumberFormat(locale, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    }).format(value);

    return `${symbol}${numberPart}`;
  };

  const getCurrencySymbol = () => currencySymbols[currency];

  return { formatCurrency, currency, getCurrencySymbol };
};
