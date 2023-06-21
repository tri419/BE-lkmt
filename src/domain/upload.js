const { ErrorModel } = require('../models');
const { ERROR, ROUTE, LOGS } = require('../constants');
const { google } = require('googleapis');
const fs = require('fs');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

class UploadService {
  constructor() {}
  async setFilePublic(fileId) {
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const getUrl = await drive.files.get({
        fileId,
        fields: 'webViewLink, webContentLink',
      });

      return getUrl;
    } catch (error) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message: 'Lỗi Set Public File Google Drive',
      });
    }
  }
  async uploadFile(file) {
    try {
      const image = file.file[0];
      fs.writeFileSync(`./uploads/${image.originalname}`, image.buffer);
      const createFile = await drive.files.create({
        requestBody: {
          name: Date.now().toString() + '.jpg',
          mimeType: image.mimetype,
        },
        media: {
          mimeType: image.mimetype,
          body: fs.createReadStream(`./uploads/${image.originalname}`),
        },
      });
      const fileId = createFile.data.id;
      if (fileId != null) {
        fs.unlink(`./uploads/${image.originalname}`, (err) => console.log(err));
      }
      const getUrl = await this.setFilePublic(fileId);
      return getUrl.data;
    } catch (error) {
      throw ErrorModel.initWithParams({
        ...ERROR.VALIDATION.INVALID_REQUEST,
        message: 'Lỗi Upload File Google Drive',
      });
    }
  }
}
module.exports = UploadService;
