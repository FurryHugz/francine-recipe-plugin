const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const SCOPES = ['https://www.googleapis.com/auth/documents'];
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

let auth;

// Authenticate with Google API
async function authenticate() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Load saved tokens if available
    const tokenPath = path.join(__dirname, 'token.json');
    if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath));
        oAuth2Client.setCredentials(token);
    } else {
        throw new Error("No saved token found. Please authenticate locally first.");
    }

    auth = oAuth2Client;
}

// Route to add a recipe
app.post('/add_recipe', async (req, res) => {
    const { docId, title, content } = req.body;
    try {
        await authenticate();
        const docs = google.docs({ version: 'v1', auth });

        const requests = [
            {
                insertText: {
                    location: { index: 1 },
                    text: `### ${title}\n${content}\n\n`,
                },
            },
        ];

        await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: { requests },
        });

        res.json({ status: 'success', message: 'Recipe added successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Route to list recipes
app.get('/list_recipes', async (req, res) => {
    const { docId } = req.query;
    try {
        await authenticate();
        const docs = google.docs({ version: 'v1', auth });

        const doc = await docs.documents.get({ documentId: docId });
        const content = doc.data.body.content
            .map(element => element.paragraph?.elements?.map(el => el.textRun?.content).join(''))
            .filter(text => text)
            .join('\n');

        res.json({ status: 'success', recipes: content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
