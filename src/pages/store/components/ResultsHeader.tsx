import SortDropdown from "./SortDropdown";

interface ResultsHeaderProps {
  totalProducts: number;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const ResultsHeader = ({ totalProducts, sortBy, setSortBy }: ResultsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-muted-foreground">
        Affichage <span className="text-foreground font-medium">1-{totalProducts}</span> sur <span className="text-foreground font-medium">{totalProducts}</span> produit(s)
      </p>
      <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
    </div>
  );
};

export default ResultsHeader;
