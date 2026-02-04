# 🗄️ DB Visualiser

> **A modern, visual MySQL database design tool** that lets you create, manage, and visualize database schemas with an intuitive drag-and-drop interface. No SQL expertise required.

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.7-orange)](https://firebase.google.com/)
[![MySQL](https://img.shields.io/badge/MySQL-3.16-blue)](https://www.mysql.com/)

---

## ✨ Features

### 🎨 **Visual Database Design**
- **Drag-and-Drop Interface**: Create tables and relationships visually without writing SQL
- **Interactive Canvas**: Intuitive Entity-Relationship Diagram (ERD) with React Flow
- **Real-time Collaboration**: Changes sync instantly across all connected users via Firebase
- **Smart Relationships**: Automatically detect and visualize foreign key relationships

### 📊 **Table Management**
- **Visual Table Editor**: Add columns, set data types, and define constraints with point-and-click
- **Rich Data Types**: Support for INT, VARCHAR, TEXT, DATE, DECIMAL, ENUM, and more
- **Constraints**: Set primary keys, foreign keys, NOT NULL, UNIQUE, and default values
- **Column Customization**: Color-coded tables with customizable properties

### 🔧 **Multiple Modes**

#### **Dashboard Mode**
- Visual canvas for designing your database schema
- Drag tables, connect relationships, and organize your structure
- Real-time preview of your database design

#### **Terminal Mode**
- Full SQL terminal with syntax highlighting
- Execute queries, view results, and manage data
- Query history and quick action buttons
- Read/write access based on your plan

#### **Presentation Mode**
- Clean, fullscreen view of your schema
- Perfect for demos and team reviews
- Hide UI distractions and focus on the design
- Light and dark theme support

### 📤 **Export & Documentation**
- **SQL Export**: Generate CREATE TABLE scripts
- **Word Documents**: Export to DOCX format
- **PDF Diagrams**: Create printable schema diagrams
- **One-Click Export**: Keep your team and documentation in sync

### 🎯 **User Experience**
- **Smooth Animations**: Powered by Framer Motion for fluid interactions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode**: Beautiful dark theme for extended work sessions
- **Modern UI**: Clean, minimalist interface built with Tailwind CSS

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MySQL** server (local or remote)
- **Firebase** project (for data persistence)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/database-visualiser.git
cd database-visualiser/db-viz

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

Create a `.env.local` file in the `db-viz` directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure

```
database-visualiser/
├── db-viz/                    # Next.js application
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── dashboard/    # Dashboard mode
│   │   │   ├── terminal-mode/ # Terminal mode
│   │   │   └── presentation/  # Presentation mode
│   │   ├── components/        # React components
│   │   │   ├── database/      # Database-specific components
│   │   │   ├── ui/            # UI components (Aceternity UI)
│   │   │   └── common/        # Shared components
│   │   ├── lib/               # Utilities and helpers
│   │   ├── hooks/             # Custom React hooks
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets
│   └── package.json
└── README.md
```

---

## 🎨 Tech Stack

### **Frontend**
- **[Next.js 16.1](https://nextjs.org/)** - React framework with App Router
- **[React 19.2](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[React Flow](https://reactflow.dev/)** - Interactive node-based graphs
- **[Lenis](https://lenis.studiofreight.com/)** - Smooth scrolling

### **Backend**
- **[Firebase](https://firebase.google.com/)** - Authentication & Firestore
- **[MySQL2](https://github.com/sidorares/node-mysql2)** - MySQL database driver
- **[Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)** - Serverless API endpoints

### **UI Components**
- **[Aceternity UI](https://ui.aceternity.com/)** - Beautiful component library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### **Export & Documentation**
- **[docx](https://github.com/dolanmiu/docx)** - Word document generation
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation
- **[html2canvas](https://github.com/niklasvh/html2canvas)** - Canvas rendering

---

## 💡 Usage

### Creating a Database

1. **Sign Up / Log In** to your account
2. **Create a New Database** from the dashboard
3. **Name Your Database** and connect to your MySQL server
4. **Start Designing** by adding tables and relationships

### Adding Tables

1. Click **"Add Table"** button
2. **Name your table** (e.g., "users", "orders")
3. **Add columns** with data types and constraints
4. **Set primary keys** by clicking the key icon
5. **Drag and position** tables on the canvas

### Creating Relationships

1. **Select a table** with a foreign key column
2. **Drag from the column** to the related table
3. **Visual connectors** automatically appear
4. **Relationships are validated** for referential integrity

### Exporting Your Schema

1. **Click Export** in the top menu
2. **Choose format**: SQL, DOCX, or PDF
3. **Download** your schema file
4. **Share** with your team or use in other tools

---

## 🎯 Key Features Explained

### **Visual ERD Canvas**
The dashboard provides an interactive canvas where you can:
- Drag tables to organize your schema
- See relationships visualized as connecting lines
- Zoom and pan for large schemas
- Use keyboard shortcuts for faster workflow

### **SQL Terminal**
Execute SQL queries directly:
- Syntax highlighting for better readability
- Query history for quick access
- Quick action buttons for common operations
- Real-time query results with formatted output

### **Presentation Mode**
Perfect for demos:
- Fullscreen canvas view
- Hide all UI elements
- Focus on the database design
- Switch between light and dark themes

---

## 🔐 Authentication & Security

- **Firebase Authentication** for secure user management
- **User-specific databases** - each user's data is isolated
- **Secure API routes** with authentication checks
- **Environment variables** for sensitive configuration

---

## 📱 Responsive Design

The application is fully responsive and works on:
- 💻 **Desktop** - Full feature set with optimal layout
- 📱 **Mobile** - Touch-optimized interface
- 📱 **Tablet** - Adaptive layout for medium screens

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables

Make sure to set all environment variables in your hosting platform:
- Firebase configuration
- MySQL connection details
- Next.js public URL

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **[Aceternity UI](https://ui.aceternity.com/)** for beautiful component templates
- **[React Flow](https://reactflow.dev/)** for the ERD visualization
- **[Next.js](https://nextjs.org/)** team for the amazing framework
- **[Firebase](https://firebase.google.com/)** for backend infrastructure

---

## 📞 Support

- 📧 **Email**: support@dbvisualiser.com
- 💬 **Discord**: [Join our community](https://discord.gg/dbvisualiser)
- 📖 **Documentation**: [docs.dbvisualiser.com](https://docs.dbvisualiser.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/database-visualiser/issues)

---

## 🎉 Made with ❤️

Built with modern web technologies and a passion for making database design accessible to everyone.

**Star ⭐ this repo if you find it helpful!**

---

<div align="center">

**[⬆ Back to Top](#-db-visualiser)**

</div>
