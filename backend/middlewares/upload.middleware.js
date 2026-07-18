const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the File System module

// 1. Define the exact path where you want the files to go
// Using __dirname ensures it finds the right folder no matter where you run the server from
const uploadDirectory = path.join(__dirname, '../uploads/documents');

// 2. Automatically create the folder if it doesn't exist!
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// 3. Set up storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDirectory); // Point to the guaranteed directory
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });
module.exports = upload;