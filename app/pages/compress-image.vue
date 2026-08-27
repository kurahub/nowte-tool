<template>
  <div>
    <main id="main" class="compress-image">
      <section class="mts">
        <div class="container">
          <h1 class="h1">画像圧縮ツール</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class=" tac">
                アップロード不要。JPG・PNGファイルのファイルサイズを簡単圧縮。
              </p>
            </div>
          </div>

          <a
            id="download"
            href
            download
            style="visibility: hidden;"
          >
            ダウンロード
          </a>

          <div
            id="js-dropzone"
            class="drop-zone"
            @dragenter="dropzoneInEvent"
          >
            <div
              id="js-overlay-area"
              class="overlay-area"
              @dragleave="dragleaveEvent"
              @dragover="dragoverEvent"
              @drop="fileDropEvent"
            ></div>

            <p
              id="js-overlay-text"
              class="no-active"
            ></p>

            <p class="drop-zone-text">
              ファイルを選択 or ここにドラッグ&ドロップ
              <br />
              圧縮されたファイルを自動でダウンロードします。
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
                accept="image/*"
                multiple
                @change="fileChangeEvent"
              />
            </label>

            <div
              id="js-selected-file"
              class="selected-file no-active"
            ></div>
          </div>

          <div class="option-font-size-box mtxs tar">
            圧縮率

            <input
              v-model="compressNumber"
              class="option-font-size range"
              type="range"
              max="100"
              min="10"
              step="10"
            />

            <span class="range-number tac mtxxs gray">
              {{ compressNumber + ' %' }}
            </span>
          </div>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Compressor from 'compressorjs'

useHead({
  title: '一発でオンライン画像圧縮 JPG・PNG'
})

const compressNumber = ref(80)

const overlayTextID = 'js-overlay-text'
const overlayAreaID = 'js-overlay-area'
const selectedFileID = 'js-selected-file'

function getElement(id) {
  if (!import.meta.client) return null
  return document.getElementById(id)
}

function fileDownload(files) {
  if (!files?.length) {
    return
  }

  for (const file of Array.from(files)) {
    if (!file.type?.startsWith('image/')) {
      console.warn('[compress-image] Not an image:', file.name)
      continue
    }

    new Compressor(file, {
      quality: Number(compressNumber.value) / 100,

      success(result) {
        const blobUrl = window.URL.createObjectURL(result)
        const filename = `compress_${file.name}`
        const download = getElement('download')

        if (!download) {
          window.URL.revokeObjectURL(blobUrl)
          return
        }

        download.setAttribute('href', blobUrl)
        download.download = filename
        download.click()

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl)
        }, 1000)
      },

      error(err) {
        console.error('[compress-image]', err)
        alert(`画像の圧縮に失敗しました。\n${err.message || err}`)
      }
    })
  }
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

function fileDropEvent(event) {
  event.preventDefault()

  getElement(selectedFileID)?.classList.remove('no-active')
  getElement(overlayAreaID)?.classList.remove('drag-overlay')
  getElement(overlayTextID)?.classList.remove('overlay-text')
  getElement(overlayTextID)?.classList.add('no-active')

  fileDownload(event.dataTransfer?.files)
}

function fileChangeEvent(event) {
  getElement(selectedFileID)?.classList.remove('no-active')

  fileDownload(event.target?.files)

  if (event.target) {
    event.target.value = ''
  }
}
</script>
