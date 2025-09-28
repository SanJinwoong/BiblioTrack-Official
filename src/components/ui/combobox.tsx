
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxOption {
  label: string;
  value: string;
  searchable?: string;
}

interface ComboboxProps {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    emptyText?: string;
    allowCustomValue?: boolean;
}

export function Combobox({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  emptyText, 
  allowCustomValue = true 
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  React.useEffect(() => {
    const selectedOption = options.find((option) => option.value === value);
    if (selectedOption) {
      setInputValue("");
    }
  }, [value, options]);

  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    
    return options.filter((option) => {
      const searchText = (option.searchable || option.label).toLowerCase();
      const queryText = inputValue.toLowerCase();
      return searchText.includes(queryText) || option.value.toLowerCase().includes(queryText);
    });
  }, [options, inputValue]);

  const displayValue = React.useMemo(() => {
    const selectedOption = options.find((option) => option.value === value);
    return selectedOption ? selectedOption.label : (allowCustomValue ? value : "");
  }, [value, options, allowCustomValue]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue === value ? "" : selectedValue);
    setInputValue("");
    setOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && allowCustomValue && inputValue.trim()) {
      e.preventDefault();
      onChange(inputValue.trim());
      setInputValue("");
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
        >
          <span className={cn(
            "truncate",
            !displayValue && "text-muted-foreground"
          )}>
            {displayValue || placeholder || "Seleccionar opción..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder || "Buscar..."}
            value={inputValue}
            onValueChange={setInputValue}
            onKeyDown={handleInputKeyDown}
          />
          <CommandList>
            <CommandEmpty>
              {emptyText || "No se encontró ninguna opción."}
              {allowCustomValue && inputValue.trim() && (
                <div className="p-2 text-sm text-muted-foreground">
                  Presiona Enter para usar "{inputValue.trim()}"
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
