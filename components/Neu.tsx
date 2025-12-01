import React from 'react';
import { cn } from '../lib/utils';

// Neumorphic Card Component
export const NeuCard = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "bg-neu-base rounded-2xl shadow-neu-flat p-6 transition-all duration-200",
            className
        )}
        {...props}
    />
));
NeuCard.displayName = "NeuCard";

// Neumorphic Button Component
export const NeuButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "bg-neu-base rounded-xl shadow-neu-flat px-6 py-3 font-medium text-neu-text",
            "active:shadow-neu-pressed transition-all duration-200",
            "hover:brightness-105",
            className
        )}
        {...props}
    />
));
NeuButton.displayName = "NeuButton";

// Neumorphic Icon Button Component
export const NeuIconButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "bg-neu-base rounded-full shadow-neu-flat p-3",
            "active:shadow-neu-pressed transition-all duration-200",
            "flex items-center justify-center",
            className
        )}
        {...props}
    />
));
NeuIconButton.displayName = "NeuIconButton";
