# PR Review Agent Frontend

A React.js + Vite.js frontend application for the PR Review Agent that analyzes pull requests and provides code quality feedback.

## Features

- 🎯 **Easy PR Analysis**: Simple form to input repository and PR number
- 📊 **Visual Score Display**: Beautiful circular progress indicator and score breakdown
- 🔍 **Detailed Feedback**: Organized feedback by file with issue categorization
- 🎨 **Modern UI**: Clean, responsive design with dark mode support
- ⚡ **Fast Performance**: Built with Vite for lightning-fast development and builds
- 🔄 **Real-time Status**: Server health monitoring and loading states

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization library

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── InputForm.jsx      # Repository and PR input form
│   │   ├── FeedbackList.jsx   # Displays analysis results
│   │   ├── ScoreMeter.jsx     # Visual score indicator
│   │   └── Loader.jsx         # Loading state component
│   ├── api/
│   │   └── backend.js         # API integration layer
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles and Tailwind imports
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Running PR Review Agent backend

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pr-review-agent/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and set your backend URL:
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter Repository Details**
   - Repository: `username/repository` (e.g., `microsoft/vscode`)
   - PR Number: The pull request number
   - Server: Select GitHub (GitLab coming soon)

2. **Analyze PR**
   - Click "Analyze PR" button
   - Wait for the analysis to complete

3. **Review Results**
   - View the overall score and quality rating
   - Browse issues by file and type
   - Filter issues by category (Style, Complexity, Bugs, AI Suggestions)

## API Integration

The frontend communicates with the FastAPI backend through the `/analyze` endpoint:

```javascript
// Example API call
const result = await analyzePR({
  repo: "microsoft/vscode",
  pr_number: 12345,
  server: "github"
});
```

### Backend Requirements

- FastAPI backend running on configured URL
- CORS enabled for frontend domain
- `/analyze` endpoint accepting POST requests
- `/health` endpoint for health checks

## Components

### InputForm
- Repository and PR number input
- Form validation
- Server selection
- Submit handling

### ScoreMeter
- Circular progress indicator
- Score breakdown (0-100)
- Quality rating (A-D)
- Color-coded status

### FeedbackList
- File-organized issue display
- Issue type filtering
- Expandable file sections
- Issue categorization

### Loader
- Animated loading spinner
- Progress indicators
- Loading messages

## Styling

The application uses Tailwind CSS for styling with:
- Responsive design
- Dark mode support
- Custom color scheme
- Smooth animations
- Modern UI components

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Reusable UI components
- **API Layer**: Centralized API communication
- **Styling**: Tailwind CSS with custom configurations
- **State Management**: React hooks for local state

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables

### Other Platforms

The built application is a static site that can be deployed to any static hosting service.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the backend logs for API errors
- Verify the backend is running and accessible
- Check browser console for frontend errors
- Ensure CORS is properly configured
