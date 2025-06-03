# ECOMMERCE - Modern Full-Stack Application

A feature-rich e-commerce platform showcasing modern web development practices. Users can register, verify their email, select product categories of interest, and manage their accounts.

## Features

### User Authentication
- Secure user registration with name, email, and password
- Password strength validation (uppercase, number, special character)
- "Show Password" toggle for better UX
- Email verification via unique 8-digit code
- Secure login for registered and verified users
- User session management and logout functionality

### Interest Selection
- Paginated display of product categories (6 per page)
- Multiple category selection capability
- Persistent storage of user interests in database
- Intuitive pagination controls (first, last, next, previous, page numbers)

### Technical Features
- End-to-end typesafe API layer using tRPC
- MongoDB for data storage (users, categories, interests)
- Server-side validation using Zod
- Modern and responsive UI built with Tailwind CSS
- Reusable UI components from Shadcn/ui

## Tech Stack

**Frontend:**
- Next.js (React Framework)
- React with TypeScript
- Tailwind CSS
- Shadcn/ui (UI Components)
- React Hook Form (form handling)
- Zod (schema validation)
- Lucide React (Icons)

**Backend:**
- tRPC (End-to-end typesafe APIs)
- Next.js API Routes
- Node.js

**Database:**
- MongoDB (NoSQL Database)
- Mongoose (ODM)

**Email:**
- Nodemailer
- Mailtrap (development/testing)

**Development Tools:**
- ESLint & Prettier
- TypeScript
- dotenv

## Project Structure

```
ecommerce/
├── public/                 # Static assets
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── interests/     # Interests page
│   │   ├── verify-email/  # Email verification
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Homepage
│   ├── components/        # React components
│   │   ├── ui/           # Shadcn UI components
│   │   └── Header.tsx
│   ├── lib/              # Libraries and helpers
│   │   ├── auth/         # Auth context
│   │   ├── trpc/         # tRPC client setup
│   │   ├── fakerSeed.ts  # Database seeding
│   │   └── utils.ts
│   └── server/           # Backend logic
│       ├── db/           # Database models
│       ├── trpc/         # tRPC routers
│       └── utils/        # Backend utilities
├── .env.local.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm, yarn, or pnpm
- MongoDB instance (local or MongoDB Atlas)
- Mailtrap account (or SMTP service)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ecommerce.git
   cd ecommerce
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_strong_jwt_secret_key
   
   # Mailtrap Credentials
   MAILTRAP_HOST=smtp.mailtrap.io
   MAILTRAP_PORT=2525
   MAILTRAP_USER=your_mailtrap_user
   MAILTRAP_PASS=your_mailtrap_password
   APP_FROM_EMAIL="ECOMMERCE App <noreply@example.com>"
   
   # Optional: App base URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

### Running the Application

**Development:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Production:**
```bash
npm run build
npm run start
```

**Linting:**
```bash
npm run lint
```

## Future Enhancements

- Product listings and detail pages
- Shopping cart functionality
- Order processing and history
- Admin panel for product management
- Product search functionality
- Enhanced user profile management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Author

**Amit Anand**