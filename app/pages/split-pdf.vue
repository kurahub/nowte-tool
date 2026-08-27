<template>
  <div>
    <main id="main" class="compress-image">
      <section class="mts">
        <div class="container">
          <h1 class="h1">PDFを1ページずつに<br />分割するだけツール</h1>
          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="tac mtxxs">
                複数ページのPDFを1つずつのファイルに分けます。<br />
                アップロード＆インストール不要だから高速。無料で簡単誰でも使えます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section v-if="pdfs.length" class="sec-md ptxxs">
        <div class="container">
          <div class="tac df justify-content-center">
            <button
              v-if="zipFlg"
              class="tac mts db bg-gray box over"
              style="cursor: pointer;"
              @click="downloadZIP"
            >
              <i class="fa fa-download"></i> まとめてダウンロード
            </button>
          </div>

          <div class="item-list row mts">
            <div v-for="(pdf, index) in pdfs" :key="pdf.no" class="col-md-4 mbxs">
              <a
                class="db bg-gray box over"
                :href="pdf.pdfSrc"
                :download="pdf.filename"
                target="_blank"
              >
                <p class="mt0 gray tac">ページ {{ pdf.no }}</p>
                <figure v-if="pdfImageSrc[index]" class="mtxxs">
                  <img :src="pdfImageSrc[index]" width="100%" alt="" />
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

      <section class="sec-md ptxxs">
        <div class="container">
          <div id="js-dropzone" class="drop-zone mts" @dragenter="dropzoneInEvent">
            <div
              id="js-overlay-area"
              class="overlay-area"
              @dragleave="dragleaveEvent"
              @dragover="dragoverEvent"
              @drop="fileDropEvent"
            ></div>
            <p id="js-overlay-text" class="no-active"></p>
            <p class="drop-zone-text">PDF選択 or ここにドラッグ&ドロップ</p>
            <label id="js-select-file" for="file" class="select-file">
              ファイルを選択
              <input
                id="file"
                type="file"
                accept=".pdf,application/pdf"
                @change="fileChangeEvent"
              />
            </label>
            <div id="js-selected-file" class="selected-file no-active"></div>
          </div>
        </div>
      </section>

      <section class="sec-md">
        <div class="container">
          <h2 class="h2">特徴</h2>
          <div class="item-list row mts">
            <div class="col-md-4 mbxs tac">
              <p><i class="fa fa-running fsxxl"></i></p>
              <h3 class="h3 mtxs">高速処理</h3>
              <p class="mtxxs">サーバーレスでアップロード不要だからPDFをすぐに分割。</p>
            </div>
            <div class="col-md-4 mbxs tac">
              <p><i class="fa fa-arrow-alt-circle-down fsxxl"></i></p>
              <h3 class="h3 mtxs">カンタン操作</h3>
              <p class="mtxxs">PDFをドラッグして必要なPDFをダウンロードするだけ。</p>
            </div>
            <div class="col-md-4 mbxs tac">
              <p><i class="fa fa-check fsxxl"></i></p>
              <h3 class="h3 mtxs">無料</h3>
              <p class="mtxxs">どなたでも無料で利用可。</p>
            </div>
          </div>
        </div>
      </section>

      <section class="sec-md pt0">
        <div class="container">
          <h2 class="h2">使い方</h2>
          <p>1.　ページを分割したいPDFを「ファイルを選択」欄にドラッグ＆ドップ、またはボタンをクリックしてPDFを選択。</p>
          <p>2.　PDF内のページが画面に表示されるので必要なページをクリックでダウンロードします。</p>
          <p>3.　まとめてダウンロードする場合は「まとめてダウンロード」をクリック</p>
        </div>
      </section>

      <section class="sec-md pt0">
        <div class="container">
          <h2 class="h2">PDFとは</h2>
          <p>
            Portable Document Format (PDF)（ポータブル・ドキュメント・フォーマット）の略称で、デジタルデバイス上でアプリケーションやOS、ハードウェアに依存せず文章や図版を表示するために開発され、ISO 32000[2]で国際標準化された電子文書ファイル形式のこと。 手軽に作成した文書を異なる環境のコンピュータで元のレイアウト通りに表示・印刷できる。
          </p>
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
  title: '一発でPDFを1ページずつに分割｜無料・アップロード＆インストール不要',
  meta: [
    {
      name: 'description',
      content:
        '複数ページのPDFを1つずつのファイルに分けます。アップロード＆インストール不要だから高速。無料で簡単誰でも使えます。'
    }
  ]
})

const pdfs = ref([])
const pdfImageSrc = ref([])
const zipFlg = ref(0)

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
  document.getElementById('js-overlay-area')?.classList.add('drag-overlay')
  document.getElementById('js-overlay-text')?.classList.add('overlay-text')
  document.getElementById('js-overlay-text')?.classList.remove('no-active')
}

function dragleaveEvent() {
  document.getElementById('js-overlay-area')?.classList.remove('drag-overlay')
  document.getElementById('js-overlay-text')?.classList.remove('overlay-text')
  document.getElementById('js-overlay-text')?.classList.add('no-active')
}

function dragoverEvent(event) {
  event.preventDefault()
}

function fileDropEvent(event) {
  event.preventDefault()

  document.getElementById('js-selected-file')?.classList.remove('no-active')
  document.getElementById('js-overlay-area')?.classList.remove('drag-overlay')
  document.getElementById('js-overlay-text')?.classList.remove('overlay-text')
  document.getElementById('js-overlay-text')?.classList.add('no-active')

  createPDF(event.dataTransfer.files)
}

function fileChangeEvent(event) {
  document.getElementById('js-selected-file')?.classList.remove('no-active')
  createPDF(event.target.files)
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
