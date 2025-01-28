import React, { useState, useEffect } from "react";

interface GeneralObjectOptionAutocompleteProps {
  options: any[];
  initialValue: string;
  placeholder?: string;
  onSelectionChange?: (selectedOption: any | null) => void;
  defaultItems?: any[];
  isDisabled?: boolean;
  canType?: boolean;
}

const GeneralObjectOptionAutocomplete: React.FC<
  GeneralObjectOptionAutocompleteProps
> = ({
  options,
  initialValue,
  placeholder = "Selecione uma opção...",
  onSelectionChange,
  defaultItems = [],
  isDisabled = false,
  canType = false,
}) => {
  const [filteredOptions, setFilteredOptions] = useState<any[]>([]);
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    setFilteredOptions(defaultItems.length > 0 ? defaultItems : options);
  }, [options, defaultItems]);

  useEffect(() => {
    const selectedOption = options.find(
      (option) => option.value === initialValue
    );
    if (selectedOption) {
      setInputValue(selectedOption.label);
    } else {
      setInputValue("");
    }
  }, [initialValue, options, defaultItems]);

  const handleSelection = (option: any) => {
    setDropdownVisible(false);
    setInputValue(option.label);
    if (onSelectionChange) {
      onSelectionChange(option);
    }
  };

  const handleClear = () => {
    setDropdownVisible(false);
    setInputValue("");
    if (onSelectionChange) {
      onSelectionChange(null);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    // setFilteredOptions(
    //   options.filter((option) =>
    //     option.label.toLowerCase().includes(value.toLowerCase())
    //   )
    // );
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="relative">
        <input
          type="text"
          className="w-full border bg-transparent border-gray-300 rounded-xl p-2 outline-none text-white focus:border-gray-500 focus:ring-2 focus:ring-gray-500 pr-10"
          placeholder={placeholder}
          onFocus={() => {
            if (!isDisabled) {
              setDropdownVisible(true);
            }
          }}
          value={inputValue}
          disabled={isDisabled}
          readOnly={!canType}
          onChange={(e) => {
            if (canType) {
              handleInputChange(e.target.value);
            }
          }}
        />
        {inputValue && !isDisabled && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-2 flex items-center text-gray-100 hover:text-gray-300 focus:outline-none"
          >
            &#x2715;
          </button>
        )}
      </div>
      {isDropdownVisible && !isDisabled && (
        <ul className="absolute z-30 w-auto bg-gradient-to-b from-white via-slate-200 to-slate-500 border border-gray-300 mt-14 max-h-40 py-3 scrollbar-hide overflow-y-auto rounded-xl shadow-md">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                className="p-2 text-black rounded-xl cursor-pointer hover:bg-gray-500 hover:text-white"
                onClick={() => {
                  handleSelection(option);
                }}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500 rounded-xl">Nenhuma opção encontrada</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default GeneralObjectOptionAutocomplete;
