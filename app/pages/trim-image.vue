<template>
  <div>
    <main id="main" class="trim-image">
      <section class="page-header">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">画像の余白を削除</h1>
          <p class="page-description">
            画像の周囲にある単色・透明の余白だけを自動でトリミングします。<br />
            画像はアップロードせず、ブラウザ内だけで処理します。
          </p>

          <div
            class="drop-zone mt20"
            :class="{ 'drag-active': isDragging, 'is-processing': isProcessing }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent
            @dragleave.prevent="leaveDropZone"
            @drop.prevent="onDrop"
          >
            <div class="drop-zone-text"><b>{{ isProcessing ? '余白を確認しています…' : 'ファイルをここにドラッグ&ドロップ' }}</b></div>
            <label for="trim-image-file" class="select-file mt10">
              ファイルを選択
              <input id="trim-image-file" type="file" accept="image/png,image/jpeg,image/webp" multiple :disabled="isProcessing" @change="onSelect" />
            </label>
          </div>

          <div class="trim-settings mt20">
            <label>出力形式
              <select v-model="outputFormat" @change="reprocessFiles">
                <option value="original">元の形式</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPG</option>
              </select>
            </label>
            <div class="right-settings">
              <label>判定の許容値
                <input v-model.number="tolerance" type="number" min="0" max="100" @change="reprocessFiles" />
              </label>
              <label>残す余白
                <input v-model.number="padding" type="number" min="0" max="1000" @change="reprocessFiles" /> px
              </label>
            </div>
          </div>

          <p v-if="errorMessage" class="error-message mts">{{ errorMessage }}</p>

          <section v-if="results.length" class="result-section mtm">
            <h2 class="h2">トリミング結果</h2>
            <div class="result-list mt20">
              <article v-for="result in results" :key="result.id" class="result-card">
                <div class="preview-box">
                  <img :src="result.url" :alt="`${result.name}のトリミング結果`" />
                </div>
                <div class="result-details">
                  <strong>{{ result.name }}</strong>
                  <span>{{ result.originalWidth }} × {{ result.originalHeight }} → {{ result.width }} × {{ result.height }} px</span>
                  <span>{{ result.message }}</span>
                </div>
                <a class="download-button" :href="result.url" :download="result.downloadName">ダウンロード</a>
              </article>
            </div>
          </section>

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <h2 class="h2">特徴</h2>
            <ul class="list mtxxs">
              <li>画像の四隅から背景色を判定し、周囲の余白を削除します。</li>
              <li>白以外の単色背景や透明な余白にも対応します。</li>
              <li>複数のPNG・JPG・WEBP画像をまとめて処理し、自動でダウンロードします。</li>
              <li>画像はサーバーへアップロードしません。</li>
            </ul>
          </div>
          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">画像の余白を削除する方法</h2>
            <ol class="list mtxxs">
              <li>画像を選択、またはドラッグ＆ドロップします。</li>
              <li>必要なら「判定の許容値」と「残す余白」を調整します。</li>
              <li>処理が終わると、元と同じファイル名で自動ダウンロードされます。</li>
            </ol>
          </div>
        </div>
      </section>
      <Archive />
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

useHead({
  title: '一発で画像の余白を削除・自動トリミング｜無料オンラインツール',
  meta: [{
    name: 'description',
    content: 'PNG・JPG・WEBP画像の周囲にある白色・単色・透明の余白を自動で削除する無料オンラインツールです。複数画像に対応し、ブラウザ内だけで処理します。'
  }]
})

const tolerance = ref(10)
const padding = ref(0)
const outputFormat = ref('original')
const isDragging = ref(false)
const isProcessing = ref(false)
const errorMessage = ref('')
const sourceFiles = ref([])
const results = ref([])

function onSelect(event) {
  processFiles(event.target?.files)
  if (event.target) event.target.value = ''
}

function onDrop(event) {
  isDragging.value = false
  processFiles(event.dataTransfer?.files)
}

function leaveDropZone(event) {
  if (!event.currentTarget?.contains(event.relatedTarget)) isDragging.value = false
}

async function processFiles(fileList) {
  if (!fileList?.length || isProcessing.value) return
  const files = Array.from(fileList).filter((file) => file.type.startsWith('image/') && /\.(png|jpe?g|webp)$/i.test(file.name))
  if (!files.length) {
    errorMessage.value = 'PNG・JPG・WEBP画像を選択してください。'
    return
  }
  sourceFiles.value = files
  await createResults(files, true)
}

async function reprocessFiles() {
  if (sourceFiles.value.length && !isProcessing.value) await createResults(sourceFiles.value, false)
}

async function createResults(files, shouldDownload) {
  isProcessing.value = true
  errorMessage.value = ''
  clearResults()
  try {
    const nextResults = []
    for (const [index, file] of files.entries()) nextResults.push(await trimFile(file, index))
    results.value = nextResults
    if (shouldDownload) {
      for (const result of nextResults) {
        downloadResult(result)
        await wait(200)
      }
    }
  } catch (error) {
    console.error('[trim-image]', error)
    clearResults()
    errorMessage.value = error?.message || '画像のトリミングに失敗しました。'
  } finally {
    isProcessing.value = false
  }
}

async function trimFile(file, index) {
  const image = await loadImage(file)
  const source = document.createElement('canvas')
  source.width = image.naturalWidth || image.width
  source.height = image.naturalHeight || image.height
  const context = source.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('画像を処理できませんでした。')
  context.drawImage(image, 0, 0)

  const pixels = context.getImageData(0, 0, source.width, source.height).data
  const background = getBackgroundColor(pixels, source.width, source.height)
  const bounds = findContentBounds(pixels, source.width, source.height, background, normalize(tolerance.value, 0, 100))
  const extra = normalize(padding.value, 0, 1000)
  const left = Math.max(0, bounds.left - extra)
  const top = Math.max(0, bounds.top - extra)
  const right = Math.min(source.width - 1, bounds.right + extra)
  const bottom = Math.min(source.height - 1, bounds.bottom + extra)
  const width = right - left + 1
  const height = bottom - top + 1

  const output = document.createElement('canvas')
  output.width = width
  output.height = height
  const outputContext = output.getContext('2d')
  if (!outputContext) throw new Error('画像を生成できませんでした。')
  const format = outputFormat.value === 'original' ? getOriginalFormat(file) : outputFormat.value
  if (format === 'jpeg') {
    outputContext.fillStyle = '#ffffff'
    outputContext.fillRect(0, 0, width, height)
  }
  outputContext.drawImage(source, left, top, width, height, 0, 0, width, height)
  const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
  const blob = await canvasToBlob(output, mimeType, 0.92)
  const extension = format === 'jpeg' ? getJpegExtension(file) : format
  const baseName = file.name.replace(/\.[^.]+$/, '')
  const removed = width !== source.width || height !== source.height

  return {
    id: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    url: URL.createObjectURL(blob),
    downloadName: outputFormat.value === 'original' ? file.name : `${baseName}.${extension}`,
    originalWidth: source.width,
    originalHeight: source.height,
    width,
    height,
    message: removed ? `上下左右から余白を削除しました` : '削除できる余白は見つかりませんでした'
  }
}

function getOriginalFormat(file) {
  if (file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)) return 'jpeg'
  if (file.type === 'image/webp' || /\.webp$/i.test(file.name)) return 'webp'
  return 'png'
}

function getJpegExtension(file) {
  return outputFormat.value === 'original' && /\.jpeg$/i.test(file.name) ? 'jpeg' : 'jpg'
}

function downloadResult(result) {
  const link = document.createElement('a')
  link.href = result.url
  link.download = result.downloadName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function getBackgroundColor(data, width, height) {
  const positions = [0, (width - 1) * 4, (height - 1) * width * 4, (height * width - 1) * 4]
  const colors = positions.map((position) => [data[position], data[position + 1], data[position + 2], data[position + 3]])
  return colors.reduce((best, color) => {
    const score = colors.reduce((sum, other) => sum + colorDistance(color, other), 0)
    return score < best.score ? { color, score } : best
  }, { color: colors[0], score: Infinity }).color
}

function findContentBounds(data, width, height, background, allowedDifference) {
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  const threshold = allowedDifference * 4.42

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const position = (y * width + x) * 4
      const color = [data[position], data[position + 1], data[position + 2], data[position + 3]]
      if (colorDistance(color, background) <= threshold) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      if (y > bottom) bottom = y
    }
  }

  if (right < 0) return { left: 0, top: 0, right: width - 1, bottom: height - 1 }
  return { left, top, right, bottom }
}

function colorDistance(first, second) {
  return Math.sqrt(first.reduce((sum, value, index) => sum + ((value - second[index]) ** 2), 0))
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`${file.name}を読み込めませんでした。`)) }
    image.src = url
  })
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('画像を生成できませんでした。')), type, quality))
}

function normalize(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(Number(value) || 0)))
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

function clearResults() {
  results.value.forEach((result) => URL.revokeObjectURL(result.url))
  results.value = []
}

onBeforeUnmount(clearResults)
</script>

<style scoped>
.trim-image .drop-zone.is-processing { pointer-events: none; opacity: .65; }
.trim-settings { display: flex; align-items: center; justify-content: space-between; gap: 24px; white-space: nowrap; }
.trim-settings label, .right-settings { display: flex; align-items: center; gap: 8px; color: #777; }
.right-settings { justify-content: flex-end; gap: 16px; }
.trim-settings input { width: 72px; padding: 8px; }
.trim-settings select { min-width: 90px; padding: 8px; }
.error-message { color: #c33; text-align: center; }
.result-list { display: grid; gap: 14px; }
.result-card { display: grid; grid-template-columns: 140px minmax(0, 1fr) auto; align-items: center; gap: 18px; padding: 14px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
.preview-box { display: flex; align-items: center; justify-content: center; height: 100px; overflow: hidden; border-radius: 5px; background-color: #eee; background-image: linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%); background-position: 0 0, 0 8px, 8px -8px, -8px 0; background-size: 16px 16px; }
.preview-box img { display: block; max-width: 100%; max-height: 100%; }
.result-details { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
.result-details strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.result-details span { color: #777; font-size: 13px; }
.download-button { padding: 10px 18px; border-radius: 4px; background: #1aa1ff; color: #fff; text-decoration: none; white-space: nowrap; }
@media (max-width: 767px) {
  .trim-settings { overflow-x: auto; padding-bottom: 8px; }
  .right-settings { margin-left: auto; }
  .result-card { grid-template-columns: 90px minmax(0, 1fr); gap: 12px; }
  .preview-box { height: 80px; }
  .download-button { grid-column: 1 / -1; text-align: center; }
}
</style>
