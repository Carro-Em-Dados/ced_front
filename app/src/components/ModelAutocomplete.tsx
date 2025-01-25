import React, { useState, useEffect } from "react";
import { IoArrowDown } from "react-icons/io5";

interface ModelOption {
  codigo: string;
  nome: string;
}

interface ModelAutocompleteProps {
    models: ModelOption[];
    setSelectedModel: (model: string) => void;
    manufacturer: string;
    loadingFetch: boolean;
}

const ModelAutocomplete = ({
  models,
  setSelectedModel,
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

  const handleFilter = (inputValue: string) => {
    const filtered = models.filter((model) =>
      model.nome.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredModels(filtered);
  };

  const handleSelection = (model: ModelOption) => {
    setSelectedModel(model.codigo); // Set selected model's code
    setInputValue(model.nome); // Update input value with selected model's name
    setDropdownVisible(false);
  };

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          setInputValue(value);
          handleFilter(value);
          setDropdownVisible(true);
        }}
        onFocus={() => setDropdownVisible(true)}
        disabled={!manufacturer || loadingFetch}
        className={`w-full bg-transparent border border-gray-300 rounded-md p-2 outline-none text-small ${
          !manufacturer || loadingFetch
            ? "cursor-not-allowed"
            : "focus:border-gray-500 focus:ring-2 focus:ring-gray-500"
        }`}
        placeholder={
          !manufacturer || loadingFetch
            ? "Selecione um marca primeiro..."
            : "Selecionar modelo..."
        }
          />
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
          <li className="p-2 rounded-xl text-black">No options found</li>
        </ul>
      )}
    </div>
  );
};

export default ModelAutocomplete;
