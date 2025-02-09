const MODEL_PATH = 'https://tfhub.dev/google/tfjs-model/movenet/singlepose/lightning/4'

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
let person = null;

async function predictWebcam(model) {
  const videoTensor = tf.browser.fromPixels(video)

  // Now let's start classifying a frame in the stream.
  const predictions = await model.detect(video)
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
      person = document.createElement('div');
      person.setAttribute('class', 'highlighter');
      person.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
          + predictions[n].bbox[1] + 'px; width: ' 
          + predictions[n].bbox[2] + 'px; height: '
          + predictions[n].bbox[3] + 'px;';

      liveView.appendChild(person);

    }
  }
  
  // Call this function again to keep predicting when the browser is ready.
  window.requestAnimationFrame(predictWebcam.bind(this, model));
}

loadModel()
async function loadModel() {
  const model = await cocoSsd.load()
  const movenet = await tf.loadGraphModel(MODEL_PATH, { fromTFHub: true })
  if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    const constraints = {
      video: true,
      // video: {
      //   width: { ideal: 1280 },
      //   height: { ideal: 720 }
      // }
    };
  
    // Activate the webcam stream.
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam.bind(this, model));

  } else {
    alert('getUserMedia() is not supported by your browser')
  }
}