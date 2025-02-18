import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@components/ui/input";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

type Item<T> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (item: Item<T> | null) => void;
  items: Item<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  className?: string;
  allowCustomValue?: boolean;
};

export function ShadAutocomplete<T extends string>({
  selectedValue,
  onSelectedValueChange,
  items,
  isLoading,
  emptyMessage = "No items.",
  placeholder = "Search...",
  className,
  allowCustomValue = false,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (selectedValue) {
      const selectedItem = items.find((item) => item.value === selectedValue);
      setSearchValue(selectedItem?.label || allowCustomValue ? selectedValue : "");
    }
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchValue) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, items]);

  const selectedItem = useMemo(() => {
    return items.find((item) => item.value === selectedValue) || null;
  }, [selectedValue, items]);

  const reset = () => {
    onSelectedValueChange(null);
    setSearchValue("");
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setIsOpen(false);
      const selectedLabel = selectedItem?.label || "";
      if (searchValue !== selectedLabel) {
        if (allowCustomValue && searchValue.trim()) {
          const customItem = { value: searchValue as T, label: searchValue };
          onSelectedValueChange(customItem);
        } else {
          reset();
        }
      }
    }
  };

  const onSelectItem = (inputValue: T) => {
    const newItem = items.find((item) => item.value === inputValue) || null;

    console.log("newItem", newItem);

    if (newItem?.value === selectedValue) {
      reset();
    } else {
      onSelectedValueChange(newItem);
      setSearchValue(newItem?.label ?? "");
    }
    setIsOpen(false);
  };

  const handleOutsideClick = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className={cn("relative flex items-center", className)}>
      <div className="relative flex items-center w-full">
        <Input
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={onInputBlur}
          placeholder={placeholder}
          className="border-1 border-white rounded-xl text-white pr-8"
        />
        {searchValue && (
          <button
            onClick={() => reset()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1 w-full border bg-gradient-to-b from-white via-slate-200 to-slate-500 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20"
        >
          <div className="flex flex-col space-y-1 max-h-60 overflow-y-auto text-black">
            {isLoading ? (
              <div className="p-1">
                <Skeleton className="h-6 w-full" />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    console.log("a")
                    onSelectItem(option.value);
                  }}
                  className="flex items-center p-2 hover:bg-gray-500 w-full text-left"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selectedValue === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                  {option.label}
                </button>
              ))
            ) : (
              <div className="p-2 text-gray-500">{emptyMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
