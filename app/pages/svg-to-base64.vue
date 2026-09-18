<template>
  <div>
    <main id="main" class="svg-to-base64">
      <section class="page-header">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">SVG Base64変換</h1>
          <p class="page-description">
            SVGファイルを圧縮し、CSSのbackground-imageで使えるBase64形式に変換します。<br />
            ファイルはアップロードせず、ブラウザ内だけで処理します。
          </p>

          <div
            class="drop-zone mt20"
            :class="{ 'drag-active': isDragging, 'is-processing': isProcessing }"
            @dragenter.prevent="isDragging = true"
            @dragover.prevent
            @dragleave.prevent="leaveDropZone"
            @drop.prevent="onDrop"
          >
            <div class="drop-zone-text">
              <b>{{ isProcessing ? 'SVGを変換しています…' : 'ファイルをここにドラッグ&ドロップ' }}</b>
            </div>
            <label for="svg-file" class="select-file mt10">
              ファイルを選択
              <input
                id="svg-file"
                type="file"
                accept=".svg,image/svg+xml"
                :disabled="isProcessing"
                @change="onSelect"
              />
            </label>
          </div>

          <div class="settings mt20">
            <label class="setting-item">
              <input v-model="shouldOptimize" type="checkbox" />
              SVGを圧縮する
            </label>
          </div>

          <p v-if="errorMessage" class="error-message mt20">{{ errorMessage }}</p>

          <section v-if="cssOutput" class="result-section mtm">
            <h2 class="h2">変換結果</h2>

            <div class="result-summary mtxxs">
              <span>{{ fileName }}</span>
              <span>元サイズ {{ formatBytes(originalSize) }}</span>
              <span>SVG {{ formatBytes(optimizedSize) }}</span>
              <span>CSS {{ formatBytes(outputSize) }}</span>
            </div>

            <div class="preview-box mt20" :style="{ backgroundImage: dataUrl }" aria-label="変換したSVGのプレビュー"></div>

            <div class="result-header mt20">
              <label for="css-output">CSS</label>
              <button type="button" class="copy-button" @click="copyOutput">
                {{ copied ? 'コピーしました' : 'コピー' }}
              </button>
            </div>
            <textarea id="css-output" ref="outputArea" :value="cssOutput" class="code-textarea mt10" rows="8" readonly></textarea>
          </section>
        </div>
      </section>

      <section class="bg-gray ptm pbm mtm">
        <div class="container">
          <h2 class="h2">使い方</h2>
          <ul class="list mtxxs">
            <li>SVGファイルを選択、またはドラッグ＆ドロップします。</li>
            <li>SVGを圧縮してBase64へ変換します。</li>
            <li>生成されたbackground-imageをコピーしてCSSへ貼り付けます。</li>
          </ul>

          <h2 class="h2 mts">SVGの圧縮について</h2>
          <p class="mtxxs">SVGOMGでも使われているSVG最適化ツール「SVGO」を利用し、見た目を保ちながら不要な情報や冗長な記述を削減します。</p>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

useHead({
  title: '一発でSVGをCSSで使うBase64に変換｜PNG・JPG対応の無料オンラインツール',
  meta: [{
    name: 'description',
    content: 'SVGファイルを圧縮し、CSSのbackground-imageで使えるBase64形式へ変換する無料オンラインツールです。アップロード不要でブラウザ内だけで処理します。'
  }]
})

const shouldOptimize = ref(true)
const isDragging = ref(false)
const isProcessing = ref(false)
const errorMessage = ref('')
const cssOutput = ref('')
const dataUrl = ref('')
const fileName = ref('')
const originalSize = ref(0)
const optimizedSize = ref(0)
const outputSize = ref(0)
const copied = ref(false)
const outputArea = ref(null)

function leaveDropZone(event) {
  if (event.currentTarget?.contains(event.relatedTarget)) return
  isDragging.value = false
}

function onDrop(event) {
  isDragging.value = false
  convertFile(event.dataTransfer?.files)
}

function onSelect(event) {
  convertFile(event.target?.files)
  event.target.value = ''
}

async function convertFile(files) {
  if (!files?.length || isProcessing.value) return

  const file = files[0]
  if (!/\.svg$/i.test(file.name) && file.type !== 'image/svg+xml') {
    showError('SVGファイルを選択してください。')
    return
  }

  isProcessing.value = true
  errorMessage.value = ''
  cssOutput.value = ''
  dataUrl.value = ''
  copied.value = false

  try {
    const source = await file.text()
    validateSvg(source)

    let svg = source.trim()
    if (shouldOptimize.value) {
      const { optimize } = await import('svgo/browser')
      svg = optimize(source, {
          multipass: true,
          plugins: [
            'preset-default',
            'removeScripts'
          ]
        }).data
    }

    const encoded = encodeBase64(svg)
    dataUrl.value = `url("data:image/svg+xml;base64,${encoded}")`
    cssOutput.value = `background-image: ${dataUrl.value};`
    fileName.value = file.name
    originalSize.value = new Blob([source]).size
    optimizedSize.value = new Blob([svg]).size
    outputSize.value = new Blob([cssOutput.value]).size
  } catch (error) {
    console.error('[svg-to-base64]', error)
    showError('SVGの変換に失敗しました。ファイルの内容を確認してください。')
  } finally {
    isProcessing.value = false
  }
}

function validateSvg(source) {
  const documentNode = new DOMParser().parseFromString(source, 'image/svg+xml')
  if (documentNode.querySelector('parsererror') || documentNode.documentElement.localName !== 'svg') {
    throw new Error('Invalid SVG')
  }
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value)
  const chunkSize = 0x8000
  let binary = ''
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

async function copyOutput() {
  if (!cssOutput.value) return
  try {
    await navigator.clipboard.writeText(cssOutput.value)
  } catch {
    outputArea.value?.select()
    document.execCommand('copy')
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

function showError(message) {
  errorMessage.value = message
  cssOutput.value = ''
  dataUrl.value = ''
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}
</script>

<style scoped>
.svg-to-base64 .drop-zone.is-processing { pointer-events: none; opacity: .65; }
.settings { display: flex; justify-content: flex-end; align-items: center; }
.setting-item { display: inline-flex; align-items: center; gap: 8px; color: #555; cursor: pointer; }
.error-message { color: #c33; text-align: center; }
.result-summary { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px 18px; color: #777; font-size: 13px; }
.result-summary span:first-child { margin-right: auto; color: #333; font-weight: bold; }
.preview-box { min-height: 220px; border: 1px solid #ddd; border-radius: 8px; background-color: #f7f7f7; background-position: center; background-repeat: no-repeat; background-size: contain; }
.result-header { display: flex; align-items: center; justify-content: space-between; color: #777; }
.copy-button { padding: 8px 18px; border: 0; border-radius: 4px; background: #1aa1ff; color: #fff; cursor: pointer; }
.code-textarea { box-sizing: border-box; width: 100%; padding: 16px; border: 1px solid #ccc; border-radius: 6px; font-family: Consolas, Monaco, monospace; line-height: 1.6; resize: vertical; }
@media (max-width: 767px) { .result-summary { justify-content: flex-start; } .result-summary span:first-child { width: 100%; margin-right: 0; } }
</style>
