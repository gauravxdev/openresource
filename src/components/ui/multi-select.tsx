"use client";

import * as React from "react";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
    CommandEmpty,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

// Category type based on schema, but simplified for UI
export type CategoryOption = {
    value: string;
    label: string;
};

interface MultiSelectProps {
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    maxItems?: number;
    options?: CategoryOption[]; // Existing categories
}

export function MultiSelect({
    selected,
    onChange,
    placeholder = "Select items...",
    maxItems = 5,
    options = [],
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = React.useCallback(
        (item: string) => {
            onChange(selected.filter((i) => i !== item));
        },
        [onChange, selected]
    );

    const handleSelect = React.useCallback(
        (item: string) => {
            if (selected.includes(item)) {
                handleUnselect(item);
            } else {
                if (selected.length < maxItems) {
                    onChange([...selected, item]);
                }
            }
            setInputValue("");
        },
        [onChange, selected, maxItems, handleUnselect]
    );

    // Filter options to show only unselected ones or all? Usually unselected.
    // But for tag creation logic, we need to know if it matches any.

    // Basic filtering is handled by Command, but we want custom logic for creation.

    return (
        <div className="overflow-visible bg-transparent">
            <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 flex flex-wrap gap-1 bg-neutral-900/50 border-neutral-800">
                {selected.map((item) => {
                    // Find label if possible, else use value
                    const label = options.find(opt => opt.value === item)?.label || item;
                    return (
                        <Badge key={item} variant="secondary" className="hover:bg-secondary/80">
                            {label}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(item);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(item)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    );
                })}
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setOpen(true);
                    }}
                    onBlur={() => setOpen(false)}
                    onFocus={() => setOpen(true)}
                    placeholder={selected.length < maxItems ? placeholder : (selected.length === maxItems ? "Max items reached" : placeholder)}
                    className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1 min-w-[120px]"
                    disabled={selected.length >= maxItems}
                />
            </div>
            {open && (
                <div className="relative mt-2">
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 bg-black border-neutral-800">
                        <Command className="h-full overflow-hidden rounded-md bg-transparent">
                            {/* We use a hidden input just to make Command happy or custom filtering */}
                            {/* Actually, we can just use CommandList and items directly if we manage state, 
                                but shadcn Command usually expects CommandInput. 
                                However, we have a custom input above. 
                                Let's try to use CommandPrimitive to skip the inner input or just use CommandList.
                            */}

                            <CommandList>
                                <CommandEmpty>
                                    {inputValue.length > 0 && selected.length < maxItems ? (
                                        <div
                                            className="py-6 text-center text-sm cursor-pointer hover:bg-neutral-800"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={() => handleSelect(inputValue)}
                                        >
                                            Create tag: <span className="font-bold">"{inputValue}"</span>
                                        </div>
                                    ) : (
                                        <span className="py-6 text-center text-sm block text-gray-500">No results found.</span>
                                    )}
                                </CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto">
                                    {options
                                        .filter(option => !selected.includes(option.value))
                                        .filter(option => option.label.toLowerCase().includes(inputValue.toLowerCase()))
                                        .map((option) => (
                                            <CommandItem
                                                key={option.value}
                                                onSelect={() => {
                                                    handleSelect(option.value);
                                                    setOpen(false)
                                                }}
                                                className="cursor-pointer hover:bg-neutral-800"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                {option.label}
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                </div>
            )}
        </div>
    );
}
