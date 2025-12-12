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
│   ├── grid.svg              # Background grid pattern
│   ├── placeholder.svg       # Placeholder image
│   └── robots.txt            # SEO robots file
├── src/                      # Source code
│   ├── ai/                   # AI utilities (Gemini integration)
│   ├── assets/               # Image assets
│   ├── components/           # React components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   ├── pages/                # Page components
│   └── supabase/             # Supabase client and queries
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS config
└── tsconfig.json            # TypeScript configuration
```

## Source Directory Structure

### /public
- `/icons/brand/` - Brand identity icons
  - `custom-printer-icon.svg` - Proprietary gradient printer icon
- `/icons/contact/` - Contact method icons
  - `contact-phone-icon.svg` - Contact phone icon
  - `contact-mail-icon.svg` - Contact email icon
  - `contact-location-icon.svg` - Contact location icon
- `/icons/service/` - Service category icons
  - `service-production-icon.svg` - Production service icon
  - `service-advertising-icon.svg` - Advertising service icon
  - `service-logistics-icon.svg` - Logistics service icon
- `/images/` - Product and hero images
  - `hero-dtf-print.jpg` - Hero section image
  - `product-dtf-transfers.jpg` - DTF transfers product image
  - `product-heat-press.jpg` - Heat press product image
  - `product-vinyl.jpg` - Vinyl product image

### /src/components
Organized into domain-specific folders for maintainability.

- `/layout/` - App shell and navigation components
  - `Layout.tsx` - Main layout wrapper with responsive navigation
  - `Sidebar.tsx` - Desktop navigation sidebar with tooltips
  - `Topbar.tsx` - Top navigation bar with search and admin access
  - `MobileTabBar.tsx` - Bottom tab navigation for mobile

- `/product/` - Product display components
  - `RefinedProductCard.tsx` - Enhanced product card with animations
  - `RefinedProductGrid.tsx` - Product grid with loading states
  - `QuickViewModal.tsx` - Product quick view modal

- `/cart/` - Shopping cart components
  - `CartButton.tsx` - Cart icon with item count
  - `FloatingCart.tsx` - Slide-out cart panel

- `/admin/` - Admin dashboard components
  - `AdminLayout.tsx` - Admin layout wrapper with auth guard
  - `AdminSidebar.tsx` - Collapsible admin navigation
  - `AdminMobileTabBar.tsx` - Admin mobile navigation
  - `AdminTopbar.tsx` - Admin top navigation

- `/icons/` - Custom icon components
  - `CustomIcons.tsx` - Custom SVG icon components

- `/ui/` - shadcn/ui component library (organized into 8 categories)
  - `/animations/` - Lottie animation components
  - `/forms/` - Form inputs and controls (11 components)
    - calendar, checkbox, form, input, input-otp, label, radio-group, select, slider, switch, textarea
  - `/navigation/` - Navigation components (7 components)
    - breadcrumb, menubar, navigation-menu, pagination, sidebar, tabs
  - `/overlays/` - Modal and overlay components (10 components)
    - alert-dialog, command, context-menu, dialog, drawer, dropdown-menu, hover-card, popover, sheet, tooltip
  - `/feedback/` - User feedback components (7 components)
    - alert, progress, skeleton, sonner, toast, toaster, use-toast
  - `/layout/` - Layout and container components (5 components)
    - aspect-ratio, card, resizable, scroll-area, separator
  - `/data-display/` - Data presentation components (5 components)
    - avatar, badge, carousel, chart, table
  - `/interactive/` - Interactive action components (8 components)
    - accordion, button, collapsible, toggle, toggle-group, AnimatedCard, AnimatedCounter, FloatingActionButton

### /src/hooks
- `use-mobile.tsx` - Mobile detection hook
- `use-toast.ts` - Toast notification hook
- `useAISearch.ts` - AI-powered search hook with Gemini integration

### /src/ai
AI utilities for intelligent features powered by Google Gemini.
- `index.ts` - Main exports for AI module
- `gemini.ts` - Gemini API client (gemini-2.5-flash-lite)
- `vite-env.d.ts` - TypeScript declarations for .txt imports
- `/system-instructions/` - AI prompt templates
  - `search-assistant.txt` - Search query interpretation prompt (handles typos, Algerian dialect, Arabic, French)

### /src/lib
- `utils.ts` - Utility functions
- `currency.ts` - Algerian Dinar (DA) currency formatting utilities
- `pdfExport.ts` - PDF report generation using jsPDF for dashboard export
- `telegram.ts` - Telegram Bot API utility for order notifications
- `email.ts` - Email notification utility
- `googleSheets.ts` - Google Sheets export utility for orders (CSV, clipboard, direct link)

### /src/pages
- `Index.tsx` - Landing page
- `Designer.tsx` - Design tool page (Coming Soon overlay)
- `Checkout.tsx` - Checkout page with form and order summary
- `Resources.tsx` - Resources page
- `Orders.tsx` - Orders management page
- `Cart.tsx` - Shopping cart page
- `ProductDetail.tsx` - Product detail page
- `NotFound.tsx` - 404 error page

### /src/pages/store - Store Page (Modular Structure)
- `index.ts` - Main exports
- `Store.tsx` - Main store component with Supabase integration
- `types.ts` - TypeScript interfaces (Product with UUID id, FilterState)
- `/components/` - Store-specific components
  - `index.ts` - Component exports
  - `PromoBannerCarousel.tsx` - Auto-rotating promo banner carousel
  - `FiltersSidebar.tsx` - Product filters (categories, price, availability)
  - `SearchBar.tsx` - Product search input
  - `SortDropdown.tsx` - Sort options dropdown
  - `ResultsHeader.tsx` - Results count and sort controls

### /src/pages/home - Home Page (Modular Structure)
- `index.tsx` - Main Home component with animation loading
- `components.tsx` - Shared UI components (IconBadge, AnimationBubble)
- `data.ts` - Static data, types, and animation sources
- `/sections/` - Page sections
  - `index.ts` - Section exports
  - `HeroSection.tsx` - Hero banner with stats and CTA
  - `PillarsSection.tsx` - Creative pillars and service showcases
  - `TimelineSection.tsx` - Experience milestones timeline
  - `ContactSection.tsx` - Contact info and map embed

### /src/pages/admin - Admin Dashboard Pages
- `Dashboard.tsx` - Real-time analytics with interactive charts (Recharts)
- `ProductsPage.tsx` - Complete product management with CRUD operations
- `OrdersPage.tsx` - Order management with status tracking and bulk actions

### /src/components/admin - Admin Dashboard Components
- `AdminLayout.tsx` - Main admin layout wrapper with authentication guard
- `AdminSidebar.tsx` - Collapsible navigation sidebar with theme support
- `AdminTopbar.tsx` - Top navigation with search, notifications, and user menu

### /src/translations - Multi-language Support
French is the default/main language (hardcoded in components). Only English and Arabic have translation files.

- `/en/` - English translations
  - `home.json` - Home page sections (hero, pillars, timeline, contact, stats)
  - `navbar.json` - Topbar contact labels and admin dialog
  - `sidebar.json` - Sidebar navigation and help section
  - `mobiletabbar.json` - Mobile tab bar labels
  - `store.json` - Store page (filters, search, sort, empty states)
  - `cart.json` - Cart page (empty state, summary, checkout)
  - `productview.json` - Product detail page (breadcrumbs, actions, trust badges)
  - `admin_navbar.json` - Admin topbar search, sections, status
  - `admin_sidebar.json` - Admin sidebar nav, footer, mobile tab bar
  - `overview.json` - Admin dashboard stats, charts, tables, quick actions
  - `toast.json` - All toast messages (cart, favorites, auth, CRUD operations, errors)
  - `checkout.json` - Checkout page (order confirmation, form fields, coupon, validation)
  - `admin_products.json` - Admin products management (filters, table, form, bulk actions)

- `/ar/` - Arabic translations (same structure as English, uses Algeria 🇩🇿 flag)

### /src/contexts - React Context Providers
- `AuthContext.tsx` - Authentication state management with localStorage persistence
- `CartContext.tsx` - Shopping cart state management with localStorage persistence
- `FavoritesContext.tsx` - Favorites/wishlist management with localStorage persistence
- `SiteSettingsContext.tsx` - Dynamic site settings with Supabase sync and caching
- `LanguageContext.tsx` - Multi-language support with French default, English/Arabic translations

### /src/supabase - Supabase Integration
- `core.ts` - Supabase client initialization
- `index.ts` - Main exports for all Supabase APIs
- `banners.ts` - Banner CRUD operations
- `categories.ts` - Category CRUD operations with slug generation
- `products.ts` - Product CRUD operations with PGRST116 error handling
- `storage.ts` - Supabase Storage utilities for image upload/delete
- `settings.ts` - Site settings CRUD and asset upload operations
- `/types/index.ts` - All TypeScript types (Product, Category, AdminProduct, User, Order, etc.)

## Admin Dashboard Features

### 🔐 Easter Egg Authentication
- **Access Method**: Click "MAMI PUB" logo in navbar 5 times
- **Login Dialog**: Popup dialog appears with admin login form
- **Credentials**: Username: `admin`, Password: `admin`
- **Features**: Animated dialog, persistent sessions, automatic redirect to dashboard

### 📊 Dashboard Analytics
- **Real-time KPIs**: Revenue, Orders, Customers, Products
- **Interactive Charts**: Revenue trends, order distribution
- **Growth Metrics**: Month-over-month comparisons
- **System Monitoring**: Online users, server load, response times

### 📦 Product Management
- **CRUD Operations**: Create, Read, Update, Delete products
- **Advanced Search**: Multi-field search across all product data
- **Bulk Operations**: Multi-select with batch actions
- **Image Upload**: Drag-and-drop image upload with cropping
- **Dynamic Categories**: Database-driven category system
- **CSV Export**: Bulk export functionality

### 📁 Category Management
- **CRUD Operations**: Create, Read, Update, Delete categories
- **Slug Generation**: Auto-generated URL-friendly slugs
- **Display Order**: Configurable category ordering
- **Active/Inactive**: Toggle category visibility

### 🛒 Order Management
- **Status Tracking**: Pending → Confirmed → Processing → Shipped → Delivered
- **Payment Management**: Pending → Paid → Failed → Refunded
- **Customer Details**: Complete contact and shipping information
- **Bulk Actions**: Process multiple orders simultaneously
- **Order Progress**: Visual progress tracking with status indicators
- **CSV Export**: Export filtered order data

### 🎨 UI/UX Features
- **Dark/Light Theme**: System-wide theme switching
- **Responsive Design**: Mobile, tablet, and desktop optimization
- **Real-time Updates**: Live data updates and notifications
- **Micro-interactions**: Smooth transitions and hover effects
- **Professional Layout**: Enterprise-grade design standards

## Technology Stack
- **Frontend**: React 18.3.1
- **Build Tool**: Vite 5.4.19
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router DOM 6.30.1
- **Forms**: React Hook Form 7.61.1
- **State Management**: TanStack Query 5.83.0
- **Charts**: Recharts 2.15.4
- **Theme Management**: next-themes 0.3.0
- **Icons**: Lucide React 0.462.0

## Access Instructions

### For Admin Dashboard:
1. Start the development server: `npm run dev`
2. Open browser to: `http://localhost:5173/`
3. Click the "MAMI PUB" logo in the top navbar 5 times
4. A login dialog will appear
5. Enter credentials: username `admin`, password `admin`
6. You'll be automatically redirected to `/admin` dashboard

### For Public Site:
1. Start the development server: `npm run dev`
2. Open browser to: `http://localhost:5173/`
3. Navigate through the public e-commerce site
4. Access admin features via the hidden Easter egg (click logo 5 times)

