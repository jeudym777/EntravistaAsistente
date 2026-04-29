# 🚀 AI Interview Copilot - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
Create a `.env` file in the project root with your OpenAI API key:
```
VITE_OPENAI_API_KEY=sk-...your-actual-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

### 3. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173/`

---

## 📋 Project Structure

```
Entrevista_Asistente/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── main.tsx               # React entry point
│   ├── index.css              # Global styles
│   ├── components/
│   │   ├── InterviewChat.tsx        # Left panel - chat interface
│   │   ├── InterviewSetup.tsx       # Right panel - configuration
│   │   ├── AudioControls.tsx        # Microphone controls
│   │   └── CameraPanel.tsx          # Camera preview
│   ├── services/
│   │   └── openaiService.ts         # OpenAI API integration
│   ├── hooks/
│   │   ├── useSpeechRecognition.ts  # Speech-to-text hook
│   │   └── useCamera.ts             # Camera/webcam hook
│   └── types/
│       └── index.ts                 # TypeScript type definitions
├── index.html                 # HTML entry point
├── .env                       # Environment variables (create this!)
├── .env.example              # Template for .env
├── README.md                 # Full documentation
├── SETUP.md                  # This file
└── package.json             # Dependencies and scripts
```

---

## 🔧 Available Scripts

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for TypeScript errors
npx tsc --noEmit
```

---

## ⚙️ Environment Setup

### Creating .env File

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx...
   ```

3. **Important**: Never commit `.env` file to git. It's already in `.gitignore`.

### Getting Your OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key immediately (you won't see it again!)
4. Paste it into your `.env` file as `VITE_OPENAI_API_KEY`

---

## 🎮 How to Use the Application

### Left Panel - Interview Practice
1. **Start Listening**: Click the green button to enable microphone
   - Browser will ask for microphone permission
   - Speak your interviewer's question
   - Click "Stop Listening" when done
   
2. **Manual Input**: Type a question in the text area if speech recognition doesn't work
   
3. **Generate Answer**: Click the blue button to get an AI-powered response
   - Response will appear in the chat history
   - Based on your profile and the job description

4. **Modify Answers**: After generating an answer, use these buttons:
   - **📉 Shorter**: Get a more concise version
   - **⚙️ Technical**: Make it more technical/specific
   - **💬 Natural**: Make it more conversational
   - **📋 Copy Answer**: Copy to clipboard for reference

### Right Panel - Configuration
1. **Language**: Select English or Spanish for response language
2. **Word Limit**: Set how many words the answer should be (50-500)
3. **Candidate Profile**: Paste your CV, experience, and skills
4. **Job Description**: Paste the job listing and requirements
5. **Extra Instructions**: Add any specific guidance for the AI
6. **Camera**: Optionally enable/disable webcam preview

---

## 🌐 Browser Compatibility

| Browser | Speech Recognition | Camera | Status |
|---------|------------------|--------|--------|
| Chrome/Chromium | ✅ Yes | ✅ Yes | ✨ Best |
| Edge | ✅ Yes | ✅ Yes | ✨ Best |
| Firefox | ✅ Yes | ✅ Yes | ✅ Good |
| Safari | ✅ Yes* | ✅ Yes | ✅ Good |
| Opera | ✅ Yes | ✅ Yes | ✅ Good |

*Safari: Speech Recognition works on iOS 14.5+ and macOS 10.15+

---

## 🚨 Troubleshooting

### Error: "VITE_OPENAI_API_KEY not found"
**Solution**: Make sure you created the `.env` file with your API key, then restart the dev server.

### Speech Recognition Not Working
- Check browser compatibility (works best in Chrome/Edge)
- Grant microphone permissions when prompted
- Use manual text input as fallback
- Try in a different browser

### Camera Not Working
- Grant camera permissions in browser settings
- Ensure camera isn't being used by another app
- Try closing and reopening the app
- Note: Camera snapshot feature is for preview only (not sent to AI yet)

### API Errors (401, 429, etc.)
- **401**: Invalid API key. Check `.env` file
- **429**: Rate limit exceeded. Wait a moment and try again
- **503**: OpenAI service temporarily down. Try later
- Check your account at https://platform.openai.com/account/usage/overview

### Build or Compilation Errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install

# Check for TypeScript errors
npx tsc --noEmit

# Restart dev server
npm run dev
```

---

## 📦 Production Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Important for Production
1. **Remove Tailwind CDN**: Replace CDN link with proper Tailwind build
2. **Secure API Key**: Use environment variables on the server
3. **API Rate Limiting**: Implement rate limiting on your backend
4. **Error Handling**: Add proper error boundaries and logging
5. **Testing**: Test all features before deployment

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## 🔐 Security Notes

⚠️ **NEVER share your `.env` file or API key publicly!**

- API keys in `.env` are safe locally
- For production, use server-side environment variables
- Consider using a backend API proxy instead of direct API calls
- Implement rate limiting to prevent abuse
- Monitor OpenAI API usage and costs

---

## 📚 API Documentation

### OpenAI Integration
The app uses `gpt-4o-mini` model with:
- Temperature: 0.5 (balanced creativity)
- Max tokens: Based on word limit setting
- System prompt: Customized for interview practice

### Cost Estimation
Approximate costs per API call:
- Input tokens: 200-400 (~$0.003-$0.006 per request)
- Output tokens: 100-300 (~$0.0009-$0.0027 per request)
- Total: ~$0.005 per request

Monitor usage: https://platform.openai.com/account/usage/overview

---

## 🤝 Contributing

Want to improve the app? You can:
1. Add more languages
2. Improve speech recognition handling
3. Add video interview recording
4. Create interview analytics
5. Add export/share features
6. Improve AI prompt customization

---

## 📞 Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Review browser console for error messages
3. Verify `.env` file is properly configured
4. Check OpenAI API status at https://status.openai.com/
5. Check your API key hasn't been revoked

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create `.env` file with your API key
3. ✅ Start server: `npm run dev`
4. ✅ Fill in your profile in the right panel
5. ✅ Ask your first practice question!

Good luck with your interview preparation! 🚀
