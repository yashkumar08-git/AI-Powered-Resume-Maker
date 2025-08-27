# AI-Powered Resume Maker

This is a Next.js application built with Firebase Studio that allows users to create, customize, and save resumes with the help of AI.

## Features

*   **AI-Powered Content Generation**: Automatically generates a professional summary, tailored job descriptions, and a cover letter.
*   **User Authentication**: Secure sign-up and login functionality using Firebase Auth.
*   **Firestore Database**: Save and manage resumes in a secure and scalable NoSQL database.
*   **Resume Customization**: Edit and update saved resumes at any time.
*   **Multiple Templates**: Choose from several professional resume templates.
*   **PDF & Image Export**: Download your resume as a PDF or PNG file.

## How to Deploy for Free

This project is configured for deployment using **Firebase App Hosting**.

### Prerequisites

1.  **Node.js**: Make sure you have Node.js installed on your machine.
2.  **Firebase Account**: You need a Firebase account (you can create one for free).
3.  **Firebase CLI**: Install the Firebase command-line tools globally:
    ```bash
    npm install -g firebase-tools
    ```

### Deployment Steps

1.  **Login to Firebase**:
    ```bash
    firebase login
    ```

2.  **Initialize Firebase in your project (if you haven't already)**:
    Since your project is already configured, you may be able to skip this. If you need to re-initialize, run:
    ```bash
    firebase init hosting
    ```
    When prompted, select "Use an existing project" and choose `careercraft-ai-7utd3`. For the public directory, just press Enter to accept the default (`hosting`). Don't overwrite any existing files if prompted.

3.  **Deploy your application**:
    ```bash
    firebase deploy --only hosting
    ```

After the deployment is complete, the Firebase CLI will give you a URL where you can access your live application. That's it! Your resume maker will be live on the web.
# AI-Powered-Resume-Maker
