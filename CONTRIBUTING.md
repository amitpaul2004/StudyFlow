# Contributing to StudySphere

Welcome! We are thrilled that you are interested in contributing to StudySphere. This project is built using only vanilla **HTML, CSS, and JavaScript** to make it accessible and easy for beginners and intermediate developers to contribute.

Please read through these guidelines before starting your contribution.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### 1. Finding Issues to Work On
We maintain a list of issues ranging from simple UI tweaks to advanced functional features. 
- Look for issues labeled `good first issue` if you are new to the project or open source in general.
- If you find a bug or have a feature request, please open a new issue using our templates.

### 2. Local Setup
Since StudySphere is built with pure web technologies, setting it up is incredibly straightforward:

1. **Fork the Repository**: Click the "Fork" button at the top right of the repository page.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/StudySphere.git
   cd StudySphere
   ```
3. **Open the Project**: You do not need `npm install` or any build steps. Simply double-click `index.html` to open it in your browser, or use a local development server like:
   - VS Code "Live Server" extension
   - Python simple server: `python -m http.server 8000`
   - Node-static: `npx http-server`

### 3. Submission Guidelines
1. **Branch Naming**: Keep it descriptive, e.g., `feat/add-quiz-card` or `fix/modal-scrolling`.
2. **Coding Standards**:
   - Write clean, semantic HTML5.
   - Use CSS variables for layout sizing and themes.
   - Keep JavaScript modular, documenting functions with JSDoc headers.
   - Ensure all data manipulations use the database manager (`js/db.js`).
3. **Test Locally**: Check your changes across desktop, tablet, and mobile views. Validate that local storage updates persist correctly when switching themes or reloading the page.
4. **Commit & Push**:
   ```bash
   git add .
   git commit -m "feat: add quiz creator logic"
   git push origin feat/add-quiz-card
   ```
5. **Open a Pull Request**: Provide a detailed description of your changes, referencing any related issue IDs.

## Beginner-Friendly Tasks ("good first issue")

Here are a few features waiting for contributors:
1. **Quiz Generator**: Create a simple multiple-choice quiz creator card and display quizzes.
2. **Calendar Integration**: Highlight assignment deadlines on a monthly calendar view widget.
3. **Attendance Tracker**: A simple log dashboard to track lecture attendance.
4. **Additional Custom Avatars**: Add a list of pixel art or vector avatars to the profile selector.
5. **Notes Markdown Renderer**: Replace the raw text rendering of notes content with a simple markdown parser library (like marked.js).

Thank you for helping make StudySphere better for everyone!
