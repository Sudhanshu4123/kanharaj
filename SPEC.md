# Real Estate Platform - Specification Document

## 1. Project Overview

**Project Name:** LuxeEstates - Premium Real Estate Platform  
**Type:** Full-stack Web Application  
**Core Functionality:** A modern real estate platform for browsing, searching, and managing property listings with user inquiry system and admin management panel.  
**Target Users:** Property seekers (buyers/renters), property owners, real estate agents, and administrators.

---

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + ShadCN UI
- **State Management:** Zustand
- **Animations:** Framer Motion
- **Image Handling:** next/image
- **Icons:** Lucide React

### Backend
- **Framework:** Spring Boot 3.2
- **Security:** Spring Security + JWT
- **Database:** MySQL / PostgreSQL
- **Caching:** Redis
- **Build Tool:** Maven

---

## 3. UI/UX Specification

### Color Palette
- **Primary:** `#0F172A` (Slate 900 - Deep navy)
- **Secondary:** `#F8FAFC` (Slate 50 - Off-white)
- **Accent:** `#E11D48` (Rose 600 - Premium red)
- **Success:** `#10B981` (Emerald 500)
- **Warning:** `#F59E0B` (Amber 500)
- **Text Primary:** `#0F172A`
- **Text Secondary:** `#64748B` (Slate 500)
- **Background:** `#FFFFFF`
- **Card Background:** `#F8FAFC`
- **Border:** `#E2E8F0` (Slate 200)

### Typography
- **Headings:** `Playfair Display` (Serif - Premium feel)
- **Body:** `DM Sans` (Sans-serif - Modern, clean)
- **Font Sizes:**
  - H1: 48px/56px
  - H2: 36px/44px
  - H3: 24px/32px
  - Body: 16px/24px
  - Small: 14px/20px

### Spacing System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Effects
- **Shadows:** 
  - Card: `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)`
  - Elevated: `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`
- **Border Radius:** 
  - Small: 8px
  - Medium: 12px
  - Large: 16px
  - Full: 9999px
- **Transitions:** `all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 4. Page Specifications

### 4.1 Home Page

#### Hero Section
- Full-width background with property image overlay
- Gradient overlay: `linear-gradient(to right, rgba(15,23,42,0.9), rgba(15,23,42,0.5))`
- Main headline: "Find Your Dream Home" (Playfair Display, 56px, white)
- Subheadline: "Discover premium properties in prime locations"
- Search bar with tabs: Buy | Rent | Commercial
- Search fields: Location, Property Type, Price Range, BHK
- CTA button: "Search Properties" (Rose 600 background)

#### Featured Properties Section
- Section title: "Featured Properties"
- 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Property cards with:
  - Image (16:9 aspect ratio)
  - Property type badge (top-left)
  - Heart icon for favorites (top-right)
  - Price (Rose 600, bold)
  - Title, location
  - Beds, baths, sqft icons with values
  - "View Details" link

#### How It Works Section
- 3 steps with icons:
  1. "Search Properties" - Search icon
  2. "Schedule Visit" - Calendar icon
  3. "Move In" - Home icon
- Step numbers with Rose 600 background

#### Testimonials Section
- Carousel with customer reviews
- Avatar, name, location, rating (5 stars)
- Quote text in italics

#### CTA Section
- Dark background (Slate 900)
- "Ready to find your dream home?"
- "Contact Us Now" button (Rose 600)

#### Footer
- 4 columns: Company, Quick Links, Properties, Contact
- Newsletter subscription
- Social media icons
- Copyright text

---

### 4.2 Property Listing Page

#### Filters Sidebar (Left)
- Property Type: House, Apartment, Villa, Flat, Plot
- Price Range: Slider with min/max inputs
- Bedrooms: 1, 2, 3, 4, 5+
- Bathrooms: 1, 2, 3, 4+
- Area (sqft): Slider
- Posted By: Owner, Agent, Builder
- Amenities: Parking, Lift, Garden, Pool, Gym

#### Results Area (Right)
- View toggle: Grid | List
- Sort by: Price Low-High, Price High-Low, Newest
- Results count: "Showing X properties"
- Property cards (same as featured)
- Pagination or Infinite scroll

---

### 4.3 Property Detail Page

#### Image Gallery
- Main image (large, 16:9)
- Thumbnail strip below (5 images)
- Click thumbnail to enlarge
- Fullscreen gallery option

#### Property Info (Left)
- Property type badge
- Title (H1)
- Address with location icon
- Price (Rose 600, large)
- Quick features: Beds, Baths, Area, Year Built

#### Action Panel (Right - Sticky)
- "Book a Visit" button (Rose 600)
- "Contact Agent" button (outline)
- WhatsApp button (green)
- Call Now button

#### Details Tabs
- Overview, Amenities, Location, Floor Plan
- Description text
- Amenities grid (icons + labels)
- Map integration placeholder

#### Contact Form
- Name, Email, Phone, Message
- "Send Inquiry" button

---

### 4.4 About Us Page

- Hero with company image
- "About LuxeEstates" title
- Company story (text)
- Mission, Vision, Values sections
- Team photos (optional)

---

### 4.5 Contact Page

- Contact form (Name, Email, Subject, Message)
- Company contact info:
  - Address
  - Phone
  - Email
- Google Maps embed placeholder

---

### 4.6 Login/Signup Page

- Centered card design
- Toggle: Login | Sign Up
- Login: Email, Password, "Forgot Password?"
- Signup: Name, Email, Phone, Password, Confirm Password
- Social login buttons (Google, Facebook)
- "By signing up you agree to Terms & Privacy"

---

### 4.7 Admin Dashboard

#### Sidebar
- Logo
- Navigation: Dashboard, Properties, Users, Inquiries, Analytics, Settings
- Collapse toggle

#### Dashboard Home
- Stats cards: Total Properties, Total Users, Total Inquiries, Revenue
- Recent properties list
- Recent inquiries list
- Quick actions

#### Properties Management
- Table with all properties
- Add, Edit, Delete actions
- Search and filter
- Pagination

#### Users Management
- User list table
- Role assignment (Admin/User)
- Status toggle

#### Inquiries Management
- Inquiry list
- Mark as resolved
- Export options

---

## 5. API Specification

### 5.1 Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
```

### 5.2 Property Endpoints
```
GET    /api/properties
GET    /api/properties/{id}
POST   /api/properties
PUT    /api/properties/{id}
DELETE /api/properties/{id}
GET    /api/properties/featured
GET    /api/properties/search
```

### 5.3 User Endpoints
```
GET    /api/users
GET    /api/users/{id}
PUT    /api/users/{id}
DELETE /api/users/{id}
```

### 5.4 Inquiry Endpoints
```
GET    /api/inquiries
POST   /api/inquiries
GET    /api/inquiries/{id}
PUT    /api/inquiries/{id}/status
DELETE /api/inquiries/{id}
```

### 5.5 Admin Endpoints
```
GET /api/admin/dashboard
GET /api/admin/analytics
GET /api/admin/reports
```

---

## 6. Database Schema

### Users Table
- id (BIGINT, PK)
- name (VARCHAR 100)
- email (VARCHAR 100, UNIQUE)
- phone (VARCHAR 20)
- password (VARCHAR 255)
- role (ENUM: USER, ADMIN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Properties Table
- id (BIGINT, PK)
- title (VARCHAR 200)
- description (TEXT)
- price (DECIMAL)
- property_type (ENUM: HOUSE, APARTMENT, VILLA, FLAT, PLOT)
- listing_type (ENUM: BUY, RENT)
- address (VARCHAR 300)
- city (VARCHAR 100)
- state (VARCHAR 100)
- pincode (VARCHAR 10)
- bedrooms (INT)
- bathrooms (INT)
- area (INT)
- year_built (INT)
- amenities (JSON)
- images (JSON)
- latitude (DECIMAL)
- longitude (DECIMAL)
- status (ENUM: ACTIVE, INACTIVE, SOLD)
- featured (BOOLEAN)
- user_id (BIGINT, FK)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Inquiries Table
- id (BIGINT, PK)
- property_id (BIGINT, FK)
- user_id (BIGINT, FK)
- name (VARCHAR 100)
- email (VARCHAR 100)
- phone (VARCHAR 20)
- message (TEXT)
- status (ENUM: PENDING, CONTACTED, RESOLVED)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

---

## 7. Security Requirements

- JWT token expiration: 24 hours
- Refresh token expiration: 7 days
- Password encryption: BCrypt
- CORS configured for frontend origin
- Rate limiting: 100 requests/minute
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

---

## 8. Acceptance Criteria

1. Home page loads in under 3 seconds
2. All pages are fully responsive (mobile, tablet, desktop)
3. Search and filter functionality works correctly
4. Property CRUD operations work for admin
5. User registration and login works
6. Inquiry submission works
7. No console errors in production
8. All animations are smooth (60fps)
9. SEO meta tags are present
10. Forms have proper validation

---

## 9. File Structure

```
shrishyam/
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Home
│   │   │   ├── properties/
│   │   │   ├── property/[id]/
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── login/
│   │   │   └── admin/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   ├── public/
│   └── package.json
│
├── backend/                    # Spring Boot backend
│   └── src/main/java/
│       └── com/luxeestates/
│           ├── controller/
│           ├── service/
│           ├── repository/
│           ├── model/
│           ├── security/
│           └── config/
│
└── SPEC.md
```