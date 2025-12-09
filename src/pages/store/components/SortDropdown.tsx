import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";

interface SortDropdownProps {
  sortBy: string;
  setSortBy: (value: string) => void;
}

const SortDropdown = ({ sortBy, setSortBy }: SortDropdownProps) => {
  return (
    <Select value={sortBy} onValueChange={setSortBy}>
      <SelectTrigger className="h-9 w-40 bg-card/30 border-white/10 hover:bg-card/50 rounded-lg px-3 text-sm">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10 rounded-xl p-1 z-[100]">
        <SelectItem value="featured" className="rounded-lg text-xs cursor-pointer">Mis en avant</SelectItem>
        <SelectItem value="newest" className="rounded-lg text-xs cursor-pointer">Plus récents</SelectItem>
        <SelectItem value="price-low" className="rounded-lg text-xs cursor-pointer">Prix croissant</SelectItem>
        <SelectItem value="price-high" className="rounded-lg text-xs cursor-pointer">Prix décroissant</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
