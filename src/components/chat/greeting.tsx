"use client";

import { SparklesIcon } from "./icons";

export const Greeting = () => {
    return (
        <div
            className="mx-auto mt-4 flex size-full max-w-3xl flex-col justify-center px-4 md:mt-16 md:px-8"
        >
            <div className="flex animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both items-center gap-2 font-semibold text-xl md:text-2xl"
                 style={{ animationDelay: "500ms" }}>
                <SparklesIcon size={24} />
                OpenResource AI
            </div>
            <div className="text-xl animate-in fade-in slide-in-from-bottom-2 duration-1000 fill-mode-both text-zinc-500 md:text-2xl"
                 style={{ animationDelay: "600ms" }}>
                How can I help you today?
            </div>
        </div>
    );
};
