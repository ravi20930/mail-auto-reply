const fs = require('fs');
const cron = require('node-cron');
const { loadToken, gmail } = require("./auth");

async function checkFileExists(filePath) {
    try {
        await fs.promises.access(filePath);
        return true; // File exists
    } catch (error) {
        return false; // File does not exist
    }
}

// Create the custom label if it doesn't exist
async function createLabelIfNotExists() {
    const res = await gmail.users.labels.list({ userId: 'me' });
    const labels = res.data.labels;
    // console.log(labels);
    const labelExists = labels.some((label) => label.name === 'AUTO_REPLIED_MAILS');

    if (!labelExists) {
        const d = await gmail.users.labels.create({
            userId: 'me',
            requestBody: {
                name: 'AUTO_REPLIED_MAILS',
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show',
            },
        });
        console.log(d.data.id);
        fs.writeFileSync('label', JSON.stringify({"name":"AUTO_REPLIED_MAILS", "id":d.data.id}));
        console.log(`Label created.`);
    }
}

async function replyToEmail(emailId, subject, body) {
    try {
        // const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        const email = await gmail.users.messages.get({
            userId: 'me',
            id: emailId,
        });

        const originalSender = email.data.payload.headers.find(
            (header) => header.name === 'From'
        ).value;

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: Buffer.from(
                    `From: "me"\nTo: ${originalSender}\nSubject: ${subject}\n\n${body}`
                ).toString('base64'),
                threadId: emailId,
            },
        });
        const {id} = JSON.parse(fs.readFileSync('label'));
        await gmail.users.messages.modify({
            userId: 'me',
            id: emailId,
            requestBody: {
                addLabelIds: ['INBOX', id],
                removeLabelIds: ['UNREAD'],
            },
        });
        console.log('Reply sent.');
    } catch (err) {
        console.error(err);
    }
}

async function listAndReplyToEmails() {
    try {
        // const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
        // maxResults is number of mails you want to send auto replies to in every call.
        const res = await gmail.users.messages.list({
            userId: 'me',
            labelIds: ['UNREAD', 'INBOX'],
            maxResults: 5,
        });

        const emails = res.data.messages;
        if (emails && emails.length) {
            console.log('Recent emails:');
            for (const email of emails) {
                const res = await gmail.users.messages.get({
                    userId: 'me',
                    id: email.id,
                });

                const subject = res.data.payload.headers.find(
                    (header) => header.name === 'Subject'
                ).value;

                const sender = res.data.payload.headers.find(
                    (header) => header.name === 'From'
                ).value;

                console.log('- Sender:', sender); // Log the sender's email
                console.log('- Subject:', subject); // Log the subject of each email

                const body = 'Thank you for your email. Your message has been received and will be processed shortly.';
                await replyToEmail(email.id, subject, body);
            }
        } else {
            console.log('No new emails.');
        }
    } catch (err) {
        console.error(err);
    }
}

(async () => {
    // checking login status
    await loadToken();
    // checking for label configuration locally
    const checkLabel = await checkFileExists("label");
    if (!checkLabel) {
        console.log("checking for label...");
        await createLabelIfNotExists();
    }
    // cron job to monitor mails every 5 minutes
    console.log("checking for mails every 5 minutes.");
    cron.schedule('*/5 * * * *', async () => {
        console.log('Checking for new emails...');
        await listAndReplyToEmails();
    });
})();