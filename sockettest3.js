const tf = require('@tensorflow/tfjs-node-gpu');
const app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server); 
const {Image, createCanvas} = require('canvas')
const canvas = createCanvas(28, 28); 
const ctx = canvas.getContext('2d'); 
var fs = require('fs');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index4.html');
});

async function loadModel() {
    const model = await tf.loadLayersModel('file://./jstestmodel/model.json');
    return model;
}

io.on('connection', function(socket) {
    socket.on("upload", (file, callback) => {
        console.log(file);

        fs.writeFile(__dirname +"/uploads/" + file.Name, file.Data, (err) => {
            loadImage(file).then(
                img => prediction(img).then(
                    result => socket.emit("result", result)
                )
            )
        });
    });
});

async function loadImage(filepath) {
    var img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.onerror = err => {throw err}; 
    img.src = filepath.Data; 
    image = tf.browser.fromPixels(canvas).mean(2)
        .toFloat()
        .expandDims(0) 
        .expandDims(-1) 
    return new Promise(resolve => { 
        resolve(image);
    });
}

async function prediction(imgFile) {
    const model = await loadModel();
    const result = await model.predict(imgFile).as1D().argMax().data();
    const arr = Array.from(result);
    return new Promise(resolve => {
        resolve(arr);
    });
}

server.listen(3000, function() {
    console.log('Socket IO server listening on port 3000');
});
