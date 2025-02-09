const MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4'

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
let person = null;
const vSize = 720

async function predictWebcam(model, movenet) {
  const videoFrameTensor = tf.browser.fromPixels(video)
  // console.log(videoFrameTensor)

  // Now let's start classifying a frame in the stream.
  const predictions = await model.detect(video) // TODO
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
      const x = predictions[n].bbox[0]
      const y = predictions[n].bbox[1]
      const width = predictions[n].bbox[2]
      const height = predictions[n].bbox[3]
      person = document.createElement('div');
      person.setAttribute('class', 'highlighter');
      person.style = `left: ${x}px; top: ${y}px; widht: ${width}px; height: ${height}px;`;
      liveView.appendChild(person);
      // console.log(predictions[n].bbox)
      // const size = width >= height ? width : height
      // 裁剪后的张量
      // const croppedTensor = tf.slice(videoFrameTensor, [y, x, 0], [size, size, 3])
      // 线性缩放图像
      // const resizedTensor = tf.image.resizeBilinear(videoFrameTensor, [192, 192], true).toInt()

      // console.log(resizedTensor)
    }
  }
  // Call this function again to keep predicting when the browser is ready.
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
        width: { ideal: 720 },
        height: { ideal: 480 }
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