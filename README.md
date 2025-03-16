# Aviation Shortcuts Practice

A modern web application for learning and practicing aviation-related shortcuts and their meanings. Built with React, TypeScript, and Supabase, featuring a clean and intuitive interface for effective learning.

![Aviation Shortcuts Practice](https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200)

## Features

- 📚 Organized chapters for structured learning
- ✍️ Interactive practice mode for each chapter
- 🏆 Score tracking and personal best records
- 🔍 Comprehensive aviation terminology database
- 👥 Admin interface for content management
- 📱 Responsive design for all devices
- ⚡ Real-time updates with Supabase

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aviation-shortcuts.git
cd aviation-shortcuts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Start the development server:
```bash
npm run dev
```

## Usage

### Practice Mode

1. Browse through available chapters
2. Click "Practice" on any chapter to start a practice session
3. Type the meaning of each shortcut
4. Get immediate feedback on your answers
5. View your score and progress at the end

### Admin Features

1. Sign in as an administrator
2. Add, edit, or delete shortcuts
3. Manage chapters and their contents
4. Monitor user progress

## Technology Stack

- **Frontend:**
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide React Icons

- **Backend:**
  - Supabase (PostgreSQL)
  - Row Level Security
  - Real-time subscriptions

- **Build Tools:**
  - Vite
  - PostCSS
  - ESLint

## Project Structure

```
aviation-shortcuts/
├── src/
│   ├── components/     # React components
│   ├── context/       # React context providers
│   ├── lib/           # Utility functions and configurations
│   └── hooks/         # Custom React hooks
├── supabase/
│   └── migrations/    # Database migrations
├── public/           # Static assets
└── package.json      # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Aviation terminology database contributors
- Supabase team for the excellent backend platform
- React and Vite communities for the amazing tools

## Contact

Your Name - [@yourusername](https://twitter.com/yourusername)

Project Link: [https://github.com/yourusername/aviation-shortcuts](https://github.com/yourusername/aviation-shortcuts)