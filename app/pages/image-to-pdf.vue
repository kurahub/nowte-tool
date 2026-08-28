<template>
  <div><main id="main" class="image-to-pdf"><section class="page-header"><div class="container">
    <div class="h1-sub">＼　一発で！　／</div>
    <h1 class="h1">画像PDF変換</h1>
    <p class="page-description">JPG・PNGなどの画像をPDFへ変換します。<br />複数画像は選択順に1つのPDFへまとめます。</p>
    <div class="drop-zone mt20" :class="{ 'drag-active': isDragging, 'is-processing': isProcessing }" @dragenter.prevent="isDragging = true" @dragover.prevent @dragleave.prevent="leaveDropZone" @drop.prevent="onDrop">
      <div class="drop-zone-text"><b>{{ isProcessing ? 'PDFを作成しています…' : 'ファイルをここにドラッグ&ドロップ' }}</b></div>
      <label v-if="!isProcessing" for="image-pdf-file" class="select-file mt10">ファイルを選択<input id="image-pdf-file" type="file" accept="image/*" multiple @change="onSelect" /></label>
    </div>
    <div class="pdf-settings mt20"><label>ページ余白 <input v-model.number="margin" type="number" min="0" max="200" /> px</label><label><input v-model="fitA4" type="checkbox" /> A4サイズに合わせる</label></div>
    <p v-if="message" :class="['tac','mts',{ 'error-message': hasError, gray: !hasError }]">{{ message }}</p>
    <div class="tool-info-section bg-gray ptm pbm mtm"><h2 class="h2">特徴</h2><ul class="list mtxxs"><li>複数画像を選択順に1つのPDFへ変換します。</li><li>1画像につき1ページで作成します。</li><li>A4へ収める設定とページ余白を指定できます。</li><li>画像はサーバーへアップロードしません。</li></ul></div>
    <div class="tool-info-section bg-gray pbm"><h2 class="h2">画像をPDFにする方法</h2><ul class="list mtxxs"><li>必要なら余白とA4設定を変更します。</li><li>画像を選択、またはドラッグ＆ドロップします。</li><li>PDFが自動でダウンロードされます。</li></ul></div>
  </div></section><Archive /></main></div>
</template>
<script setup>
import { ref } from 'vue'
import { PDFDocument } from 'pdf-lib'
useHead({ title: '一発で画像PDF変換｜PNG・JPG画像をPDF変換する無料オンラインツール', meta: [{ name: 'description', content: 'PNG・JPGなどの画像をPDFへ変換できる無料オンラインツールです。複数画像を1つのPDFにまとめ、アップロード不要で自動ダウンロードします。' }] })
const margin = ref(20); const fitA4 = ref(false); const isDragging = ref(false); const isProcessing = ref(false); const message = ref(''); const hasError = ref(false)
function onSelect(event) { createPdf(event.target?.files); if (event.target) event.target.value = '' }
function onDrop(event) { isDragging.value = false; createPdf(event.dataTransfer?.files) }
function leaveDropZone(event) { if (!event.currentTarget?.contains(event.relatedTarget)) isDragging.value = false }
async function createPdf(fileList) {
  if (!fileList?.length || isProcessing.value) return
  const files = Array.from(fileList).filter((file) => file.type.startsWith('image/'))
  if (!files.length) return showError('画像ファイルを選択してください。')
  isProcessing.value = true; hasError.value = false; message.value = ''
  try {
    const pdf = await PDFDocument.create(); const pageMargin = Math.min(200, Math.max(0, Number(margin.value) || 0))
    for (const file of files) {
      const normalized = await normalizeImage(file); const bytes = await normalized.blob.arrayBuffer(); const embedded = normalized.type === 'image/png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes)
      const pageSize = fitA4.value ? getA4Size(normalized.width, normalized.height) : [normalized.width + pageMargin * 2, normalized.height + pageMargin * 2]
      const availableWidth = pageSize[0] - pageMargin * 2; const availableHeight = pageSize[1] - pageMargin * 2; const scale = Math.min(availableWidth / normalized.width, availableHeight / normalized.height, fitA4.value ? Infinity : 1)
      const width = normalized.width * scale; const height = normalized.height * scale; const page = pdf.addPage(pageSize)
      page.drawImage(embedded, { x: (pageSize[0] - width) / 2, y: (pageSize[1] - height) / 2, width, height })
    }
    downloadBlob(new Blob([await pdf.save()], { type: 'application/pdf' }), files.length === 1 ? `${baseName(files[0].name)}.pdf` : 'images.pdf'); message.value = `${files.length}枚の画像をPDFに変換しました。`
  } catch (error) { console.error('[image-to-pdf]', error); showError('PDFの作成に失敗しました。画像を確認してください。') } finally { isProcessing.value = false }
}
function getA4Size(width, height) { return width > height ? [841.89, 595.28] : [595.28, 841.89] }
function normalizeImage(file) { return new Promise((resolve, reject) => { const url = URL.createObjectURL(file); const image = new Image(); image.onload = () => { const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight; const context = canvas.getContext('2d'); if (!context) return reject(new Error('Canvas error')); context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0); canvas.toBlob((blob) => { URL.revokeObjectURL(url); blob ? resolve({ blob, type: 'image/jpeg', width: canvas.width, height: canvas.height }) : reject(new Error('Image error')) }, 'image/jpeg', 0.95) }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image error')) }; image.src = url }) }
function baseName(name) { return name.replace(/\.[^.]+$/, '') || 'image' }
function downloadBlob(blob, filename) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
function showError(text) { hasError.value = true; message.value = text }
</script>
<style scoped>
.pdf-settings { display: flex; justify-content: flex-end; align-items: center; gap: 30px; }.pdf-settings label { display: flex; align-items: center; gap: 8px; color: #777; }.pdf-settings input[type='number'] { width: 72px; padding: 8px; }.error-message { color: #c33; }@media(max-width:767px){.pdf-settings{align-items:flex-end;flex-wrap:wrap;gap:12px}}
</style>
