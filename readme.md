# MyBlog

A modern full-stack blog platform for creating, managing, and sharing articles.

## Features

- **User Authentication & Profiles** - Secure login, registration, and user profiles
- **Rich Content Creation** - Write and edit posts with rich text formatting
- **Interactive Features** - Comments, likes, bookmarks, and collections
- **Content Organization** - Categories, tags, and collections for better organization
- **Media Management** - Upload and manage images and other media
- **Search & Discovery** - Full-text search across posts, users, and tags
- **Responsive Design** - Optimized for all devices
- **Draft System** - Save and manage drafts before publishing

## Tech Stack

**Frontend:** Angular, TypeScript, Tailwind CSS  
**Backend:** Node.js, Express.js, TypeScript  
**Database:** MongoDB  
**Authentication:** JWT

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vedantlahane/myblog.git
   cd myblog
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create `.env` file in the backend directory:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```

The application will be available at `http://localhost:4200`

### Seeding Sample Content

Use the automated seeding script to populate demo authors, tags, categories, and posts:

```bash
cd backend
npm run seed
```

The script connects to the MongoDB instance referenced by `MONGODB_URI`, upserts the sample documents, and safely increments tag post counts. It can be run multiple times without creating duplicates.

---

*Built with ❤️ by [Vedant Lahane](https://github.com/vedantlahane)*