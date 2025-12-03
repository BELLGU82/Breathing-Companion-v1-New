# Styling Rules (Enforced by Codex)

## Typography
- `text-3xl`, `text-2xl`, `text-xl` → `text-h1`
- `text-lg`, `text-base` → `text-h2`
- `text-sm`, `text-xs`, any `text-gray-*` → `text-body`
- Secondary small text → `text-meta`
- Remove all manual weights: `font-bold`, `font-medium`, `font-semibold`
- Remove `italic` unless using a dedicated class

## Icons
- Primary icons: `className="icon-primary"`
- Action/secondary icons: `className="icon-secondary"`
- Remove all `size={...}` props

## Colors
- No `text-gray-*`, `text-blue-*`, `text-red-*`, `text-green-*`, or inline colors
- Text may use only: `text-h1`, `text-h2`, `text-body`, `text-meta`
- No accent colors until a new token is defined

## Hover / Focus
- Remove `hover:text-blue-*`, `hover:bg-blue-*`, `focus:ring-blue-*`
- Use only `hover-soft` for hover effects

## Inputs & Toggles
- Remove default blue states
- Toggle/values use `text-body` / `text-meta`
- Apply `hover-soft` on all buttons/toggles

## Scope
- All files under `src/views/**`
- All components under `src/components/**`
- Screens: Settings, Profile, Home, Session, Category
- Any file with `className` usage
- No logic changes — styling only

## Acceptance Criteria
- No colors outside tokens
- No manual font weights
- No blue hovers
- No oversized icons
- All text uses the new class family
- Profile screen components comply with these rules
