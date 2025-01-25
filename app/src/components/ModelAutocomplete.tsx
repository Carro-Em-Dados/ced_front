import React, { useState, useEffect } from "react";
import { IoArrowDown } from "react-icons/io5";

interface ModelOption {
  codigo: string;
  nome: string;
}

interface ModelAutocompleteProps {
  models: ModelOption[];
  setSelectedModel: (modelCode: string) => void;
  setCarModel: (carModel: string) => void;
  manufacturer: string;
  loadingFetch: boolean;
}

const ModelAutocomplete = ({
  models,
  setSelectedModel,
  setCarModel,
  manufacturer,
  loadingFetch,
}: ModelAutocompleteProps) => {
  const [filteredModels, setFilteredModels] = useState<ModelOption[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (manufacturer && !loadingFetch) {
      setFilteredModels(models);
    } else {
      setFilteredModels([]);
    }
  }, [models, manufacturer, loadingFetch]);

  const handleSelection = (model: ModelOption) => {
    setSelectedModel(model.codigo);
    setCarModel(model.nome);
    setInputValue(model.nome);
    setDropdownVisible(false);
  };

  const handleClear = () => {
    setInputValue("");
    setSelectedModel("");
    setCarModel("");
    setDropdownVisible(false);
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
          onChange={(e) => {
            const value = e.target.value;
            setInputValue(value);
            setDropdownVisible(true);
          }}
          placeholder="Selecione um modelo..."
          onFocus={() => setDropdownVisible(true)}
          disabled={!manufacturer || loadingFetch}
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

      {isDropdownVisible && filteredModels.length > 0 && (
        <ul className="absolute z-30 w-auto bg-white border border-gray-300 mt-14 max-h-60 py-2 scrollbar-hide overflow-y-auto rounded-xl shadow-md">
          {filteredModels.map((model) => (
            <li
              key={model.codigo}
              className="p-2 rounded-xl text-black cursor-pointer hover:bg-gray-500 hover:text-white text-small"
              onClick={() => handleSelection(model)}
            >
              {model.nome}
            </li>
          ))}
        </ul>
      )}
      {isDropdownVisible && filteredModels.length === 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-md">
          <li className="p-2 rounded-xl text-black">
            Nenhuma opção encontrada
          </li>
        </ul>
      )}
    </div>
  );
};

export default ModelAutocomplete;
