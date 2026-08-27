<template>
  <div>
    <main id="main" class="image-compress">
      <section class="page-header">
        <div class="container">
          <h1 class="h1">画像圧縮ツール</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="page-description">
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

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <h2 class="h2">特徴</h2>
            <ul class="list mtxxs">
              <li>JPG・PNG画像をまとめて圧縮できます。</li>
              <li>画像はサーバーへアップロードしません。</li>
              <li>圧縮後の画像を自動でダウンロードします。</li>
            </ul>
          </div>

          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">画像を圧縮する方法</h2>
            <ul class="list mtxxs">
              <li>圧縮率を選びます。</li>
              <li>画像を選択、またはドラッグ＆ドロップします。</li>
              <li>圧縮された画像が自動でダウンロードされます。</li>
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
  title: '一発でオンライン画像圧縮 JPG・PNG'
})

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
