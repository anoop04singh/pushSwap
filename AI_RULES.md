# AI Development Rules

This document outlines the tech stack and coding conventions for this project to ensure consistency and maintainability.

## Tech Stack

This application is built with a modern, type-safe, and component-driven stack:

*   **Framework**: Next.js 14, utilizing the App Router for routing and server-side rendering.
*   **Language**: TypeScript for static typing, ensuring code quality and developer productivity.
*   **Styling**: Tailwind CSS is used exclusively for styling. All styles are applied via utility classes.
*   **UI Components**: The UI is constructed using `shadcn/ui`, a collection of beautifully designed and accessible components built on Radix UI.
*   **Icons**: `lucide-react` provides a comprehensive and consistent set of icons used throughout the application.
*   **Forms**: Form management and validation are handled by React Hook Form, integrated with our `shadcn/ui` form components.
*   **Data Visualization**: Charts and graphs are rendered using `recharts`, wrapped in a custom `ChartContainer` for theme consistency.
*   **Notifications**: User feedback and alerts are provided through `sonner` toast notifications.

## Library Usage Rules

To maintain consistency, please adhere to the following rules when adding or modifying features:

### 1. UI and Components

*   **ALWAYS** use components from the `components/ui` directory (our `shadcn/ui` library) for all UI elements like buttons, cards, dialogs, inputs, etc.
*   **DO NOT** create custom one-off components when a suitable `shadcn/ui` component exists.
*   **ALWAYS** create new, small, single-purpose components in their own files.

### 2. Styling

*   **ONLY** use Tailwind CSS utility classes for styling.
*   **AVOID** writing custom CSS in `.css` files. All styling should be co-located with the component's JSX.
*   **ADHERE** to the design tokens (colors, spacing, fonts) defined in `app/globals.css`.

### 3. Icons

*   **ONLY** use icons from the `lucide-react` library.
*   **DO NOT** add custom SVG icons or install any other icon libraries.

### 4. Forms

*   **ALL** forms must be implemented using `react-hook-form`.
*   **USE** the provided `shadcn/ui` form components (`<Form>`, `<FormField>`, `<FormItem>`, etc.) from `components/ui/form.tsx` to structure forms and handle validation messages.

### 5. Charts

*   **ALL** charts must be created using the `recharts` library.
*   **ALWAYS** wrap charts in the `<ChartContainer>` component from `components/ui/chart.tsx` to ensure they are themed correctly.

### 6. Notifications

*   **USE** the `sonner` library for all toast notifications to provide feedback to the user (e.g., on success or error).