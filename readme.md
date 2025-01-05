# MyBlog

![MyBlog Banner](path-to-your-banner-image)
// No Banner Image right now, will be updated soon!

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction

**MyBlog** is a full-stack web application designed for creating, managing, and sharing blog posts. Built with Angular for the frontend and Node.js for the backend, MyBlog offers a seamless experience for both bloggers and readers. Whether you want to share your thoughts or read insightful articles, MyBlog provides the tools you need.

## Features

- **User Authentication:** Secure sign-up and login functionalities.
- **Create & Manage Posts:** Write, edit, and delete blog posts with rich text formatting.
- **Commenting System:** Engage with readers through comments.
- **Responsive Design:** Optimized for desktops, tablets, and mobile devices.
- **SEO Friendly:** Structured for better search engine visibility.
- **Dynamic Routing:** Smooth navigation between different sections.

## Technologies

- **Frontend:**
  - Angular
  - TypeScript
  - HTML5 & CSS3
  - Angular Material (optional)

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB (or your chosen database)
  - TypeScript

- **Tools & Utilities:**
  - Git & GitHub
  - VS Code
  - npm/Yarn
  - Webpack

## Project Structure

```
.gitattributes
backend/
  index.js
  package.json
myblog/
  .angular/
    cache/
      17.3.5/
  .editorconfig
  .gitignore
  .vscode/
    extensions.json
    launch.json
    tasks.json
  angular.json
  package.json
  README.md
  server/
    package.json
    server.js
  server.ts
  src/
    app/
      about/
        about.component.css
        about.component.html
        about.component.spec.ts
        about.component.ts
      article/
        article.component.css
        article.component.html
        article.component.spec.ts
        article.component.ts
      blog-post/
        blog-post.component.css
        blog-post.component.html
        blog-post.component.spec.ts
        blog-post.component.ts
      blogdata/
        blogdata.component.css
        blogdata.component.html
        blogdata.component.spec.ts
        blogdata.component.ts
      featured-post/
        featured-post.component.css
        featured-post.component.html
        featured-post.component.spec.ts
        featured-post.component.ts
      footer/
        footer.component.css
        footer.component.html
        footer.component.spec.ts
        footer.component.ts
      header/
        header.component.css
        header.component.html
        header.component.spec.ts
        header.component.ts
      home/
        home.component.css
        home.component.html
        home.component.spec.ts
        home.component.ts
      login-form/
        login-form.component.css
        login-form.component.html
        login-form.component.spec.ts
        login-form.component.ts
      recommended-topics/
        recommended-topics.component.css
        recommended-topics.component.html
        recommended-topics.component.spec.ts
        recommended-topics.component.ts
      register/
        register.component.css
        register.component.html
        register.component.spec.ts
        register.component.ts
      services/
        blog.service.spec.ts
        blog.service.ts
        fetchblog.service.spec.ts
        fetchblog.service.ts
        login.service.spec.ts
        login.service.ts
        register.service.spec.ts
        register.service.ts
      writeblog/
        writeblog.component.css
        writeblog.component.html
        writeblog.component.spec.ts
        writeblog.component.ts
      app.component.css
      app.component.html
      app.component.spec.ts
      app.component.ts
      app.config.server.ts
      app.config.ts
      app.routes.ts
    assets/
      .gitkeep
    index.html
    main.server.ts
    main.ts
    styles.css
  tsconfig.app.json
  tsconfig.json
  tsconfig.spec.json
readme.md
```

## Installation

### Prerequisites

- **Node.js** (v14.x or higher)
- **npm** (v6.x or higher) or **Yarn**
- **Git**

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/myblog.git
   cd myblog
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../myblog
   npm install
   ```

4. **Configure Environment Variables**

   Create a `.env` file in the `backend` directory and add the necessary configurations:

   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

## Usage

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm start
   ```

   The backend server will run on `http://localhost:3000`.

2. **Start the Frontend Development Server**

   Open a new terminal window/tab, navigate to the `myblog` directory, and run:

   ```bash
   cd myblog
   ng serve
   ```

   The frontend application will be available at `http://localhost:4200`.

### Building for Production

1. **Build the Frontend**

   ```bash
   ng build --prod
   ```

   The production-ready files will be in the `dist/` directory.

2. **Start the Backend in Production Mode**

   Ensure environment variables are set appropriately and run:

   ```bash
   cd backend
   npm run build
   npm start
   ```

## API Endpoints

### Authentication

- **POST** `/api/register` - Register a new user
- **POST** `/api/login` - Authenticate a user and obtain a token

### Blog Posts

- **GET** `/api/posts` - Retrieve all blog posts
- **GET** `/api/posts/:id` - Retrieve a single blog post by ID
- **POST** `/api/posts` - Create a new blog post
- **PUT** `/api/posts/:id` - Update an existing blog post
- **DELETE** `/api/posts/:id` - Delete a blog post

### Comments

- **GET** `/api/posts/:postId/comments` - Get comments for a post
- **POST** `/api/posts/:postId/comments` - Add a comment to a post

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**

2. **Create a Feature Branch**

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**

   ```bash
   git commit -m "Add your message"
   ```

4. **Push to the Branch**

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

//

---

*Developed with ❤️ by [Vedant Lahane](https://github.com/vedantlahane)*