# BlogMe - Modern Blog Platform

BlogMe is a modern, open-source, self-hosted blog platform built with React, Parse (self-hosted or Back4App), Tailwind CSS, TanStack Query, Framer Motion, and React Icons.

![BlogMe Screenshot](https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)

## Features

- **Modern UI**: Beautiful, responsive design with smooth animations
- **User Authentication**: Secure sign-up, login, and password reset functionality
- **Blog Management**: Create, edit, and delete blog posts
- **Masonry Layout**: Beautiful blog display in a masonry grid
- **Rich Text Editor**: Format your blog posts with a powerful editor
- **Categories & Tags**: Organize your content effectively
- **Search & Filter**: Find content quickly with advanced search
- **Responsive Design**: Looks great on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Self-hosted**: Host it yourself or use Back4App

## Tech Stack

- **Frontend**:
  - React
  - Tailwind CSS for styling
  - TanStack Query (React Query) for data fetching
  - Framer Motion for animations
  - React Icons for beautiful icons
  - React Router for navigation

- **Backend**:
  - Parse Server (self-hosted or Back4App)
  - Parse JavaScript SDK

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Parse Server instance (self-hosted or Back4App account)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/blogme.git
   cd blogme
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Parse:
   - Open `src/services/parseConfig.js`
   - Replace the placeholder values with your Parse Server details:
     ```javascript
     const PARSE_APPLICATION_ID = 'your-parse-application-id';
     const PARSE_HOST_URL = 'https://parseapi.back4app.com/';
     const PARSE_JAVASCRIPT_KEY = 'your-parse-javascript-key';
     ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Parse Server Setup

### Option 1: Using Back4App

1. Create an account at [Back4App](https://www.back4app.com/)
2. Create a new app
3. Navigate to App Settings > Security & Keys
4. Copy the Application ID and JavaScript Key
5. Update the values in `src/services/parseConfig.js`

### Option 2: Self-Hosting Parse Server

1. Follow the [Parse Server guide](https://github.com/parse-community/parse-server#getting-started) to set up your own instance
2. Update the configuration in `src/services/parseConfig.js` with your server details

## Project Structure

```
blogme/
├── public/               # Static files
├── src/
│   ├── assets/           # Images, fonts, etc.
│   │   ├── components/       # Reusable components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── blog/         # Blog-related components
│   │   │   ├── layout/       # Layout components
│   │   │   └── ui/           # UI components
│   │   ├── context/          # React context
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── .gitignore
│   ├── package.json
│   └── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Parse Platform](https://parseplatform.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Query](https://tanstack.com/query)
- [Framer Motion](https://www.framer.com/motion/)
- [React Icons](https://react-icons.github.io/react-icons/)
