const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// ==========================
// VIDEO INFO
// ==========================

app.post('/info', (req, res) => {

const url = req.body.url;

if (!url) {

return res.json({
success:false
});

}

const command =
`yt-dlp --dump-json "${url}"`;

exec(command, {

maxBuffer: 1024 * 1024 * 50

}, (error, stdout) => {

if(error){

console.log(error);

return res.json({
success:false
});

}

try{

const data =
JSON.parse(stdout);

const videoUrl =
data.url || '';

res.json({

success:true,

title:
data.title || 'Video',

thumbnail:
data.thumbnail || '',

url:
videoUrl,

download:
'/download?url=' +
encodeURIComponent(url),

uploader:
data.uploader || 'Unknown',

views:
data.view_count || '0',

likes:
data.like_count || '0',

duration:
data.duration_string || 'Unknown',

uploadDate:
data.upload_date || 'Unknown',

description:
data.description || 'No description',

tags:
data.tags || []

});

}catch(err){

console.log(err);

res.json({
success:false
});

}

});

});


// ==========================
// DOWNLOAD VIDEO
// ==========================

app.get('/download', (req, res) => {

const url =
req.query.url;

const quality =
req.query.quality || '720';

if(!url){

return res.send('No URL');

}

let command = '';


// MP3 DOWNLOAD

if(quality === 'mp3'){

command =
`yt-dlp -x --audio-format mp3 -o "audio.mp3" "${url}"`;

exec(command, {

maxBuffer:
1024 * 1024 * 50

}, (error) => {

if(error){

console.log(error);

return res.send('Download failed');

}

res.download(
path.join(__dirname,'audio.mp3'),
() => {

fs.unlinkSync(
path.join(__dirname,'audio.mp3')
);

});

});

return;

}


// VIDEO DOWNLOAD

command =
`yt-dlp -f mp4 -o "video.mp4" "${url}"`;

exec(command, {

maxBuffer:
1024 * 1024 * 100

}, (error) => {

if(error){

console.log(error);

return res.send('Download failed');

}

res.download(
path.join(__dirname,'video.mp4'),
() => {

fs.unlinkSync(
path.join(__dirname,'video.mp4')
);

});

});

});


// ==========================
// HOME PAGE
// ==========================

app.get('/', (req, res) => {

res.sendFile(
path.join(__dirname,'index.html')
);

});


// ==========================
// START SERVER
// ==========================

const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

console.log(
`Running on port ${PORT}`
);

});