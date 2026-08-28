<template>
  <div>
    <main id="main" class="anchor-link-generator">
      <section class="page-header">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">ページ内リンクタグ作成</h1>
          <p class="page-description">HTML内のid属性をすべて抽出し、見出しへ移動するaタグを一括生成します。</p>

          <label class="input-label mt20" for="source-html">IDを抽出するHTML</label>
          <textarea id="source-html" v-model="sourceHtml" class="code-textarea mt10" rows="12" placeholder='<section id="aaa"><h2>見出し</h2></section>'></textarea>

          <div class="result-header mt20">
            <label for="generated-links">生成されたページ内リンク（{{ extractedCount }}件）</label>
            <button type="button" class="copy-button" :disabled="!generatedLinks" @click="copyLinks">{{ copied ? 'コピーしました' : 'コピー' }}</button>
          </div>
          <textarea id="generated-links" :value="generatedLinks" class="code-textarea mt10" rows="10" readonly placeholder="生成結果がここに表示されます"></textarea>
          <p v-if="parseError" class="error-message mt10">{{ parseError }}</p>

          <div class="tool-info-section bg-gray ptm pbm mtm">
            <h2 class="h2">生成例</h2>
            <p class="mtxxs"><code>&lt;section id="aaa"&gt;&lt;h2&gt;あああ&lt;/h2&gt;&lt;/section&gt;</code></p>
            <p class="mt10"><code>&lt;a href="#aaa"&gt;あああ&lt;/a&gt;</code></p>
          </div>
          <div class="tool-info-section bg-gray pbm">
            <h2 class="h2">使い方</h2>
            <ul class="list mtxxs"><li>ID属性を含むHTMLを入力します。</li><li>各要素内の最初の見出しをリンク文言として使用します。</li><li>見出しがない場合は要素のテキスト、さらにない場合はIDを使用します。</li></ul>
          </div>
        </div>
      </section>
      <Archive />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

useHead({ title: '一発でページ内リンクタグ作成｜HTMLソースコードから一括抽出無料オンラインツール', meta: [{ name: 'description', content: 'HTMLソースコード内のid属性と見出しを一括抽出し、ページ内リンク用のaタグを自動生成する無料オンラインツールです。' }] })

const sourceHtml = ref('')
const copied = ref(false)
const parsedLinks = computed(() => {
  if (!sourceHtml.value || !import.meta.client) return { links: [], error: '' }
  try {
    const documentNode = new DOMParser().parseFromString(sourceHtml.value, 'text/html')
    const links = Array.from(documentNode.querySelectorAll('[id]')).map((element) => {
      const id = element.id.trim()
      const heading = element.querySelector('h1, h2, h3, h4, h5, h6')
      const label = (heading?.textContent || element.textContent || id).trim().replace(/\s+/g, ' ')
      return id ? `<a href="#${escapeAttribute(id)}">${escapeText(label || id)}</a>` : ''
    }).filter(Boolean)
    return { links, error: '' }
  } catch { return { links: [], error: 'HTMLを解析できませんでした。' } }
})
const generatedLinks = computed(() => parsedLinks.value.links.join('\n'))
const extractedCount = computed(() => parsedLinks.value.links.length)
const parseError = computed(() => parsedLinks.value.error)

function escapeAttribute(value) { return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function escapeText(value) { return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
async function copyLinks() { if (!generatedLinks.value) return; try { await navigator.clipboard.writeText(generatedLinks.value); copied.value = true; setTimeout(() => { copied.value = false }, 1500) } catch { const area = document.getElementById('generated-links'); area?.select(); document.execCommand('copy') } }
</script>

<style scoped>
.input-label { display: block; color: #777; }.code-textarea { box-sizing: border-box; width: 100%; padding: 16px; border: 1px solid #ccc; border-radius: 6px; font-family: Consolas, Monaco, monospace; line-height: 1.6; }.result-header { display: flex; align-items: center; justify-content: space-between; color: #777; }.copy-button { padding: 8px 16px; border: 0; border-radius: 4px; background: #1aa1ff; color: #fff; cursor: pointer; }.copy-button:disabled { opacity: .5; cursor: default; }.error-message { color: #c33; }code { word-break: break-all; }
</style>
