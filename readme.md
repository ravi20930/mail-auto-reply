# Mail Auto Reply

This Node.js application enables you to automatically monitor and reply to new emails in your Gmail account using the Gmail API.

## Prerequisites

Before running this application, ensure that you have the following prerequisites installed and set up:

- Node.js (version 14 or higher)
- Gmail API credentials (credentials.json) from the Google Cloud Console

## Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ravi20930/mail-auto-reply.git
   ```

2. **Install dependencies**

   Navigate to the cloned repository directory:

   ```bash
   cd mail-auto-reply
   ```

   Install the required dependencies:

   ```bash
   npm install
   ```

3. **Obtain Gmail API credentials**

   - Go to the Google Cloud Console.
   - Create a new project or select an existing project.
   - Enable the Gmail API for your project.
   - Create credentials (OAuth client ID) for a Web/Desktop application.
   - Download the credentials JSON file and save it as `credentials.json` in the project directory.

4. **Run the application**

   Start the application by running the following command:

   ```bash
   node app.js
   ```

   The application will prompt you to authorize it by visiting a URL in your web browser. Follow the authorization flow and enter the generated authorization code in the terminal from browser url bar.
   Below is sample URL, where YOUR_CODE is the token you need to put in the terminal.
   
   http://localhost:3000/callback?code={YOUR_CODE}&scope=https://www.googleapis.com/auth/gmail.modify

5. **Usage**

   The application will check your Gmail account for new unread emails in an interval defined in the cron-job in app.js, by default it is set to 5 minutes. When a new email is received, it will automatically send a predefined reply to the sender and mark the email as read.

   Also you can see all the emails which are automatically replied under AUTO_REPLIED_MAILS label.

   You can customize the reply message and other settings like number of emails you want to reply (by default it is set to 5, so it will auto-reply the 5 latest unread emails) by modifying the code in the `app.js` file.