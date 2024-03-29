const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv')
const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());
dotenv.config();
// Function to fetch video details
const getVideoDetails = async (videoId) => {
  try {
    const apiKey = process.env.NODE_YOUTUBE_API_KEY;
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`);
    if (response.data.items.length > 0) {
      const videoTitle = response.data.items[0].snippet.title;
      // console.log('Video Title:', videoTitle);
      return videoTitle;
    }
  } catch (error) {
    console.error('Error fetching video details', error);
  }
};


// Fetch-thumbnail endpoint
app.get('/fetch-thumbnail', async (req, res) => {
  try {
    const videoId = req.query.videoId;
    const quality = req.query.quality || 'maxresdefault';
    const response = await axios.get(`https://i.ytimg.com/vi/${videoId}/${quality}.jpg`, {
      responseType: 'arraybuffer',
    });
    const data = Buffer.from(response.data, 'binary');
    
    // Fetch video details
    const videoTitle = await getVideoDetails(videoId);

    // Set appropriate headers for downloading the image
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'attachment; filename=thumbnail.jpg');
    res.setHeader('Content-Length', data.length);
    
    // Send the response with the video title and thumbnail
    console.log(videoTitle);
    res.json({ videoTitle:videoTitle, thumbnail: data.toString('base64') });
  } catch (error) {
    console.error('Error fetching image', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

