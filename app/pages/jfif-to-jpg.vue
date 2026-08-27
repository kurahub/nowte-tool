<template>
  <div>
    <main id="main" class="jfif-converter">
      <section class="mts">
        <div class="container">
          <h1 class="h1">JFIFをJPG・PNGに変換</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="tac">
                拡張子「.jfif」の画像をJPGまたはPNGに変換します。
                <br />
                アップロード不要・ブラウザ内だけで処理します。
              </p>
            </div>
          </div>

          <div
            id="js-dropzone"
            class="drop-zone"
            :class="{ 'drag-active': isDragging }"
            @dragenter.prevent="dropzoneInEvent"
            @dragover.prevent="dragoverEvent"
            @dragleave.prevent="dragleaveEvent"
            @drop.prevent="fileDropEvent"
          >
            <div
              id="js-overlay-area"
              class="overlay-area"
            ></div>

            <p
              id="js-overlay-text"
              class="no-active"
            ></p>

            <p class="drop-zone-text">
              JFIFファイルを選択 or ここにドラッグ&ドロップ
              <br />
              選択すると自動で変換・ダウンロードします。
            </p>

            <label
              id="js-select-file"
              for="file"
              class="select-file"
            >
              ファイルを選択

              <input
                id="file"
                type="file"
                accept=".jfif,image/jpeg"
                multiple
                @change="fileChangeEvent"
              />
            </label>
          </div>

          <div class="mts">
            <p class="gray mtxxs">
              <b>出力形式</b>
            </p>

            <div class="radio-button-group">
              <div class="item">
                <input
                  id="output-jpg"
                  v-model="outputFormat"
                  type="radio"
                  class="radio-button"
                  value="jpg"
                />
                <label for="output-jpg">JPG</label>
              </div>

              <div class="item">
                <input
                  id="output-png"
                  v-model="outputFormat"
                  type="radio"
                  class="radio-button"
                  value="png"
                />
                <label for="output-png">PNG</label>
              </div>
            </div>
          </div>

          <div
            v-if="files.length"
            class="mts"
          >
            <p class="gray mtxxs">
              <b>選択したファイル</b>
            </p>

            <div
              v-for="(item, index) in files"
              :key="item.id"
              class="convert-file-item"
            >
              <div class="convert-file-info">
                <b>{{ item.file.name }}</b>
                <p class="gray fss mt0">
                  {{ formatFileSize(item.file.size) }}
                </p>
              </div>

              <button
                type="button"
                class="convert-remove-button"
                @click="removeFile(index)"
              >
                削除
              </button>
            </div>

            <p
              v-if="errorMessage"
              class="gray tac mts"
            >
              {{ errorMessage }}
            </p>
          </div>

          <div class="mts box bg-gray">
            <p class="mt0">
              <b>特徴</b>
            </p>

            <ul class="list mtxxs">
              <li>JFIFをJPGまたはPNGに変換できます。</li>
              <li>複数ファイルをまとめて変換できます。</li>
              <li>画像はサーバーへアップロードしません。</li>
              <li>ブラウザ内だけで変換処理を行います。</li>
            </ul>
          </div>

          <div class="mts">
            <h2 class="h2">JFIFをJPGに変換する方法</h2>

            <ol class="list mtxxs">
              <li>出力形式で「JPG」または「PNG」を選びます。</li>
              <li>JFIFファイルを選択、またはドラッグ＆ドロップします。</li>
              <li>変換が完了すると自動でダウンロードされます。</li>
            </ol>
          </div>

          <div class="mts">
            <h2 class="h2">JFIFとJPGの違い</h2>

            <p class="gray">
              JFIFはJPEG画像で使われるファイル形式のひとつです。
              このツールでは画像をブラウザで読み込み、JPGまたはPNGとして再出力します。
            </p>
          </div>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

useHead({
  title: '一発でJFIFをJPG・PNGに変換｜無料オンライン画像変換',
  meta: [
    {
      name: 'description',
      content:
        'JFIFをJPGまたはPNGに変換できる無料オンラインツールです。複数ファイル対応、アップロード不要でブラウザ内だけで変換します。'
    }
  ]
})

const files = ref([])
const outputFormat = ref('jpg')
const errorMessage = ref('')
const isDragging = ref(false)

let idCounter = 0

function addFiles(fileList) {
  if (!fileList?.length) return

  errorMessage.value = ''

  const newFiles = Array.from(fileList).filter((file) => {
    const name = file.name.toLowerCase()
    return (
      name.endsWith('.jfif') ||
      file.type === 'image/jpeg'
    )
  })

  if (!newFiles.length) {
    errorMessage.value = 'JFIFファイルを選択してください。'
    return
  }

  const addedItems = newFiles.map((file) => ({
    id: ++idCounter,
    file
  }))

  files.value.push(...addedItems)

  // ファイル選択・ドロップ後に自動変換＆ダウンロード
  convertItems(addedItems)
}

function fileChangeEvent(event) {
  addFiles(event.target?.files)

  if (event.target) {
    event.target.value = ''
  }
}

function fileDropEvent(event) {
  isDragging.value = false
  addFiles(event.dataTransfer?.files)
}

function dropzoneInEvent() {
  isDragging.value = true
}

function dragleaveEvent(event) {
  if (event.currentTarget?.contains(event.relatedTarget)) {
    return
  }

  isDragging.value = false
}

function dragoverEvent(event) {
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

function removeFile(index) {
  files.value.splice(index, 1)
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return ''

  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function convertItems(items) {
  if (!items?.length) return

  errorMessage.value = ''

  try {
    for (const item of items) {
      const blob = await convertImage(item.file, outputFormat.value)
      downloadBlob(blob, item.file.name, outputFormat.value)

      // 複数ファイルの連続ダウンロードを安定させる
      await wait(200)
    }
  } catch (error) {
    console.error('[jfif-converter]', error)
    errorMessage.value =
      error?.message || '画像の変換に失敗しました。'
  }
}

async function convertImage(file, format) {
  const image = await loadImage(file)

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvasの初期化に失敗しました。')
  }

  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height

  // JPEGには透過がないため白背景にする
  if (format === 'jpg') {
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  context.drawImage(image, 0, 0)

  const mimeType =
    format === 'png'
      ? 'image/png'
      : 'image/jpeg'

  const quality =
    format === 'jpg'
      ? 0.95
      : undefined

  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('画像の変換に失敗しました。'))
          return
        }

        resolve(blob)
      },
      mimeType,
      quality
    )
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = window.URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      window.URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      window.URL.revokeObjectURL(url)
      reject(
        new Error(`${file.name} を画像として読み込めませんでした。`)
      )
    }

    image.src = url
  })
}

function downloadBlob(blob, originalName, format) {
  const baseName = originalName.replace(/\.[^.]+$/, '')
  const extension = format === 'png' ? 'png' : 'jpg'

  const url = window.URL.createObjectURL(blob)
  const download = document.createElement('a')

  download.href = url
  download.download = `${baseName}.${extension}`

  document.body.appendChild(download)
  download.click()
  download.remove()

  setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 1000)
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
</script>

<style scoped>
.jfif-converter .drop-zone {
  position: relative;
  margin-top: 30px;
  padding: 60px 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  transition: 0.2s;
}

.jfif-converter .drop-zone:hover {
  border-color: #999;
  background: #f7f7f7;
}

.jfif-converter .drop-zone.drag-active {
  border-color: #777;
  background: #f3f3f3;
}

.jfif-converter .overlay-area {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.jfif-converter .convert-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  margin-top: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.jfif-converter .convert-file-info {
  min-width: 0;
  word-break: break-all;
}

.jfif-converter .convert-remove-button {
  flex-shrink: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  background: #fff;
  cursor: pointer;
}

@media (max-width: 600px) {
  .jfif-converter .drop-zone {
    padding: 45px 16px;
  }
}
</style>
