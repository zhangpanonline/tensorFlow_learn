import * as tf from '@tensorflow/tfjs';
import { TRAINING_DATA } from 'https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/TrainingData/real-estate-data.js';

const { inputs: INPUTS, outputs: OUTPUTS  } = TRAINING_DATA

tf.util.shuffleCombo(INPUTS, OUTPUTS)

const INPUTS_TENSOR = tf.tensor2d(INPUTS)
const OUTPUTS_TENSOR = tf.tensor1d(OUTPUTS)

