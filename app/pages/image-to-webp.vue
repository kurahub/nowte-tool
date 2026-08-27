<template>
  <div>
    <main id="main" class="to-webp">
      <section class="mts">
        <div class="container">
          <h1 class="h1">PNG・JPGをWEBPに変換</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class=" tac">
                PNG・JPG画像をWEBPに変換します。
                <br />
                ファイルを入れたら一発変換・自動ダウンロード。
              </p>
            </div>
          </div>

          <div
            class="drop-zone"
            :class="{ 'drag-active': isDragging }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent="dragoverEvent"
            @dragleave.prevent="dragleaveEvent"
            @drop.prevent="fileDropEvent"
          >
            <div class="overlay-area"></div>

            <p class="drop-zone-text">
              PNG・JPGファイルを選択 or ここにドラッグ&ドロップ
              <br />
              選択すると自動でWEBPに変換・ダウンロードします。
            </p>

            <label for="webp-file" class="select-file">
              ファイルを選択
              <input
                id="webp-file"
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                multiple
                @change="fileChangeEvent"
              />
            </label>
          </div>

          <div class="option-font-size-box mtxs tar">
            WEBP画質
            <input
              v-model="quality"
              class="option-font-size range"
              type="range"
              min="10"
              max="100"
              step="10"
            />
            <span class="range-number tac mtxxs gray">{{ quality }} %</span>
          </div>

          <p v-if="errorMessage" class="gray tac mts">
            {{ errorMessage }}
          </p>

          <div class="mts box bg-gray">
            <p class="mt0"><b>特徴</b></p>
            <ul class="list mtxxs">
              <li>PNG・JPG・JPEGをWEBPに変換できます。</li>
              <li>複数画像をまとめて変換できます。</li>
              <li>ファイルを入れると自動でWEBPをダウンロードします。</li>
              <li>PNGの透過はWEBPでも維持できます。</li>
              <li>画像はサーバーへアップロードしません。</li>
            </ul>
          </div>

          <div class="mts">
            <h2 class="h2">PNG・JPGをWEBPに変換する方法</h2>
            <ol class="list mtxxs">
              <li>必要ならWEBP画質を調整します。</li>
              <li>PNG・JPGを選択、またはドラッグ＆ドロップします。</li>
              <li>WEBPへ変換され、自動でダウンロードされます。</li>
            </ol>
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
  title: 'PNG・JPGをWEBPに変換｜無料オンライン変換 - 一発ツールズ',
  meta: [{
    name: 'description',
    content: 'PNG・JPG・JPEG画像をWEBPへ変換する無料オンラインツールです。複数ファイル対応、アップロード不要。画像を入れるだけでWEBPを自動ダウンロードします。'
  }]
})

const quality = ref(90)
const isDragging = ref(false)
const errorMessage = ref('')

function fileChangeEvent(event) {
  processFiles(event.target?.files)
  if (event.target) event.target.value = ''
}

function fileDropEvent(event) {
  isDragging.value = false
  processFiles(event.dataTransfer?.files)
}

function dragoverEvent(event) {
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
}

function dragleaveEvent(event) {
  if (event.currentTarget?.contains(event.relatedTarget)) return
  isDragging.value = false
}

async function processFiles(fileList) {
  if (!fileList?.length) return

  const targets = Array.from(fileList).filter((file) => {
    const name = file.name.toLowerCase()
    return (
      file.type === 'image/png' ||
      file.type === 'image/jpeg' ||
      name.endsWith('.png') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg')
    )
  })

  if (!targets.length) {
    errorMessage.value = 'PNG・JPGファイルを選択してください。'
    return
  }

  errorMessage.value = ''

  try {
    for (const file of targets) {
      const blob = await convertToWebp(file)
      downloadBlob(blob, file.name)
      await wait(200)
    }
  } catch (error) {
    console.error('[to-webp]', error)
    errorMessage.value = error?.message || 'WEBP変換に失敗しました。'
  }
}

async function convertToWebp(file) {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('Canvasの初期化に失敗しました。')

  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
  ctx.drawImage(image, 0, 0)

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('WEBPの生成に失敗しました。'))
      resolve(blob)
    }, 'image/webp', Number(quality.value) / 100)
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(`${file.name} を読み込めませんでした。`))
    }

    img.src = url
  })
}

function downloadBlob(blob, originalName) {
  const baseName = originalName.replace(/\.[^.]+$/, '')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = `${baseName}.webp`
  document.body.appendChild(a)
  a.click()
  a.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
</script>

<style scoped>
.to-webp .drop-zone {
  position: relative;
  margin-top: 30px;
  padding: 60px 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  transition: 0.2s;
}
.to-webp .drop-zone:hover {
  border-color: #999;
  background: #f7f7f7;
}
.to-webp .drop-zone.drag-active {
  border-color: #777;
  background: #f3f3f3;
}
.to-webp .overlay-area {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
