# AI Prompt Generator

A powerful web-based application for generating professional-level prompts for AI systems, powered by Anthropic's Claude API.

## Features

- **Multiple Templates**: Pre-built templates for various use cases:
  - Coding Task Prompts
  - Content Writing Prompts
  - Data Analysis Prompts
  - Creative Writing Prompts
  - Business Communication Prompts

- **Prompt History**: Automatically saves all generated prompts to localStorage for easy access

- **Iterative Refinement**: Refine and improve your prompts based on feedback

- **Multiple Export Formats**: Export your prompts as:
  - Plain text (.txt)
  - Markdown (.md) with metadata and refinement history
  - JSON (.json) with complete data

- **Modern UI**: Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand with persist middleware
- **AI Provider**: Anthropic Claude API (Claude 3.5 Sonnet)
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- An Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com/))

## Installation

1. **Clone or navigate to the project directory**:
   ```bash
   cd prompt-generator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your API key**:
   - Open `.env.local`
   - Replace `your_api_key_here` with your actual Anthropic API key:
     ```
     ANTHROPIC_API_KEY=sk-ant-api03-...
     ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Choose a Template

When you first open the app, you'll see a selection of prompt templates organized by category:
- **Coding**: For software development tasks
- **Writing**: For content creation
- **Analysis**: For data and information analysis
- **Creative**: For creative storytelling
- **Business**: For professional communications

Click on any template to get started.

### 2. Fill in the Form

Each template has a customized form with fields relevant to that use case. For example:
- **Coding Template**: Task description, programming language, specific requirements
- **Content Writing**: Topic, tone, length, target audience

Fill in the required fields (marked with *) and any optional fields you want to include.

### 3. Generate Your Prompt

Click the "Generate Prompt" button. The AI will create a professional, tailored prompt based on your inputs.

### 4. Refine Your Prompt (Optional)

If you want to improve the generated prompt:
1. Click the "Refine" button
2. Provide feedback on what you'd like to change (e.g., "Make it more specific about error handling")
3. Click "Apply Refinement"

The AI will generate an improved version while maintaining the core purpose.

### 5. Use Your Prompt

- **Copy**: Click the "Copy" button to copy the prompt to your clipboard
- **Export**: Click "Export" to download the prompt in your preferred format
- **History**: All prompts are automatically saved in the left sidebar for easy access

## Project Structure

```
prompt-generator/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/generate/       # API route for Claude
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Main app page
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── TemplateSelector.tsx
│   │   ├── PromptGenerator.tsx
│   │   ├── PromptEditor.tsx
│   │   ├── PromptHistory.tsx
│   │   └── ExportDialog.tsx
│   ├── lib/                    # Utility libraries
│   │   ├── anthropic.ts        # Claude API wrapper
│   │   ├── templates.ts        # Template utilities
│   │   └── utils.ts            # General utilities
│   ├── store/                  # Zustand stores
│   │   ├── promptStore.ts      # History management
│   │   └── appStore.ts         # UI state
│   ├── types/                  # TypeScript types
│   │   ├── template.ts
│   │   ├── prompt.ts
│   │   └── api.ts
│   └── data/                   # Static data
│       └── templates.json      # Template definitions
├── .env.local                  # Environment variables
├── package.json                # Dependencies
└── README.md                   # This file
```

## Adding New Templates

To add your own templates:

1. Open `src/data/templates.json`
2. Add a new template object following this structure:

```json
{
  "id": "unique-template-id",
  "name": "Template Name",
  "category": "coding|writing|analysis|creative|business",
  "description": "Brief description of what this template does",
  "systemPrompt": "Instructions for Claude on how to generate prompts",
  "userPromptTemplate": "Template with {{placeholders}} for user inputs",
  "parameters": [
    {
      "id": "parameter-id",
      "label": "Parameter Label",
      "type": "text|textarea|select",
      "placeholder": "Placeholder text",
      "options": ["Option 1", "Option 2"],
      "required": true
    }
  ]
}
```

## API Rate Limiting

The application includes basic rate limiting:
- **Limit**: 10 requests per minute per IP address
- **Window**: 1 minute rolling window

If you hit the rate limit, wait a minute before making more requests.

## Security Features

- API keys are stored server-side only (never exposed to the client)
- Rate limiting prevents abuse
- Input validation on all API routes
- Secure headers configured

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your `ANTHROPIC_API_KEY` environment variable in Vercel settings
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to add the `ANTHROPIC_API_KEY` environment variable in your deployment platform.

## Troubleshooting

### "Missing API Key" Error
- Make sure you've created `.env.local` and added your Anthropic API key
- The file should be in the root directory of the project
- Restart the dev server after adding the key

### "Rate Limit Exceeded" Error
- Wait 1 minute before making more requests
- The limit resets every minute

### Templates Not Loading
- Check that `src/data/templates.json` exists and is valid JSON
- Run `npm run dev` to see any error messages

### History Not Persisting
- Make sure your browser allows localStorage
- Check browser console for any errors
- Try clearing browser cache and reloading

## Future Enhancements

Planned features for future versions:
- Dark mode toggle
- More templates (targeting 20+ total)
- Template favoriting
- Search and filter history
- Cloud sync with authentication
- Template marketplace
- Batch prompt generation
- AI-powered template suggestions

## Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are installed (`npm install`)
4. Verify your Anthropic API key is valid

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Anthropic Claude](https://anthropic.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Generated with Claude Code** - Start building amazing AI-powered prompts today!
