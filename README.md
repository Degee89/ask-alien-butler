# Ask Alien Butler

A late-90s style search page where an alien butler answers questions with Claude.

## Files
- `index.html` is the page.
- `netlify/functions/ask.mjs` is the server function that talks to Claude.
- `netlify.toml` tells Netlify where things are.

## Setup
1. Get an API key at console.anthropic.com. Add a payment method and set a monthly spend limit.
2. Create a free GitHub account. Make a new repository and upload all of these files, keeping the folders.
3. Create a free Netlify account. Choose "Add new site", then "Import from GitHub", and pick the repository.
4. In Netlify, go to Site configuration, then Environment variables. Add `ANTHROPIC_API_KEY` with your key.
5. Redeploy. Your site is live at the address Netlify gives you.

Optional: buy a domain and connect it under Domain management in Netlify.

## Notes
- Never put the API key in `index.html`. Anyone could copy it.
- Each question costs a fraction of a cent. The spend limit protects you if the site gets busy.
- To change the model, add a `MODEL` environment variable.
