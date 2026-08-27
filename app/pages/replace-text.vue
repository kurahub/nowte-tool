<template>
  <div><main id="main" class="replace-text"><section class="page-header"><div class="container">
    <h1 class="h1">文字列置換｜テキストを一括置換</h1>
    <p class="page-description">置換前と置換後の文字列を指定して、文章内の該当箇所をまとめて置換します。</p>
    <div class="replace-settings mt20"><label>置換前<input v-model="searchText" type="text" placeholder="置換したい文字列" /></label><label>置換後<input v-model="replacementText" type="text" placeholder="置換後の文字列" /></label></div>
    <label class="input-label mt20" for="source-text">置換したいテキスト</label><textarea id="source-text" v-model="sourceText" class="tool-textarea mt10" rows="9" placeholder="ここに文章を入力"></textarea>
    <div class="result-header mt20"><label for="result-text">置換後のテキスト（{{ replacementCount }}件置換）</label><button type="button" class="copy-button" @click="copyResult">{{ copied ? 'コピーしました' : 'コピー' }}</button></div>
    <textarea id="result-text" :value="resultText" class="tool-textarea mt10" rows="9" readonly></textarea>
    <div class="tool-info-section bg-gray ptm pbm mtm"><h2 class="h2">特徴</h2><ul class="list mtxxs"><li>一致する文字列をすべて一括置換します。</li><li>置換結果と置換件数を入力と同時に表示します。</li><li>正規表現ではなく、入力した文字列そのものを安全に置換します。</li></ul></div>
    <div class="tool-info-section bg-gray pbm"><h2 class="h2">使い方</h2><ul class="list mtxxs"><li>置換前と置換後の文字列を入力します。</li><li>置換対象の文章を入力します。</li><li>結果を確認してコピーボタンを押します。</li></ul></div>
  </div></section><Archive /></main></div>
</template>
<script setup>
import { computed, ref } from 'vue'
useHead({ title: '文字列置換ツール｜テキストを一括置換 - 一発ツールズ', meta: [{ name: 'description', content: '文章内の指定した文字列を別の文字列へ一括置換できる無料オンラインツールです。' }] })
const searchText = ref(''); const replacementText = ref(''); const sourceText = ref(''); const copied = ref(false)
const replacementCount = computed(() => searchText.value ? sourceText.value.split(searchText.value).length - 1 : 0)
const resultText = computed(() => searchText.value ? sourceText.value.split(searchText.value).join(replacementText.value) : sourceText.value)
async function copyResult() { if (!import.meta.client) return; try { await navigator.clipboard.writeText(resultText.value); copied.value = true; setTimeout(() => { copied.value = false }, 1500) } catch { const area = document.getElementById('result-text'); area?.select(); document.execCommand('copy') } }
</script>
<style scoped>
.replace-settings { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.replace-settings label,.input-label { display: flex; flex-direction: column; gap: 8px; color: #777; }.replace-settings input,.tool-textarea { box-sizing: border-box; width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font: inherit; }.tool-textarea { padding: 16px; line-height: 1.7; }.result-header { display: flex; align-items: center; justify-content: space-between; color: #777; }.copy-button { padding: 8px 16px; border: 0; border-radius: 4px; background: #1aa1ff; color: #fff; cursor: pointer; }@media(max-width:767px){.replace-settings{grid-template-columns:1fr}}
</style>
