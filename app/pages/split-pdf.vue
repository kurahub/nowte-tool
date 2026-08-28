<template>
  <div>
    <main id="main" class="split-pdf">
      <section class="page-header">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">PDF分割</h1>
          <p class="page-description">
            複数ページのPDFを1ページずつのファイルに分けます。<br />
            アップロード不要。分割後のZIPを自動でダウンロードします。
          </p>
        </div>
      </section>

      <section>
        <div class="container">
          <div
            id="js-dropzone"
            class="drop-zone mt20"
            :class="{ 'drag-active': isDragging }"
            @dragenter="dropzoneInEvent"
            @dragleave="dragleaveEvent"
            @dragover="dragoverEvent"
            @drop="fileDropEvent"
          >
            <div class="drop-zone-text">
              <b>ファイルをここにドラッグ&amp;ドロップ</b>
            </div>
            <label id="js-select-file" for="file" class="select-file mt10">
              ファイルを選択
              <input
                id="file"
                type="file"
                accept=".pdf,application/pdf"
                @change="fileChangeEvent"
              />
            </label>
          </div>
        </div>
      </section>

      <section v-if="pdfs.length" class="mt20">
        <div class="container">
          <div class="tac">
            <button
              v-if="zipFlg"
              type="button"
              class="download-all-button"
              @click="downloadZIP"
            >
              <i class="fa fa-download"></i> まとめてダウンロード
            </button>
          </div>

          <div class="item-list row mt20">
            <div v-for="(pdf, index) in pdfs" :key="pdf.no" class="col-md-4 mbxs">
              <a
                class="db bg-gray box over"
                :href="pdf.pdfSrc"
                :download="pdf.filename"
                target="_blank"
              >
                <p class="mt0 gray tac">ページ {{ pdf.no }}</p>
                <figure v-if="pdfImageSrc[index]" class="mtxxs">
                  <img :src="pdfImageSrc[index]" width="100%" :alt="`PDF ${pdf.no}ページ目のプレビュー`" />
                </figure>
                <div v-else class="tac mtxs gray">プレビューなし</div>
                <p :id="'download' + pdf.no" class="tac mts">
                  <i class="fa fa-download"></i> ダウンロード
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gray ptm pbm mtm">
        <div class="container-fluid">
          <section>
            <div class="container">
              <h2 class="h2">特徴</h2>
              <ul class="list mtxxs">
                <li>PDFを1ページずつのファイルに分割できます。</li>
                <li>分割完了後、すべてのページをZIPで自動ダウンロードします。</li>
                <li>必要なページだけ個別に再ダウンロードできます。</li>
                <li>PDFはサーバーへアップロードしません。</li>
                <li>ブラウザ内だけで分割処理を行います。</li>
              </ul>
            </div>
          </section>

          <section class="mts">
            <div class="container">
              <h2 class="h2">PDFを分割する方法</h2>
              <ul class="list mtxxs">
                <li>PDFを選択、またはドラッグ＆ドロップします。</li>
                <li>分割が完了するとZIPが自動でダウンロードされます。</li>
                <li>画面上のプレビューから各ページを個別にダウンロードできます。</li>
              </ul>
            </div>
          </section>

          <section class="mts">
            <div class="container">
              <h2 class="h2">PDFとは</h2>
              <p class="mtxxs">
                PDFは、端末やOSが異なっても文書のレイアウトを保って表示・印刷できる電子文書形式です。このツールでは、複数ページのPDFをページごとのPDFファイルへ分割できます。
              </p>
            </div>
          </section>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>


<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'


useHead({
  title: '一発でPDF分割｜複数ページを1ページずつに分割する無料オンラインツール',
  meta: [
    {
      name: 'description',
      content: '複数ページのPDFを1ページずつに分割できる無料オンラインツールです。アップロード不要で処理し、分割したPDFをZIPで自動ダウンロードします。'
    }
  ]
})

const pdfs = ref([])
const pdfImageSrc = ref([])
const zipFlg = ref(0)
const isDragging = ref(false)

function revokePdfUrls() {
  if (!import.meta.client) return

  pdfs.value.forEach((pdf) => {
    if (pdf.pdfSrc) {
      window.URL.revokeObjectURL(pdf.pdfSrc)
    }
  })
}

async function createPDF(files) {
  if (!files || !files.length) return

  const file = files[0]

  if (
    file.type &&
    file.type !== 'application/pdf' &&
    !/\.pdf$/i.test(file.name)
  ) {
    alert('PDFファイルを選択してください。')
    return
  }

  revokePdfUrls()

  pdfs.value = []
  pdfImageSrc.value = []
  zipFlg.value = 0

  let arrayBuffer

  try {
    arrayBuffer = await file.arrayBuffer()
    console.log('[split-pdf] file:', file.name, file.size, 'bytes')
  } catch (error) {
    console.error('[split-pdf] File read error:', error)
    alert('PDFファイルを読み込めませんでした。')
    return
  }

  // PDF分割
  try {
    const pdfBytes = new Uint8Array(arrayBuffer.slice(0))

    const sourcePdf = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      updateMetadata: false
    })

    console.log('[split-pdf] pages:', sourcePdf.getPageCount())

    pdfs.value = await splitPdf(sourcePdf)
    zipFlg.value = pdfs.value.length ? 1 : 0

    if (pdfs.value.length) {
      await downloadZIP()
    }
  } catch (error) {
    console.error('[split-pdf] pdf-lib error:', error)

    pdfs.value = []
    zipFlg.value = 0

    const message = error?.message || String(error)

    if (/encrypted|password/i.test(message)) {
      alert('このPDFは暗号化またはパスワード保護されているため分割できません。')
    } else {
      alert('PDFの分割に失敗しました。\n\n' + message)
    }

    return
  }

  // PDFプレビュー
  // ここが失敗してもPDF分割・ダウンロードはそのまま使用できます。
  try {
    const previewBytes = new Uint8Array(arrayBuffer.slice(0))

    const pdfjsLib = await import('pdfjs-dist')
    const pdfWorker = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default

    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

    const loadingTask = pdfjsLib.getDocument({
      data: previewBytes
    })

    const previewPdf = await loadingTask.promise

    console.log('[split-pdf] pdf.js version:', pdfjsLib.version)
    console.log('[split-pdf] preview pages:', previewPdf.numPages)

    const images = []

    for (let pageNo = 1; pageNo <= previewPdf.numPages; pageNo++) {
      const page = await previewPdf.getPage(pageNo)
      images.push(await renderPage(page))
    }

    pdfImageSrc.value = images
  } catch (error) {
    console.warn(
      '[split-pdf] Thumbnail generation failed. PDF downloads are still available:',
      error
    )

    pdfImageSrc.value = []
  }
}

async function splitPdf(sourcePdf) {
  const pageCount = sourcePdf.getPageCount()
  const result = []

  for (let index = 0; index < pageCount; index++) {
    const outputPdf = await PDFDocument.create()
    const [page] = await outputPdf.copyPages(sourcePdf, [index])
    outputPdf.addPage(page)

    const bytes = await outputPdf.save()
    const blob = new Blob([bytes], { type: 'application/pdf' })

    result.push({
      no: index + 1,
      blob,
      pdfSrc: window.URL.createObjectURL(blob),
      filename: `pdf${index + 1}.pdf`
    })
  }

  return result
}

async function renderPage(page) {
  const viewport = page.getViewport({
    scale: 0.5,
    rotation: 0
  })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) return ''

  canvas.height = Math.ceil(viewport.height)
  canvas.width = Math.ceil(viewport.width)

  await page.render({
    canvasContext: context,
    viewport
  }).promise

  return canvas.toDataURL()
}

function dropzoneInEvent() {
  isDragging.value = true
}

function dragleaveEvent(event) {
  if (event.currentTarget?.contains(event.relatedTarget)) return
  isDragging.value = false
}

function dragoverEvent(event) {
  event.preventDefault()
}

function fileDropEvent(event) {
  event.preventDefault()
  isDragging.value = false
  createPDF(event.dataTransfer.files)
}

function fileChangeEvent(event) {
  createPDF(event.target.files)
  event.target.value = ''
}

async function downloadZIP() {
  const zip = new JSZip()

  pdfs.value.forEach((pdf, index) => {
    zip.file(`pdf${index + 1}.pdf`, pdf.blob)
  })

  const blob = await zip.generateAsync({ type: 'blob' })
  saveAs(blob, 'pdfs.zip')
}

onBeforeUnmount(() => {
  revokePdfUrls()
})
</script>

<style scoped>
.split-pdf .drop-zone:hover,
.split-pdf .drop-zone.drag-active {
  border-color: #999;
  background: #f7f7f7;
}

.download-all-button {
  display: inline-block;
  padding: 14px 24px;
  border: 0;
  border-radius: 4px;
  background: #555;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.download-all-button:hover {
  opacity: 0.8;
}
</style>
