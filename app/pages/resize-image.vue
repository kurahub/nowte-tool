<template>
  <div>
    <main id="main" class="image-resize">
      <section class="page-header">
        <div class="container">
          <h1 class="h1">画像リサイズ</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="page-description">
                アップロード不要。JPG・PNG・GIFの画像を複数一括リサイズ。
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
            class="drop-zone mt20"
            :class="{ 'drag-active': isDragging }"
            @dragenter.prevent="dropzoneInEvent"
            @dragleave.prevent="dragleaveEvent"
            @dragover.prevent="dragoverEvent"
            @drop.prevent="fileDropEvent"
          >
            <div class="drop-zone-text"><b>ファイルをここにドラッグ&amp;ドロップ</b></div>

            <label
              id="js-select-file"
              for="file"
              class="select-file mt10"
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

          </div>

          <div class="radio-button-group tool-setting-options mts">
            <div class="item title">W x H</div>

            <div class="item">
              <input
                id="button_320_180"
                v-model="wh"
                type="radio"
                class="radio-button"
                value="320"
              />
              <label for="button_320_180">320</label>
            </div>

            <div class="item">
              <input
                id="button_480_270"
                v-model="wh"
                type="radio"
                class="radio-button"
                value="480"
              />
              <label for="button_480_270">480</label>
            </div>

            <div class="item">
              <input
                id="button_640_360"
                v-model="wh"
                type="radio"
                class="radio-button"
                value="640"
              />
              <label for="button_640_360">640</label>
            </div>

            <div class="item">
              <input
                id="button_960_540"
                v-model="wh"
                type="radio"
                class="radio-button"
                value="960"
              />
              <label for="button_960_540">960</label>
            </div>

            <div class="item">
              <input
                id="button_1024_768"
                v-model="wh"
                type="radio"
                class="radio-button"
                value="1024"
              />
              <label for="button_1024_768">1024</label>
            </div>

            <div class="item">
              <input
                id="button_1280_720"
                v-model="wh"
                type="radio"
                class="radio-button"
                value="1280"
              />
              <label for="button_1280_720">1280</label>
            </div>
          </div>

          <label class="custom-size mt20">
            <span class="gray">任意サイズ</span>
            <input v-model="wh" type="number" min="1" max="10000" step="1" />
            <span>px</span>
          </label>

          <div class="option-font-size-box mtxs tar">
            JPG圧縮率

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

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <h2 class="h2">特徴</h2>
            <ul class="list mtxxs">
              <li>JPG・PNG・GIF画像をまとめてリサイズできます。</li>
              <li>画像はサーバーへアップロードしません。</li>
              <li>リサイズ後の画像を自動でダウンロードします。</li>
            </ul>
          </div>

          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">画像をリサイズする方法</h2>
            <ul class="list mtxxs">
              <li>出力サイズとJPG圧縮率を選びます。</li>
              <li>画像を選択、またはドラッグ＆ドロップします。</li>
              <li>リサイズされた画像が自動でダウンロードされます。</li>
            </ul>
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
  title: '一発でオンライン画像リサイズ JPG・PNG・GIF'
})

const wh = ref('1280')
const compressNumber = ref(80)
const isDragging = ref(false)

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
      console.warn('[resize-image] Not an image:', file.name)
      continue
    }

    new Compressor(file, {
      width: Number(wh.value),
      height: Number(wh.value),
      quality: Number(compressNumber.value) / 100,

      success(result) {
        const blobUrl = window.URL.createObjectURL(result)
        const filename = `resize_${file.name}`
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
        console.error('[resize-image]', err)
        alert(`画像のリサイズに失敗しました。\n${err.message || err}`)
      }
    })
  }
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
  fileDownload(event.dataTransfer?.files)
}

function fileChangeEvent(event) {
  fileDownload(event.target?.files)

  if (event.target) {
    event.target.value = ''
  }
}
</script>

<style scoped>
.custom-size {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.custom-size input {
  width: 110px;
  padding: 9px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
