
# 🛡️ MevWatch: MEV Bot Detection Dashboard

Welcome to MevWatch! This is a friendly, powerful dashboard designed to help you detect and analyze Maximal Extractable Value (MEV) bot activities on the Ethereum blockchain. Whether you're a security researcher, a DeFi enthusiast, or just curious, MevWatch provides the tools to uncover sandwich attacks and suspicious time-based transaction patterns.

***

## 📚 Table of Contents

- [📍 About The Project](#-about-the-project)
- [🛠️ Built With](#️-built-with)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [💡 Usage](#-usage)
  - [Sandwich Attack Detector](#sandwich-attack-detector)
  - [Time-based MEV Analyzer](#time-based-mev-analyzer)
- [✨ Key Features](#-key-features)
- [📂 Project Structure](#-project-structure)

***

## 📍 About The Project

MevWatch is an interactive web application built with Next.js that leverages the power of Google's Gemini AI through Genkit. It offers a user-friendly interface to analyze blockchain data and identify two common types of MEV bot strategies:

1.  **Sandwich Attacks**: Where an attacker places a transaction before and after a victim's transaction to profit from the price slippage.
2.  **Time-Based Activity**: Where bots execute transactions in very close proximity to a victim's transaction to gain an advantage.

The dashboard provides a real-time log of detected attacks, key statistics, and forms to submit data for analysis.

***

## 🛠️ Built With

This project is built on a modern, robust tech stack:

- [**Next.js**](https://nextjs.org/) - React Framework for building full-stack web applications.
- [**React**](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [**TypeScript**](https://www.typescriptlang.org/) - For strong typing and improved code quality.
- [**Tailwind CSS**](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- [**ShadCN/UI**](https://ui.shadcn.com/) - A collection of beautifully designed, accessible UI components.
- [**Genkit (Gemini AI)**](https://firebase.google.com/docs/genkit) - For integrating powerful generative AI capabilities.
- [**Axios**](https://axios-http.com/) - For making promise-based HTTP requests.

***

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have Node.js and npm (or yarn/pnpm) installed on your machine.

- **Node.js** (v18 or newer recommended)
- **npm**

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Google AI API key.
    ```env
    GOOGLE_API_KEY=YOUR_API_KEY_HERE
    ```

4.  **Run the development server:**
    The application requires two processes to run concurrently: the Next.js app and the Genkit AI flows.

    - **Terminal 1: Start the Next.js app:**
      ```sh
      npm run dev
      ```
      Your app will be available at [http://localhost:9002](http://localhost:9002).

    - **Terminal 2: Start the Genkit development server:**
      ```sh
      npm run genkit:dev
      ```
      This starts the Genkit flows required for the AI analysis.

***

## 💡 Usage

The application is divided into a few key sections:

### Sandwich Attack Detector

- **Purpose**: To analyze a sequence of transactions for signs of a sandwich attack.
- **How to Use**:
  1.  Enter the **Transaction Ordering** (e.g., Attacker Tx1, Victim Tx, Attacker Tx2).
  2.  Provide details on **Gas Premiums** (e.g., how much more gas the attacker paid).
  3.  Input the victim's **Slippage Tolerance**.
  4.  Click "Detect Attack" to get an AI-powered analysis.

### Time-based MEV Analyzer

- **Purpose**: To detect suspicious activity based on transaction timestamps.
- **How to Use**:
  1.  Enter the **Victim's Transaction Timestamp** (in Unix format).
  2.  Provide a comma-separated list of **Bot Timestamps**.
  3.  Provide a comma-separated list of corresponding **Bot Addresses**.
  4.  Click "Analyze Timestamps" to see if the timing is suspicious.

The results of any detected attacks from either tool will be added to the **MEV Attack Log** table in real-time.

***

## ✨ Key Features

- **📊 Stats Dashboard**: At-a-glance view of total attacks, profits, unique victims, and active bots.
- **🤖 AI-Powered Analysis**: Uses Genkit and Gemini to provide intelligent, context-aware detection.
- **📝 Real-time Attack Log**: See a live-updating table of all detected MEV activities.
- **🌗 Light & Dark Mode**: A sleek, themeable UI for your comfort.
- **⚙️ API with Fallback**: Uses a robust API for analysis with a fallback to local server actions, ensuring high availability.
- **💅 Modern UI**: Built with ShadCN/UI and Tailwind CSS for a professional and responsive design.

***

## 📂 Project Structure

Here's a quick look at the key directories in the project:

```
/
├── src/
│   ├── app/                # Main application routes, pages, and API endpoints
│   │   ├── api/            # API routes (e.g., for Axios calls)
│   │   ├── page.tsx        # The main dashboard page
│   │   └── layout.tsx      # The root layout
│   ├── ai/                 # Genkit AI configuration and flows
│   │   ├── flows/          # AI analysis flows (e.g., detect-sandwich-attack.ts)
│   │   └── genkit.ts       # Genkit initialization
│   ├── components/         # Reusable React components
│   │   ├── ui/             # ShadCN UI components
│   │   └── header.tsx      # The main header
│   └── lib/                # Utility functions and libraries
└── ...
```

Feel free to explore and enhance it. Happy coding!

# MevWatch
