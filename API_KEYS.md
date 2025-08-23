# API Keys & Environment Configuration

## Security Notice
This project requires API keys that are NOT stored in this repository for security reasons.

## Required Environment Variables

### Google Gemini API
- `GOOGLE_GENERATIVE_AI_API_KEY` - Primary AI provider for Steve
- Location: `bolt.diy/.env`

### Azure OpenAI (Backup Provider)
- `AZURE_OPENAI_API_KEY` - Backup AI provider
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint URL
- Location: `bolt.diy/.env`

## Setup Instructions

1. **API Key Backup Location**: `.secure-backup/` directory (gitignored)
2. **Environment File**: Copy your backup to `bolt.diy/.env`
3. **Format**: Use the `.env.example` file as a template

## Recovery Process

If you need to restore your API keys:

```bash
# List available backups
ls -la .secure-backup/

# Copy the most recent backup
cp .secure-backup/env-backup-[timestamp].txt bolt.diy/.env
```

## Security Best Practices

- API keys are automatically backed up to `.secure-backup/` before git operations
- The `.secure-backup/` directory is excluded from git commits
- Never commit actual API keys to the repository
- Use environment variables for all sensitive configuration

## Steve Development Server

Start the development server with:

```bash
cd bolt.diy
pnpm run dev
```

Server typically runs on port 5178, but may use alternate ports if occupied.