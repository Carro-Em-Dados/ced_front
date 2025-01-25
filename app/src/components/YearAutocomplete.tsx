import React, { useState, useEffect } from "react";

interface YearOption {
  nome: string;
  codigo: string;
}

interface YearAutocompleteProps {
  years: YearOption[];
  onChange: (nome: string) => void;
  yearState: string;
  manufacturer: string;
  loadingFetch: boolean;
}

const YearAutocomplete = ({
  years,
  onChange,
  yearState,
  manufacturer,
  loadingFetch,
}: YearAutocompleteProps) => {
  const [filteredYears, setFilteredYears] = useState<YearOption[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (manufacturer && !loadingFetch) {
      setFilteredYears(years);
    } else {
      setFilteredYears([]);
    }
  }, [years, manufacturer, loadingFetch]);

  useEffect(() => {
    setInputValue(yearState);
  }, [yearState]);

  const handleSelection = (year: string) => {
    setInputValue(year);
    setDropdownVisible(false);
    onChange(year);
  };

  const handleClear = () => {
    setDropdownVisible(false);
    onChange("");
    setInputValue(yearState);
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          className={`w-full border bg-transparent border-gray-300 rounded-md p-2 outline-none pr-10 ${
            !manufacturer || loadingFetch
              ? "cursor-not-allowed"
              : "focus:border-gray-500 focus:ring-2 focus:ring-gray-500"
          }`}
          value={inputValue}
          onFocus={() => setDropdownVisible(true)}
          disabled={!manufacturer || loadingFetch}
          placeholder="Selecione um ano..."
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
      {isDropdownVisible && filteredYears.length > 0 && (
        <ul className="absolute z-30 w-auto bg-gradient-to-b from-white via-slate-200 to-slate-400 border border-gray-300 mt-14 max-h-40 py-2 scrollbar-hide overflow-y-auto rounded-xl shadow-md">
          {filteredYears.map((year) => (
            <li
              key={year.codigo}
              className="p-2 rounded-xl text-black cursor-pointer hover:bg-gray-500 hover:text-white text-small"
              onClick={() => handleSelection(year.nome)}
            >
              {year.nome}
            </li>
          ))}
        </ul>
      )}
      {isDropdownVisible && filteredYears.length === 0 && (
        <ul className="absolute z-30 w-full bg-white border border-gray-300 rounded-md mt-14 shadow-md">
          <li className="p-2 rounded-xl text-black">
            Nenhuma opção encontrada
          </li>
        </ul>
      )}
    </div>
  );
};

export default YearAutocomplete;
