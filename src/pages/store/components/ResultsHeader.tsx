import SortDropdown from "./SortDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResultsHeaderProps {
  totalProducts: number;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const ResultsHeader = ({ totalProducts, sortBy, setSortBy }: ResultsHeaderProps) => {
  const { t, language } = useLanguage();

  // French text (default)
  const fr = {
    showing: "Affichage",
    of: "sur",
    products: "produit(s)"
  };

  const getText = (key: string): string => {
    if (language === 'fr') {
      const value = fr[key as keyof typeof fr];
      return typeof value === 'string' ? value : key;
    }
    return t(`results.${key}`, 'store');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-muted-foreground">
        {getText('showing')} <span className="text-foreground font-medium">1-{totalProducts}</span> {getText('of')} <span className="text-foreground font-medium">{totalProducts}</span> {totalProducts === 1 ? (language === 'fr' ? 'produit' : t('results.product', 'store')) : getText('products')}
      </p>
      <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
    </div>
  );
};

export default ResultsHeader;
