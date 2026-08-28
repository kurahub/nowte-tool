<template>
  <div><main id="main" class="japanese-check"><section class="page-header"><div class="container">
    <div class="h1-sub">＼　一発で！　／</div>
    <h1 class="h1">日本語チェック</h1>
    <p class="page-description">入力したテキストに日本語が含まれているか、その場ですぐ確認できます。</p>
    <label class="input-label mt20" for="japanese-text">チェックするテキスト</label>
    <textarea id="japanese-text" v-model="text" class="tool-textarea mt10" rows="10" placeholder="ここにテキストを入力"></textarea>
    <div class="check-result mt20" :class="{ found: hasJapanese, empty: !text }">
      <b>{{ resultTitle }}</b><p v-if="text" class="mt5">日本語文字数：{{ japaneseCharacters.length }}文字</p><p v-if="text" class="mt5">2バイト文字数：{{ doubleByteCount }}文字</p>
      <p v-if="japaneseCharacters.length" class="mt5 japanese-preview">{{ japaneseCharacters.join('') }}</p>
    </div>
    <div class="tool-info-section bg-gray ptm pbm mtm"><h2 class="h2">判定対象</h2><ul class="list mtxxs"><li>ひらがな、カタカナ、漢字を判定します。</li><li>日本語の句読点と全角記号も判定対象です。</li><li>ASCII・半角カナ以外を2バイト文字として数えます。</li><li>入力内容はサーバーへ送信しません。</li></ul></div>
    <div class="tool-info-section bg-gray pbm"><h2 class="h2">使い方</h2><ul class="list mtxxs"><li>テキストを入力欄へ貼り付けます。</li><li>入力と同時に日本語の有無と文字数が表示されます。</li></ul></div>
  </div></section><Archive /></main></div>
</template>
<script setup>
import { computed, ref } from 'vue'
useHead({ title: '一発で日本語チェック｜テキスト内の日本語を確認無料オンラインツール', meta: [{ name: 'description', content: '入力したテキストに日本語が含まれているかを確認できる無料オンラインツールです。日本語文字数と2バイト文字数をリアルタイムで表示します。' }] })
const text = ref('')
const japaneseCharacters = computed(() => text.value.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}々〆ヵヶ、。・「」『』【】〜ー]/gu) || [])
const doubleByteCount = computed(() => Array.from(text.value).filter((character) => !/[\u0000-\u007f\uff61-\uff9f]/u.test(character)).length)
const hasJapanese = computed(() => japaneseCharacters.value.length > 0)
const resultTitle = computed(() => !text.value ? 'テキストを入力してください。' : hasJapanese.value ? '日本語が含まれています。' : '日本語は含まれていません。')
</script>
<style scoped>
.input-label { display: block; color: #777; }.tool-textarea { box-sizing: border-box; width: 100%; padding: 16px; border: 1px solid #ccc; border-radius: 6px; font: inherit; line-height: 1.7; }.check-result { padding: 20px; border: 1px solid #ccc; border-radius: 6px; background: #fafafa; }.check-result.found { border-color: #1aa1ff; }.japanese-preview { word-break: break-all; color: #777; }
</style>
