# Simple Setup Instructions

Follow these steps **exactly** in order:

## Step 1: Install Everything
Open Command Prompt in the project folder and type:
```
npm install
```
Wait for it to finish.

## Step 2: Check Your API Key
Open the file `.env.local` and make sure it has:
```
ANTHROPIC_API_KEY=your_key_here
```
(Replace `your_key_here` with your actual API key)

## Step 3: Test It Works
In Command Prompt, type:
```
npm run dev
```

Then open Chrome and go to: http://localhost:3000

Try these:
- Upload a PDF
- Click "Generate Flashcards"
- If that works, everything is good!

## Step 4: Push to GitHub
```
git add .
git commit -m "Added all 8 advanced features"
git push
```

## Step 5: Update Vercel
1. Go to https://vercel.com/dashboard
2. Click your project
3. Click "Settings" → "Environment Variables"
4. Make sure `ANTHROPIC_API_KEY` is there
5. Go to "Deployments" → Click "Redeploy"

## Done!
Your site is live with all features!

---

## Optional: Install Browser Extension
1. Open Chrome
2. Type in address bar: `chrome://extensions`
3. Turn on "Developer mode" (top right)
4. Click "Load unpacked"
5. Select folder: `C:\Users\naeto\prompt-generator\browser-extension`
6. Done! Extension is installed.

---

## Need Help?
If anything breaks, paste the error message and I'll fix it.
