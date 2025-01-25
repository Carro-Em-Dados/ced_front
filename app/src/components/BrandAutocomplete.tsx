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

  const handleSelection = (brand: BrandOption) => {
    setInputValue(brand.nome);
    setDropdownVisible(false);
    onChange(brand.nome);
  };

  const handleClear = () => {
    setInputValue("");
    setDropdownVisible(false);
    onChange("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          className="w-full border bg-transparent border-gray-300 rounded-md p-2 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-500 pr-10"
          placeholder="Selecione uma marca..."
          onFocus={() => setDropdownVisible(true)}
          value={inputValue}
          readOnly
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-2 flex items-center text-gray-100 hover:text-gray-300 focus:outline-none"
          >
            &#x2715;
          </button>
        )}
      </div>
      {isDropdownVisible && (
        <ul className="absolute z-30 w-auto bg-white border border-gray-300 mt-2 max-h-60 py-3 overflow-y-auto rounded-xl shadow-md">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brandFiletered) => (
              <li
                key={brandFiletered.codigo}
                className="p-2 text-black rounded-xl cursor-pointer hover:bg-gray-500 hover:text-white"
                onClick={() => {
                  handleSelection(brandFiletered);
                }}
              >
                {brandFiletered.nome}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500 rounded-xl">
              Nenhuma opção encontrada
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default BrandAutocomplete;
