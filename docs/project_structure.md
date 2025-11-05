# Project Structure

## Overview
Premium DTF Print Solutions - A React-based e-commerce platform for professional DTF (Direct-to-Film) printing and custom transfer solutions.

## Root Directory
```
mami_pub/
├── docs/                      # Project documentation
│   ├── project_structure.md   # Current architecture snapshot
│   └── changelog.md           # Historical change tracking
├── public/                    # Static assets
│   ├── favicon.ico           # Site favicon
│   ├── placeholder.svg       # Placeholder image
│   └── robots.txt            # SEO robots file
├── src/                      # Source code
│   ├── assets/               # Image assets
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   └── pages/                # Page components
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS config
└── tsconfig.json            # TypeScript configuration
```

## Source Directory Structure

### /src/assets
- `hero-dtf-print.jpg` - Hero section image
- `product-dtf-transfers.jpg` - DTF transfers product image
- `product-heat-press.jpg` - Heat press product image
- `product-vinyl.jpg` - Vinyl product image

### /src/components
- `Layout.tsx` - Main layout wrapper
- `ProductCard.tsx` - Product display card
- `Sidebar.tsx` - Navigation sidebar
- `Topbar.tsx` - Top navigation bar
- `/ui/` - shadcn/ui component library (49 components organized into 7 categories)
  - `/forms/` - Form inputs and controls (11 components)
    - calendar, checkbox, form, input, input-otp, label, radio-group, select, slider, switch, textarea
  - `/navigation/` - Navigation components (6 components)
    - breadcrumb, menubar, navigation-menu, pagination, sidebar, tabs
  - `/overlays/` - Modal and overlay components (10 components)
    - alert-dialog, command, context-menu, dialog, drawer, dropdown-menu, hover-card, popover, sheet, tooltip
  - `/feedback/` - User feedback components (7 components)
    - alert, progress, skeleton, sonner, toast, toaster, use-toast
  - `/layout/` - Layout and container components (5 components)
    - aspect-ratio, card, resizable, scroll-area, separator
  - `/data-display/` - Data presentation components (5 components)
    - avatar, badge, carousel, chart, table
  - `/interactive/` - Interactive action components (5 components)
    - accordion, button, collapsible, toggle, toggle-group

### /src/hooks
- `use-mobile.tsx` - Mobile detection hook
- `use-toast.ts` - Toast notification hook

### /src/lib
- `utils.ts` - Utility functions

### /src/pages
- `Index.tsx` - Landing page
- `Home.tsx` - Home page
- `Designer.tsx` - Design tool page
- `Transfers.tsx` - Transfer products page
- `Resources.tsx` - Resources page
- `Orders.tsx` - Orders management page
- `Cart.tsx` - Shopping cart page
- `ProductDetail.tsx` - Product detail page
- `NotFound.tsx` - 404 error page

## Technology Stack
- **Frontend**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM 6.30.1
- **Forms**: React Hook Form 7.61.1
- **State Management**: TanStack Query 5.83.0
- **Icons**: Lucide React 0.462.0

