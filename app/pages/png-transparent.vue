<template>
  <div>
    <main id="main" class="png-transparent">
      <section class="mts">
        <div class="container">
          <h1 class="h1">PNGの白背景を透過</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="gray tac">
                PNG画像の白背景を透明にします。
                <br />
                ファイルを入れたら一発透過・自動ダウンロード。
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
              PNGファイルを選択 or ここにドラッグ&ドロップ
              <br />
              選択すると自動で透過・ダウンロードします。
            </p>

            <label for="png-file" class="select-file">
              ファイルを選択
              <input
                id="png-file"
                type="file"
                accept=".png,image/png"
                multiple
                @change="fileChangeEvent"
              />
            </label>
          </div>

          <div class="option-font-size-box mtxs tar">
            白判定の強さ
            <input
              v-model="tolerance"
              class="option-font-size range"
              type="range"
              min="0"
              max="100"
              step="5"
            />
            <span class="range-number tac mtxxs gray">{{ tolerance }}</span>
          </div>

          <p v-if="errorMessage" class="gray tac mts">
            {{ errorMessage }}
          </p>

          <div class="mts box bg-gray">
            <p class="mt0"><b>特徴</b></p>
            <ul class="list mtxxs">
              <li>白色・白に近い背景を透明にします。</li>
              <li>複数PNGをまとめて処理できます。</li>
              <li>ファイルを入れると自動でPNGをダウンロードします。</li>
              <li>画像はサーバーへアップロードしません。</li>
            </ul>
          </div>

          <div class="mts">
            <h2 class="h2">PNG背景を透過する方法</h2>
            <ol class="list mtxxs">
              <li>必要なら「白判定の強さ」を調整します。</li>
              <li>PNG画像を選択、またはドラッグ＆ドロップします。</li>
              <li>白背景を透過したPNGが自動でダウンロードされます。</li>
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
  title: 'PNGの白背景を透過｜無料オンライン透過ツール - 一発ツールズ',
  meta: [{
    name: 'description',
    content: 'PNG画像の白背景を透明にする無料オンラインツールです。アップロード不要。PNGを入れるだけで白背景を透過して自動ダウンロードします。'
  }]
})

const tolerance = ref(20)
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
    return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')
  })

  if (!targets.length) {
    errorMessage.value = 'PNGファイルを選択してください。'
    return
  }

  errorMessage.value = ''

  try {
    for (const file of targets) {
      const blob = await makeWhiteTransparent(file)
      downloadBlob(blob, file.name)
      await wait(200)
    }
  } catch (error) {
    console.error('[png-transparent]', error)
    errorMessage.value = error?.message || '透過処理に失敗しました。'
  }
}

async function makeWhiteTransparent(file) {
  const image = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  if (!ctx) throw new Error('Canvasの初期化に失敗しました。')

  canvas.width = image.naturalWidth || image.width
  canvas.height = image.naturalHeight || image.height
  ctx.drawImage(image, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // 0 -> RGB255だけ、100 -> RGB155以上まで透過
  const threshold = 255 - Number(tolerance.value)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0
    }
  }

  ctx.putImageData(imageData, 0, 0)

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('PNGの生成に失敗しました。'))
      resolve(blob)
    }, 'image/png')
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
  a.download = `${baseName}_transparent.png`
  document.body.appendChild(a)
  a.click()
  a.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
</script>

<style scoped>
.png-transparent .drop-zone {
  position: relative;
  margin-top: 30px;
  padding: 60px 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  transition: 0.2s;
}
.png-transparent .drop-zone:hover {
  border-color: #999;
  background: #f7f7f7;
}
.png-transparent .drop-zone.drag-active {
  border-color: #777;
  background: #f3f3f3;
}
.png-transparent .overlay-area {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
