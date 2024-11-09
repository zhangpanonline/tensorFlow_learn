/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */
const status = document.getElementById('status');
if (status) {
  status.innerText = 'Loaded TensorFlow.js - version: ' + tf.version.tfjs;
}


const MODEL_PATH = 'https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/SavedModels/sqftToPropertyPrice/model.json'
const local_path = 'localstorage://demo'
let model = undefined

async function loadModel() {

    const local_path_list = await tf.io.listModels()
    if (local_path_list[local_path]) {
      model = await tf.loadLayersModel(local_path)
      console.log('从本地获取模型')
    } else {
      model = await tf.loadLayersModel(MODEL_PATH)
      console.log('从云端获取模型')
    }

    model.summary()

    // 将模型存储到本地
    await model.save(local_path)

    const input = tf.tensor2d([[870]])
    const inputBatch = tf.tensor2d([[500], [1100], [970]])

    const result = model.predict(input)
    const resultBatch = model.predict(inputBatch)

    result.print()
    resultBatch.print()

    input.dispose()
    inputBatch.dispose()
    result.dispose()
    resultBatch.dispose()
    model.dispose()
}
loadModel()

