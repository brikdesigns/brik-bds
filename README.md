Running npm Commands on Your Mac
Use VS Code's integrated terminal - it's the simplest approach:

Open your project folder in VS Code (/Users/nickstanerson/Documents/GitHub/brik-bds)
Press Ctrl+` (or View > Terminal)
Run commands directly:
npm install      # First time only
npm test         # Run tests
npm start        # Local server

That's it. Everything runs from within VS Code, in your project folder.

Everything in One Place
Your project folder now contains:

What	Where
Source code	footer.js, head.css, css/
Scripts	scripts/
Tests	__tests__/
Test reports	coverage/ (after npm run test:coverage)
Documentation	README.md
Config	package.json, .env.example
README Updated
The README.md now documents:

Quick start for VS Code
All npm scripts
Workflow for deploying changes
One-time setup instructions
Troubleshooting
Also removed a hardcoded API token that was in the old README (security fix).