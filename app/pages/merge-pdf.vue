<template>
  <div>
    <main id="main" class="merge-pdf">
      <section class="page-header">
        <div class="container">
          <h1 class="h1">PDF結合ツール</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="page-description">
                複数のPDFを1つに結合します。アップロード不要・ブラウザ内で処理します。
              </p>
            </div>
          </div>

          <div
            id="js-dropzone"
            class="drop-zone mt20"
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

            <div class="drop-zone-text"><b>ファイルをここにドラッグ&amp;ドロップ</b></div>

            <label
              id="js-select-file"
              for="file"
              class="select-file mt10"
            >
              PDFファイルを選択

              <input
                id="file"
                type="file"
                accept="application/pdf,.pdf"
                multiple
                @change="fileChangeEvent"
              />
            </label>

            <div
              id="js-selected-file"
              class="selected-file no-active"
            ></div>
          </div>

          <div
            v-if="files.length"
            class="merge-file-list mts"
          >
            <p class="gray mtxxs">
              <b>結合する順番</b>
              <br />
              上から順にPDFを結合します。
            </p>

            <div
              v-for="(item, index) in files"
              :key="item.id"
              class="merge-file-item"
            >
              <div class="merge-file-info">
                <span class="merge-file-number">{{ index + 1 }}</span>

                <div class="merge-file-name">
                  <b>{{ item.file.name }}</b>
                  <p class="gray fss mt0">
                    {{ formatFileSize(item.file.size) }}
                  </p>
                </div>
              </div>

              <div class="merge-file-actions">
                <button
                  type="button"
                  class="merge-action-button"
                  :disabled="index === 0"
                  @click="moveUp(index)"
                >
                  ↑
                </button>

                <button
                  type="button"
                  class="merge-action-button"
                  :disabled="index === files.length - 1"
                  @click="moveDown(index)"
                >
                  ↓
                </button>

                <button
                  type="button"
                  class="merge-action-button"
                  @click="removeFile(index)"
                >
                  削除
                </button>
              </div>
            </div>

            <p class="tac mtm">
              <button
                type="button"
                class="btn btn-primary ps"
                :disabled="merging"
                @click="mergePDF"
              >
                {{ merging ? 'PDFを結合中...' : 'PDFを結合してダウンロード' }}
              </button>
            </p>

            <p
              v-if="errorMessage"
              class="gray tac mts"
            >
              {{ errorMessage }}
            </p>
          </div>

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <p class="mt0">
              <b>特徴</b>
            </p>

            <ul class="list mtxxs">
              <li>PDFファイルはサーバーへアップロードしません。</li>
              <li>ブラウザ内だけでPDFを結合します。</li>
              <li>複数のPDFをまとめて選択できます。</li>
              <li>結合する順番を変更できます。</li>
            </ul>
          </div>

          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">使い方</h2>

            <ol class="list mtxxs">
              <li>結合したいPDFファイルを複数選択、またはドラッグ＆ドロップします。</li>
              <li>選択した順番で自動結合され、PDFがダウンロードされます。</li>
              <li>順番を変更した場合は「PDFを結合してダウンロード」を押すと再作成できます。</li>
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
import { PDFDocument } from 'pdf-lib'

useHead({
  title: '一発でPDF結合｜複数PDFを1つにまとめる無料オンラインツール',
  meta: [
    {
      name: 'description',
      content:
        '複数のPDFファイルを1つに結合できる無料オンラインツールです。アップロード不要で、PDFはブラウザ内だけで処理します。'
    }
  ]
})

const files = ref([])
const merging = ref(false)
const errorMessage = ref('')
const isDragging = ref(false)

let idCounter = 0

const overlayTextID = 'js-overlay-text'
const overlayAreaID = 'js-overlay-area'
const selectedFileID = 'js-selected-file'

function getElement(id) {
  if (!import.meta.client) return null
  return document.getElementById(id)
}

function addFiles(fileList) {
  if (!fileList?.length) {
    return
  }

  errorMessage.value = ''

  const newFiles = Array.from(fileList).filter((file) => {
    return (
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf')
    )
  })

  if (!newFiles.length) {
    errorMessage.value = 'PDFファイルを選択してください。'
    return
  }

  const addedItems = newFiles.map((file) => ({
    id: ++idCounter,
    file
  }))

  files.value.push(...addedItems)

  getElement(selectedFileID)?.classList.remove('no-active')

  // ファイル選択・ドロップ後に自動で結合してダウンロード
  // 既にファイルがある場合も、現在の一覧順でまとめて結合する
  mergePDF()
}

function fileChangeEvent(event) {
  addFiles(event.target?.files)

  if (event.target) {
    event.target.value = ''
  }
}

function fileDropEvent(event) {
  event.preventDefault()

  getElement(overlayAreaID)?.classList.remove('drag-overlay')
  getElement(overlayTextID)?.classList.remove('overlay-text')
  getElement(overlayTextID)?.classList.add('no-active')

  addFiles(event.dataTransfer?.files)
}

function dropzoneInEvent() {
  getElement(overlayAreaID)?.classList.add('drag-overlay')
  getElement(overlayTextID)?.classList.add('overlay-text')
  getElement(overlayTextID)?.classList.remove('no-active')
}

function dragleaveEvent() {
  getElement(overlayAreaID)?.classList.remove('drag-overlay')
  getElement(overlayTextID)?.classList.remove('overlay-text')
  getElement(overlayTextID)?.classList.add('no-active')
}

function dragoverEvent(event) {
  event.preventDefault()
}

function moveUp(index) {
  if (index <= 0) return

  const list = [...files.value]
  ;[list[index - 1], list[index]] = [list[index], list[index - 1]]
  files.value = list
}

function moveDown(index) {
  if (index >= files.value.length - 1) return

  const list = [...files.value]
  ;[list[index], list[index + 1]] = [list[index + 1], list[index]]
  files.value = list
}

function removeFile(index) {
  files.value.splice(index, 1)

  if (!files.value.length) {
    getElement(selectedFileID)?.classList.add('no-active')
  }
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

async function mergePDF() {
  if (!files.value.length || merging.value) {
    return
  }

  merging.value = true
  errorMessage.value = ''

  try {
    const mergedPdf = await PDFDocument.create()

    for (const item of files.value) {
      const arrayBuffer = await item.file.arrayBuffer()

      let sourcePdf

      try {
        sourcePdf = await PDFDocument.load(new Uint8Array(arrayBuffer), {
          ignoreEncryption: true,
          updateMetadata: false
        })
      } catch (error) {
        throw new Error(
          `${item.file.name} を読み込めませんでした。暗号化・パスワード保護されたPDFの可能性があります。`
        )
      }

      const pageIndexes = sourcePdf.getPageIndices()
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndexes)

      copiedPages.forEach((page) => {
        mergedPdf.addPage(page)
      })
    }

    const mergedBytes = await mergedPdf.save()
    const blob = new Blob([mergedBytes], {
      type: 'application/pdf'
    })

    const url = window.URL.createObjectURL(blob)
    const download = document.createElement('a')

    download.href = url
    download.download = 'merged.pdf'
    document.body.appendChild(download)
    download.click()
    download.remove()

    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    console.error('[merge-pdf]', error)
    errorMessage.value =
      error?.message || 'PDFの結合に失敗しました。'
  } finally {
    merging.value = false
  }
}
</script>

<style scoped>
.merge-file-list {
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}

.merge-file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.merge-file-info {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
}

.merge-file-number {
  display: flex;
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f1f1f1;
  font-weight: bold;
}

.merge-file-name {
  min-width: 0;
  word-break: break-all;
}

.merge-file-actions {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}

.merge-action-button {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 10px;
  background: #fff;
  cursor: pointer;
}

.merge-action-button:disabled {
  cursor: default;
  opacity: 0.35;
}

.merge-pdf .overlay-area {
  pointer-events: none;
}

.merge-pdf .drop-zone.drag-active {
  outline: 2px dashed currentColor;
  outline-offset: -6px;
}

@media (max-width: 600px) {
  .merge-file-item {
    align-items: flex-start;
    flex-direction: column;
  }

  .merge-file-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

.merge-pdf .drop-zone {
  position: relative;
  margin-top: 30px;
  padding: 60px 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #fafafa;
  text-align: center;
  transition: 0.2s;
}

.merge-pdf .drop-zone:hover {
  border-color: #999;
  background: #f7f7f7;
}

.merge-pdf .drop-zone.drag-active {
  border-color: #777;
  background: #f3f3f3;
}

.merge-pdf .overlay-area {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
