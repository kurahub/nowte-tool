<template>
  <div>
    <main id="main" class="text-to-image">
      <section class="page-header">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">テキスト画像変換</h1>

          <div class="row justify-content-center">
            <div class="col-12 col-md-12">
              <p class="page-description">
                文字・文章を画像に変換します。<br />色と文字サイズを選んで画像をダウンロードできます。
              </p>
            </div>
          </div>

          <div class="row justify-content-center mts">
            <div class="col-12 col-md-6">
              <p class="gray mtxxs">
                <b>テキスト</b>
              </p>

              <div class="mtxs">
                <textarea
                  id="textarea"
                  v-model="textInput"
                  rows="6"
                  @keyup="rows"
                ></textarea>
              </div>

              <div class="option-background">
                <label>
                  <input
                    v-model="optionBackgroundColor"
                    class="option-input radio radio-transparent"
                    type="radio"
                    value="rgba(0, 0, 0, 0)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionBackgroundColor"
                    class="option-input radio radio-black"
                    type="radio"
                    value="rgba(0, 0, 0, 1)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionBackgroundColor"
                    class="option-input radio radio-white"
                    type="radio"
                    value="rgba(255, 255, 255, 1)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionBackgroundColor"
                    class="option-input radio radio-red"
                    type="radio"
                    value="rgb(255, 112, 112)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionBackgroundColor"
                    class="option-input radio radio-green"
                    type="radio"
                    value="rgb(75, 216, 125)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionBackgroundColor"
                    class="option-input radio radio-blue"
                    type="radio"
                    value="rgb(63, 148, 255)"
                  />
                </label>
              </div>

              <div class="option-font-color">
                <label></label>

                <label>
                  <input
                    v-model="optionFontColor"
                    class="option-input radio radio-black"
                    type="radio"
                    value="rgba(0, 0, 0, 1)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionFontColor"
                    class="option-input radio radio-white"
                    type="radio"
                    value="rgba(255, 255, 255, 1)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionFontColor"
                    class="option-input radio radio-red"
                    type="radio"
                    value="rgb(255, 112, 112)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionFontColor"
                    class="option-input radio radio-green"
                    type="radio"
                    value="rgb(75, 216, 125)"
                  />
                </label>

                <label>
                  <input
                    v-model="optionFontColor"
                    class="option-input radio radio-blue"
                    type="radio"
                    value="rgb(63, 148, 255)"
                  />
                </label>
              </div>

              <div class="option-font-size-box mtxs">
                <input
                  v-model="optionFontSize"
                  class="option-font-size range"
                  type="range"
                  max="66"
                  min="10"
                  step="1"
                />

                <p class="range-number tac mtxxs gray">
                  {{ optionFontSize }}
                </p>
              </div>

              <p class="tac mtms">
                <button
                  class="btn btn-primary ps"
                  type="button"
                  @click="drawCreative"
                >
                  <i class="fas fa-download"></i>
                  画像をダウンロード
                </button>
              </p>

              <p>
                <a
                  id="download"
                  href
                  download
                  style="visibility: hidden;"
                >
                  ダウンロード
                </a>
              </p>
            </div>

            <div class="col-12 col-md-6">
              <p class="gray mtxxs">
                <b>プレビュー</b>
              </p>

              <div class="capture-box mtxs">
                <p
                  id="capture"
                  class="mt0"
                  :style="captureStyle"
                  v-html="replaceText(textInput)"
                ></p>
              </div>
            </div>
          </div>

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <h2 class="h2">テキストを画像に変換する方法</h2>
            <ul class="list mtxxs">
              <li>テキストボックスへ文字を入力します。</li>
              <li>背景色・文字色・文字サイズを選びます。</li>
              <li>「画像をダウンロード」を押します。</li>
            </ul>
          </div>

          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">更新履歴</h2>

            <ul class="list mtxxs">
              <li>2020/05/20 Ver 1.1 背景色、透過、文字色、フォントサイズ変更機能追加</li>
              <li>2020/05/19 Ver 1.0 ツール公開</li>
            </ul>
          </div>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import html2canvas from 'html2canvas'

useHead({
  title: '一発でテキスト変換｜無料オンラインツール',
  meta: [{ name: 'description', content: '入力したテキストをPNG画像に変換できる無料オンラインツールです。背景色・文字色・文字サイズを設定してすぐにダウンロードできます。' }]
})

const textInput = ref('ここに画像にしたいテキストを入力')
const optionBackgroundColor = ref('rgba(255, 255, 255, 1)')
const optionFontColor = ref('rgba(0, 0, 0, 1)')
const optionFontSize = ref(16)

const filename = 'text.png'

const captureStyle = computed(() => ({
  background: optionBackgroundColor.value,
  color: optionFontColor.value,
  fontSize: `${optionFontSize.value}px`
}))

function replaceText(text) {
  return String(text ?? '').replace(/\n/g, '<br>')
}

async function drawCreative() {
  if (!import.meta.client) return

  const capture = document.getElementById('capture')
  if (!capture) return

  try {
    const canvas = await html2canvas(capture, {
      backgroundColor: null,
      useCORS: true,
      scale: window.devicePixelRatio || 1
    })

    canvas.toBlob((blob) => {
      if (!blob) {
        alert('画像の生成に失敗しました。')
        return
      }

      const url = window.URL.createObjectURL(blob)
      const download = document.getElementById('download')

      if (!download) {
        window.URL.revokeObjectURL(url)
        return
      }

      download.setAttribute('href', url)
      download.download = filename
      download.click()

      setTimeout(() => {
        window.URL.revokeObjectURL(url)
      }, 1000)
    }, 'image/png')
  } catch (error) {
    console.error('[text-to-image]', error)
    alert(`画像の生成に失敗しました。\n${error?.message || error}`)
  }
}

function rows() {
  if (!import.meta.client) return

  const textarea = document.getElementById('textarea')
  if (!textarea) return

  const lineCount = textInput.value.split('\n').length
  textarea.setAttribute('rows', Math.max(lineCount, 4))
}
</script>
