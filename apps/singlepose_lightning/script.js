const status = document.getElementById('status');
if (status) {
  status.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;
}


const MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4'
const imgEl = document.querySelector('#img')

let movenet = undefined

async function loadAndRunModel() {
    movenet = await tf.loadGraphModel(MODEL_PATH, { fromTFHub: true })

    const imgTensor = tf.browser.fromPixels(imgEl)
    // console.log(imgTensor.shape)

    const cropStartPoint = [15, 170, 0]
    const cropSize = [345, 345, 3]
    const croppedTensor = tf.slice(imgTensor, cropStartPoint, cropSize)
    
    const resizedTensor = tf.image.resizeBilinear(croppedTensor, [192, 192], true).toInt()
    console.log(resizedTensor)

    const tensorOutput = movenet.predict(tf.expandDims(resizedTensor))
    const arrayOutput = await tensorOutput.array()
    console.log(arrayOutput)



}

loadAndRunModel()