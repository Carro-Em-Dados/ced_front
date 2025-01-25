import React, { useState, useEffect } from "react";

interface BrandOption {
  codigo: string;
  nome: string;
}

interface BrandAutocompleteProps {
  options: BrandOption[];
  setSelectedBrand: (brand: string) => void;
  onChange: (nome: string) => void;
}

const BrandAutocomplete: React.FC<BrandAutocompleteProps> = ({
  options: brands,
  setSelectedBrand,
  onChange,
}) => {
  const [filteredBrands, setFilteredBrands] = useState<BrandOption[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setFilteredBrands(brands);
  }, [brands]);

  const handleFilter = (inputValue: string) => {
    const filtered = brands.filter((brand) =>
      brand.nome.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredBrands(filtered);
  };

  const handleSelection = (brand: BrandOption) => {
    setSelectedBrand(brand.nome);
    if (onChange) {
      onChange(brand.nome);
    }
    setInputValue(brand.nome);
    setDropdownVisible(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        className="w-full border bg-transparent border-gray-300 rounded-md p-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 z-100"
        placeholder="Selecione uma marca..."
        onChange={(e) => {
            const value = e.target.value;
            setInputValue(value);
            handleFilter(value);
            setDropdownVisible(true);
        }}
        onFocus={() => setDropdownVisible(true)}
        value={inputValue}
      />
      {isDropdownVisible && (
        <ul className="absolute z-30 w-full bg-black border border-gray-300 rounded-md mt-14 max-h-60 overflow-y-auto shadow-md">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => (
              <li
                key={brand.codigo}
                className="p-2 cursor-pointer hover:bg-blue-500 hover:text-white"
                onClick={() => {
                  handleSelection(brand);
                }}
              >
                {brand.nome}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">Nenhuma opção encontrada</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default BrandAutocomplete;
