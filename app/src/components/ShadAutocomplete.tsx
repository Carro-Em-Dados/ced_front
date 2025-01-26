import { useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@components/ui/input";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";

type Item<T> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  selectedValue: T;
  onSelectedValueChange: (item: Item<T> | null) => void;
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  items: Item<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  placeholder?: string;
  className?: string;
};

export function ShadAutocomplete<T extends string>({
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  isLoading,
  emptyMessage = "No items.",
  placeholder = "Search...",
  className,
}: Props<T>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const filteredItems = useMemo(() => {
    if (!searchValue) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, items]);

  const labels = useMemo(
    () =>
      items.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {} as Record<string, string>),
    [items]
  );

  const selectedItem = useMemo(() => {
    return items.find((item) => item.value === selectedValue) || null;
  }, [selectedValue, items]);

  useEffect(() => {
    if (isFocused && !isOpen) {
      setIsOpen(true);
    }
  }, [isOpen, isFocused]);

  const reset = () => {
    onSelectedValueChange(null);
    onSearchValueChange("");
  };

  const onInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isFocused) return;
  
    const selectedLabel = selectedItem?.label || "";
    if (searchValue !== selectedLabel) {
      reset();
    }
  };

  const onSelectItem = (inputValue: T) => {
    const newItem = items.find((item) => item.value === inputValue) || null;

    if (newItem?.value === selectedValue) {
      reset();
    } else {
      onSelectedValueChange(newItem);
      onSearchValueChange(newItem?.label ?? "");
    }
    console.log("setOpen(false) triggered by onSelectItem");
    setIsOpen(false);
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Popover open={isOpen} onOpenChange={(state) => {
        setIsOpen(state);
      }}>
        <PopoverAnchor asChild>
          <div className="relative flex items-center w-full">
            <Input
              value={searchValue}
              onChange={(e) => onSearchValueChange(e.target.value)}
              onFocus={() => {
                console.log("focus");
                setIsFocused(true);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                onInputBlur(e);
              }}
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
        </PopoverAnchor>

        <PopoverContent
          asChild
          onOpenAutoFocus={(e: Event) => e.preventDefault()}
          onInteractOutside={(e: Event) => {
            if (
              e.target instanceof Element &&
              e.target.hasAttribute("cmdk-input")
            ) {
              e.preventDefault();
            }
          }}
          className="w-[--radix-popover-trigger-width] p-0 mt-1 border bg-gradient-to-b from-white via-slate-200 to-slate-500 rounded-xl scrollbar-hide shadow-lg max-h-60 overflow-y-auto"
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
                  onClick={() => onSelectItem(option.value)}
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
        </PopoverContent>
      </Popover>
    </div>
  );
}
