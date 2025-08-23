# Steve - AI Coding Assistant

![Steve Logo](https://img.shields.io/badge/Steve-AI%20Coding%20Assistant-purple?style=for-the-badge)

## Overview

Steve is an enhanced AI coding assistant built on the Bolt.diy foundation, specifically designed to eliminate rate limiting issues and provide a seamless development experience. The platform features complete rebranding with a purple theme and robust multi-provider AI integration.

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- Git

### Installation & Startup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/donnywonny2025/Steve.git
   cd Steve
   ```

2. **Navigate to main project directory:**
   ```bash
   cd bolt.diy
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Start the development server:**
   ```bash
   pnpm run dev
   ```

5. **Access Steve:**
   - Open your browser to `http://localhost:5178` (or next available port)
   - Steve will automatically start and be ready for use

### Quick Health Check
```bash
# From the project root directory
./instant_status.sh
```

## Project Structure

```
Steve/
├── bolt.diy/                 # Main application directory
│   ├── app/                  # Core application code
│   │   ├── components/       # React components
│   │   ├── lib/             # Utilities and services
│   │   ├── routes/          # API and page routes
│   │   └── styles/          # Styling and themes
│   ├── package.json         # Project dependencies
│   └── vite.config.ts       # Build configuration
├── Master/                   # Project documentation and vision
│   ├── Steve Platform - Complete Vision & Capabilities Brief.pdf
│   └── STEVIE's Brain Database - UI Component Libraries & Tools.pdf
├── startup.json             # Complete technical context for restoration
├── instant_status.sh        # Health check script
├── monitor_*.py             # Monitoring tools
└── README.md               # This file
```

## AI Provider Configuration

### Primary Provider: Google Gemini
- **API Key:** Configured in environment variables
- **Default Model:** `gemini-2.5-flash` (optimal quota usage)
- **Thinking Models:** `gemini-2.5-pro` (🧠 enhanced reasoning)
- **Rate Limiting:** Conservative limits to prevent quota exhaustion

### Fallback Chain
1. **Google Gemini** (Primary)
2. **OpenRouter** (Secondary backup)
3. **Azure OpenAI** (Configured but currently inaccessible)

## Key Features

### 🎨 Complete Steve Branding
- Purple-themed UI throughout
- "Steve" branding in header and titles
- Consistent visual identity

### 🧠 Advanced AI Integration
- Thinking models with internal reasoning
- Intelligent rate limiting
- Multi-provider fallback system
- Quota preservation strategies

### ⚡ Performance Optimized
- Vite development server
- Remix framework
- WebContainer runtime
- Real-time monitoring

### 📊 Comprehensive Monitoring
- System health checks
- API performance tracking
- Error detection and logging
- Quota usage monitoring

## Development Workflow

### Context Restoration
If you need to restore complete project context after a restart:
```bash
# The assistant should read startup.json for complete technical context
# This file contains all configuration details, AI provider setup,
# system architecture, and current operational status
```

### Running in Development
- Server runs on port 5178 by default
- Auto-reload enabled for real-time development
- Chrome DevTools recommended for debugging
- Use Firefox or Safari if Chrome 129 compatibility issues occur

### Environment Configuration
Create `.env` file in `bolt.diy/` directory:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
AZURE_OPENAI_API_KEY=your_azure_key
AZURE_OPENAI_ENDPOINT=your_azure_endpoint
```

## Project Documentation

### Complete Technical Context
- **startup.json**: Contains comprehensive technical state for immediate context restoration
- **Master/**: Project vision documents and design specifications
- **bolt-analysis.md**: Technical analysis and enhancement documentation

### Monitoring & Diagnostics
- **instant_status.sh**: Quick health check
- **monitor_steve_comprehensive.py**: Full system monitoring
- **monitor_gemini_usage.py**: AI provider usage tracking

## Key Technologies

- **Framework:** Remix (React-based full-stack)
- **Build Tool:** Vite
- **Package Manager:** pnpm
- **Runtime:** Node.js + WebContainer
- **AI Integration:** @ai-sdk/* packages
- **Styling:** Tailwind CSS with purple theme
- **Language:** TypeScript

## Troubleshooting

### Common Issues
1. **Port conflicts:** Server will automatically try next available port
2. **Chrome compatibility:** Use Chrome Canary, Firefox, or Safari for development
3. **Rate limiting:** Steve includes intelligent quota management
4. **Provider failures:** Automatic fallback to secondary providers

### Health Monitoring
```bash
# Quick status check
./instant_status.sh

# Comprehensive monitoring
python3 monitor_steve_comprehensive.py

# Gemini quota tracking
python3 monitor_gemini_usage.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes in the `bolt.diy/` directory
4. Test thoroughly
5. Submit a pull request

## License

This project builds upon the open-source Bolt.diy foundation with significant enhancements and customizations.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review `startup.json` for complete technical context
- Use monitoring tools to diagnose issues
- Consult project documentation in the `Master/` folder

---

**Steve - Your AI Coding Assistant** 🚀