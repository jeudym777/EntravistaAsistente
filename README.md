# AI Interview Copilot 🎤

An intelligent web application that helps you practice interviews with AI-powered suggestions. The app listens to or receives interview questions and generates realistic, candidate-focused responses.

## Features 🚀

- **Speech Recognition**: Uses Web Speech API to transcribe interviewer questions in real-time
- **Manual Input**: Type questions if your browser doesn't support speech recognition
- **AI-Powered Responses**: Generates contextual answers using OpenAI GPT-4
- **Multiple Languages**: Support for English and Spanish
- **Customizable Responses**: Modify answers to be shorter, more technical, or more natural
- **Camera Support**: Optional webcam preview (for future integration)
- **Professional Dark Theme**: Modern, distraction-free interface designed for interviews
- **Responsive Design**: Built with Tailwind CSS for a clean, modern look

## Tech Stack 🛠️

- **React 18**: UI framework
- **Vite**: Lightning-fast build tool
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **OpenAI API**: LLM for generating answers
- **Web Speech API**: Speech-to-text recognition
- **Web APIs**: Camera and Media access

## Installation 📦

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key (get one at [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys))

### Setup

1. **Clone or navigate to the project**
   ```bash
   cd Entrevista_Asistente
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=sk-...your-api-key-here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173/`

## Usage 📱

### Setup Panel (Right Column)

1. **Language**: Select English or Spanish for the response language
2. **Word Limit**: Set the desired answer length (default: 120 words)
3. **Candidate Profile**: Paste your CV, experience, or relevant information
4. **Job Description**: Paste the job listing or requirements
5. **Extra Instructions**: Add any additional context for the AI
6. **Camera** (Optional): Enable webcam for practice

### Interview Chat (Left Column)

1. **Listen to Questions**:
   - Click "🎤 Start Listening" to record a question
   - The app transcribes using Speech Recognition
   - Click "⏹️ Stop Listening" when done

2. **Manual Input** (Alternative):
   - Type the question in the text field if speech recognition isn't available
   - Click "✨ Generate Answer"

3. **Generate Answers**:
   - The AI generates a contextual response based on your profile and the job
   - Answers are displayed in the chat history
   - The response is formatted for easy delivery in a real interview

4. **Modify Answers**:
   - **📉 Shorter**: Regenerate a more concise version
   - **⚙️ Technical**: Make the answer more technical and specific
   - **💬 Natural**: Make it more conversational and natural
   - **📋 Copy Answer**: Copy to clipboard for quick reference

## File Structure 📁

```
src/
├── App.tsx                 # Main application component
├── main.tsx               # Entry point
├── index.css              # Global Tailwind CSS styles
├── components/
│   ├── InterviewSetup.tsx      # Right panel - configuration
│   ├── InterviewChat.tsx        # Left panel - chat & controls
│   ├── AudioControls.tsx        # Microphone controls
│   └── CameraPanel.tsx          # Camera preview & controls
├── services/
│   └── openaiService.ts         # OpenAI API integration
├── hooks/
│   ├── useSpeechRecognition.ts  # Speech-to-text hook
│   └── useCamera.ts             # Camera/webcam hook
└── types/
    └── index.ts                 # TypeScript type definitions
```

## Environment Variables 🔑

Create a `.env` file in the project root:

```env
VITE_OPENAI_API_KEY=sk-...your-api-key-here
```

**Note**: Never commit `.env` to version control. Use `.env.example` as a template for others.

## Building for Production 🏗️

```bash
npm run build
```

The output will be in the `dist/` directory.

## Preview Production Build 👀

```bash
npm run preview
```

## Browser Support 🌐

- **Chrome/Edge**: Full support (including Speech Recognition)
- **Firefox**: Full support (Speech Recognition support varies by region)
- **Safari**: Full support (Speech Recognition on iOS 14.5+)
- **Opera**: Full support

**Note**: If your browser doesn't support Web Speech API, you can still type questions manually.

## OpenAI API Configuration ⚙️

The app uses the following OpenAI settings:

- **Model**: `gpt-4o-mini` (or `gpt-4.1-mini`)
- **Temperature**: 0.5 (for balanced creativity and consistency)
- **Max Tokens**: Based on word limit
- **System Prompt**: Tailored for interview preparation with context injection

## How It Works 🎯

1. User provides their CV and target job description
2. User asks a question (via speech or text)
3. App transcribes the question (if using speech)
4. App sends the question to OpenAI with context about the candidate and job
5. AI generates a natural, contextual response in first person
6. Response appears in chat history for review
7. User can copy the answer or modify it before their actual interview

## API Calls 📡

Each answer generation makes one API call to OpenAI. Pricing varies based on tokens used.
- **Input tokens**: ~200-400 (depending on profile size)
- **Output tokens**: ~100-300 (based on word limit)

Monitor your usage at [https://platform.openai.com/account/usage/overview](https://platform.openai.com/account/usage/overview)

## Tips for Best Results 💡

1. **Detailed Profile**: The more detailed your candidate profile, the better the AI can tailor responses
2. **Clear Job Description**: Include key responsibilities and requirements
3. **Word Limit**: Set appropriate limits for the interview format
4. **Extra Instructions**: Use this for specific tone or focus preferences
5. **Review Answers**: Always review and personalize AI-generated answers before using them

## Troubleshooting 🔧

### Speech Recognition Not Working
- Check browser support (works best in Chrome/Edge)
- Ensure microphone permissions are granted
- Try refreshing the page
- Use manual text input as fallback

### "VITE_OPENAI_API_KEY not found" Error
- Add your API key to `.env` file
- Restart the dev server after adding the key

### API Rate Limit Exceeded
- Check your OpenAI usage at https://platform.openai.com/account/usage/overview
- Wait a minute before making new requests
- Consider upgrading your OpenAI account tier

### Camera Not Working
- Check browser permissions for camera access
- Ensure camera is not already in use by another application
- Try in a different browser

## Future Enhancements 🎁

- [ ] Store conversation history in browser
- [ ] Export responses as PDF or document
- [ ] Integration of camera snapshots with OpenAI Vision API
- [ ] Interview video recording
- [ ] Real-time feedback scoring
- [ ] Multi-language speech recognition
- [ ] Local storage for profiles and job descriptions
- [ ] Share interview practice sessions
- [ ] Analytics dashboard for performance tracking

## License 📄

This project is open source and available for educational purposes.

## Disclaimer ⚠️

This tool is designed to help you practice interviews and prepare responses. However:
- Always review AI-generated answers carefully
- Personalize responses to reflect your authentic experience
- Honesty is crucial in interviews
- Use this tool ethically and responsibly

---

**Built with ❤️ for interview success**

Questions or issues? Feel free to provide feedback!

