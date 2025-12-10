# aws-she-builds-tracker
# AWS She Builds Mentorship Tracker

A comprehensive tracking system for the AWS She Builds Mentorship Program, designed to help mentees, mentors, and coordinators manage their 12-week journey.

## 🎯 Features

### For Mentees
- **Month 1: Foundation & Goal Setting**
  - Personal Mission Statement
  - North Star Vision (Working Backwards)
  - SMART Goals (Short & Long-term)
  - Skill Assessment Matrix
  - Future Self Press Release
  - Meeting Logs

- **Month 2: Exploration & Skill Development**
  - Industry Research (3 Companies/Roles)
  - Networking Action Plan
  - Skill Development Roadmap
  - Professional Brand Audit

- **Month 3: Apply, Grow & Thrive**
  - 90-Day Action Plan
  - Professional Portfolio (STAR Format)
  - Extended Networking Plan
  - Learning Plan
  - Success Metrics

### For Mentors
- Mentee Profile Management
- Meeting Documentation
- Progress Tracking
- Feedback & Guidance Tools

### For Coordinators
- Program Overview Dashboard
- Mentor-Mentee Pair Management
- Event Tracking
- Program Health Metrics

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- GitHub account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aws-she-builds-tracker.git
   cd aws-she-builds-tracker
   ```

2. **Open locally**
   - Simply open `index.html` in your browser
   - No build process required!

3. **Deploy to GitHub Pages**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```
   - Go to Settings > Pages
   - Select `main` branch
   - Save and wait for deployment

## 📁 Project Structure

```
aws-she-builds-tracker/
├── index.html              # Landing page
├── onboarding.html         # Role selection
├── assets/
│   ├── css/
│   │   └── main.css       # Global styles
│   └── js/
│       ├── storage.js     # Storage utilities
│       └── utils.js       # Helper functions
├── mentee/
│   ├── dashboard.html     # Main dashboard
│   ├── month1.html        # Month 1 page
│   ├── month2.html        # Month 2 page
│   ├── month3.html        # Month 3 page
│   └── components/        # Modular components
├── mentor/
│   └── dashboard.html     # Mentor dashboard
├── coordinator/
│   └── dashboard.html     # Coordinator dashboard
└── README.md
```

## 💾 Data Storage

This app uses browser-based persistent storage via Claude's `window.storage` API:
- Data persists across sessions
- No backend server required
- Privacy-first approach (data stays in user's browser)

## 🎨 Tech Stack

- **HTML5** - Structure
- **Tailwind CSS** - Styling (via CDN)
- **Vanilla JavaScript** - Functionality
- **ES6 Modules** - Component architecture
- **Window Storage API** - Data persistence

## 📝 Usage

1. **Landing Page**: Overview of the program
2. **Role Selection**: Choose Mentee, Mentor, or Coordinator
3. **Dashboard**: Navigate through months and complete assignments
4. **Auto-save**: Progress is automatically saved
5. **Export**: Download your completed work (coming soon)

## 🔧 Development

### Adding New Components

1. Create component file in `mentee/components/`
2. Export component as ES6 module
3. Import in month page
4. Add to page structure

### Modifying Styles

- Global styles: `assets/css/main.css`
- Tailwind classes: Use directly in HTML
- Custom components: Create separate CSS file

## 🤝 Contributing

This is an internal tool for AWS She Builds program. For suggestions or improvements:
1. Create an issue
2. Fork the repository
3. Make your changes
4. Submit a pull request

## 📄 License

© 2025 AWS She Builds Mentorship Program. All rights reserved.

## 🙏 Acknowledgments

- AWS She Builds team for the amazing program
- All mentees, mentors, and coordinators
- Contributors to this tracker

## 📧 Contact

For questions or support, contact: aws-shebuilds-community@amazon.com

---

**Made with 💜 for women in tech**

## 📋 Documentation
- [Implementation Guide](IMPLEMENTATION.md) - Project roadmap and technical details
- [User Guide](docs/USER_GUIDE.md) - How to use the system