const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// VIDEO INFO
app.post('/info', (req, res) => {

const url = req.body.url;

if (!url) {
return res.json({
success:false
});
}

const command = `yt-dlp --dump-json "${url}"`;

exec(command, (error, stdout) => {

if (error) {

console.log(error);

return res.json({
success:false
});

}

try {

const data = JSON.parse(stdout);
res.json({

success:true,

title:data.title || 'Video',

thumbnail:data.thumbnail || '',

url:'/download?url=' + encodeURIComponent(url)

});

} catch(err){

console.log(err);

res.json({
success:false
});

}

});

});



// DOWNLOAD
app.get('/download', (req, res) => {

const url = req.query.url;

const quality = req.query.quality || '720';

if(!url){
return res.send('No URL');
}

let command = '';


// MP3
if(quality === 'mp3'){

command =
`yt-dlp -x --audio-format mp3 -o "audio.mp3" "${url}"`;

exec(command, (error) => {

if(error){

console.log(error);

return res.send('Download failed');

}

res.download(path.join(__dirname,'audio.mp3'));

});

return;

}



// VIDEO
command =
`yt-dlp -o "video.mp4" "${url}"`;

exec(command, { maxBuffer: 1024 * 1024 * 50 }, (error) => {

if(error){

console.log(error);

return res.send('Download failed');

}

res.download(path.join(__dirname,'video.mp4'), () => {
fs.unlinkSync(path.join(__dirname,'video.mp4'));
});

});

});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.listen(3000, () => {

console.log('Running on http://localhost:3000');

});