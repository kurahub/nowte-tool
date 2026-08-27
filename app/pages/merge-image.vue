<template>
  <div>
    <main id="main" class="merge-image">
      <section class="page-header">
        <div class="container">
          <h1 class="h1">画像結合｜複数画像を一枚に連結</h1>
          <p class="page-description">複数の画像を縦または横に結合します。<br />画像を入れたら一発結合・自動ダウンロード。</p>

          <div class="drop-zone mt20" :class="{ 'drag-active': isDragging, 'is-processing': isProcessing }" @dragenter.prevent="isDragging = true" @dragover.prevent @dragleave.prevent="leaveDropZone" @drop.prevent="onDrop">
            <div class="drop-zone-text"><b>{{ isProcessing ? '画像を結合しています…' : 'ファイルをここにドラッグ&ドロップ' }}</b></div>
            <label v-if="!isProcessing" for="merge-image-file" class="select-file mt10">ファイルを選択<input id="merge-image-file" type="file" accept="image/*" multiple @change="onSelect" /></label>
          </div>

          <div class="merge-settings mt20">
            <label class="output-setting">出力形式<select v-model="outputFormat"><option value="png">PNG</option><option value="pdf">PDF</option></select></label>
            <div class="right-settings">
              <label>並び方<select v-model="direction"><option value="vertical">縦に結合</option><option value="horizontal">横に結合</option></select></label>
              <label>画像間隔<input v-model.number="gap" type="number" min="0" max="1000" /> px</label>
              <label>余白<input v-model.number="margin" type="number" min="0" max="1000" /> px</label>
            </div>
          </div>
          <p v-if="message" :class="['tac', 'mts', { 'error-message': hasError, gray: !hasError }]">{{ message }}</p>

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <h2 class="h2">特徴</h2>
            <ul class="list mtxxs"><li>複数画像を縦または横に一枚へ結合できます。</li><li>画像間隔と周囲の余白をpxで指定できます。</li><li>PNGまたはPDFで自動ダウンロードします。</li><li>画像はサーバーへアップロードしません。</li></ul>
          </div>
          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">画像を結合する方法</h2>
            <ul class="list mtxxs"><li>並び方、出力形式、余白を設定します。</li><li>2枚以上の画像をまとめて選択します。</li><li>結合結果が自動でダウンロードされます。</li></ul>
          </div>
        </div>
      </section>
      <Archive />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'

useHead({ title: '画像結合｜複数画像を一枚・PDFに結合 - 一発ツールズ', meta: [{ name: 'description', content: '複数画像を縦・横に結合し、PNGまたはPDFで保存できる無料オンラインツールです。余白と画像間隔をpxで指定できます。' }] })

const direction = ref('vertical')
const outputFormat = ref('png')
const gap = ref(0)
const margin = ref(0)
const isDragging = ref(false)
const isProcessing = ref(false)
const message = ref('')
const hasError = ref(false)

function onSelect(event) { processFiles(event.target?.files); if (event.target) event.target.value = '' }
function onDrop(event) { isDragging.value = false; processFiles(event.dataTransfer?.files) }
function leaveDropZone(event) { if (!event.currentTarget?.contains(event.relatedTarget)) isDragging.value = false }

async function processFiles(fileList) {
  if (isProcessing.value || !fileList?.length) return
  const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
  if (files.length < 2) return showError('画像を2枚以上選択してください。')

  isProcessing.value = true
  message.value = ''
  hasError.value = false
  try {
    const images = await Promise.all(files.map(loadImage))
    const values = normalizeSettings()
    const contentWidth = direction.value === 'horizontal' ? images.reduce((sum, image) => sum + image.width, 0) + values.gap * (images.length - 1) : Math.max(...images.map((image) => image.width))
    const contentHeight = direction.value === 'vertical' ? images.reduce((sum, image) => sum + image.height, 0) + values.gap * (images.length - 1) : Math.max(...images.map((image) => image.height))
    const canvas = document.createElement('canvas')
    canvas.width = contentWidth + values.margin * 2
    canvas.height = contentHeight + values.margin * 2
    if (!canvas.width || !canvas.height || canvas.width > 32767 || canvas.height > 32767) throw new Error('画像サイズが大きすぎます。画像枚数または余白を減らしてください。')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('画像を結合できませんでした。')
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, canvas.width, canvas.height)
    let x = values.margin; let y = values.margin
    images.forEach((image) => { context.drawImage(image, x, y); if (direction.value === 'vertical') y += image.height + values.gap; else x += image.width + values.gap })
    const pngBlob = await canvasToBlob(canvas, 'image/png')
    if (outputFormat.value === 'pdf') downloadBlob(await createPdf(pngBlob, canvas.width, canvas.height), 'merged-images.pdf')
    else downloadBlob(pngBlob, 'merged-images.png')
    message.value = `${files.length}枚の画像を結合しました。`
  } catch (error) { console.error('[merge-image]', error); showError(error?.message || '画像の結合に失敗しました。') }
  finally { isProcessing.value = false }
}

function normalizeSettings() { return { margin: clamp(margin.value), gap: clamp(gap.value) } }
function clamp(value) { return Math.min(1000, Math.max(0, Math.round(Number(value) || 0))) }
function loadImage(file) { return new Promise((resolve, reject) => { const url = URL.createObjectURL(file); const image = new Image(); image.onload = () => { URL.revokeObjectURL(url); resolve(image) }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error(`${file.name}を読み込めませんでした。`)) }; image.src = url }) }
function canvasToBlob(canvas, type) { return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('画像を生成できませんでした。')), type)) }
async function createPdf(pngBlob, width, height) { const pdf = await PDFDocument.create(); const image = await pdf.embedPng(await pngBlob.arrayBuffer()); const page = pdf.addPage([width, height]); page.drawImage(image, { x: 0, y: 0, width, height }); return new Blob([await pdf.save()], { type: 'application/pdf' }) }
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
function showError(text) { hasError.value = true; message.value = text }
</script>

<style scoped>
.merge-settings { display: flex; align-items: center; justify-content: space-between; gap: 24px; white-space: nowrap; }
.merge-settings label, .right-settings { display: flex; align-items: center; gap: 8px; color: #777; }
.right-settings { justify-content: flex-end; gap: 16px; }
.merge-settings input { width: 72px; padding: 8px; }
.merge-settings select { min-width: 120px; padding: 8px; }
.error-message { color: #c33; }
@media (max-width: 767px) { .merge-settings { overflow-x: auto; padding-bottom: 8px; }.right-settings { margin-left: auto; } }
</style>
