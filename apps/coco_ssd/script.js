const MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4'

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
let person = null;
const dotList = []
const vSize = 480

async function predictWebcam(model, movenet) {
  const videoTensor = tf.browser.fromPixels(video)

  const predictions = await model.detect(videoTensor)
  try {
    if (person) {
      liveView.removeChild(person)
    }
  } catch (error) {
    console.error(error)
  }
  // predictions = [
  //   {
  //       "bbox": [
  //           4.531345367431641,
  //           74.66769218444824,
  //           551.063289642334,
  //           401.71165466308594
  //       ],
  //       "class": "person",
  //       "score": 0.7994094491004944
  //   }
  // ]
  for (let n = 0; n < predictions.length; n++) {
    // If we are over 66% sure we are sure we classified it right, draw it!
    if (predictions[n].score > 0.66 && predictions[n].class === 'person') {
      // person = document.createElement('div');
      // person.setAttribute('class', 'highlighter');

      // const x = predictions[n].bbox[0]
      // const y = predictions[n].bbox[1]
      // const width = predictions[n].bbox[2]
      // const height = predictions[n].bbox[3]
      // person.style = `left: ${x}px; top: ${y}px; width: ${width}px; height: ${height}px;`;

      // liveView.appendChild(person);

      const resizedTensor = tf.image.resizeBilinear(videoTensor, [192, 192], true).toInt();
      const tensorOutput = await movenet.predict(tf.expandDims(resizedTensor))
      resizedTensor.dispose()
      const result = await tensorOutput.array()
      tensorOutput.dispose()
      const list = result.flat(2).map(([y, x, score]) => ([y * vSize, x * vSize, score]))
      dotList.forEach(el => liveView.removeChild(el))
      dotList.length = 0
      list.forEach(([y, x, score]) => {
        if (score < 0.6) return false
        const dot = document.createElement('div')
        dot.setAttribute('class', 'dot')
        dot.style = `left: ${x - 5}px; top: ${y - 5}px`
        liveView.appendChild(dot)
        dotList.push(dot)
      })

    }
  }
  videoTensor.dispose()
  window.requestAnimationFrame(predictWebcam.bind(this, model, movenet));
}

loadModel()
async function loadModel() {
  const model = await cocoSsd.load()
  const movenet = await tf.loadGraphModel(MODEL_PATH, { fromTFHub: true })
  if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    const constraints = {
      video: true,
      video: {
        width: { ideal: vSize },
        height: { ideal: vSize }
      }
    };
  
    // Activate the webcam stream.
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam.bind(this, model, movenet));

  } else {
    alert('getUserMedia() is not supported by your browser')
  }
}