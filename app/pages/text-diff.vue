<template>
  <div>
    <main id="main" class="text-diff">
      <section class="page-header">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">テキスト差分比較</h1>
          <p class="page-description">
            変更前と変更後のテキストを比較し、1行ずつ違いを確認できます。<br />
            追加・削除・変更箇所を色分けして表示します。
          </p>

          <div class="input-head mt20">
            <strong>比較するテキスト</strong>
            <div class="input-actions">
              <button type="button" @click="swapTexts">左右を入れ替え</button>
              <button type="button" :disabled="!oldText && !newText" @click="clearTexts">クリア</button>
            </div>
          </div>

          <div class="input-grid mt10">
            <label>
              <span>変更前</span>
              <textarea v-model="oldText" rows="14" placeholder="変更前のテキストを入力"></textarea>
            </label>
            <label>
              <span>変更後</span>
              <textarea v-model="newText" rows="14" placeholder="変更後のテキストを入力"></textarea>
            </label>
          </div>

          <div class="settings mt20">
            <label><input v-model="ignoreWhitespace" type="checkbox" /> 空白の違いを無視</label>
            <label><input v-model="showUnchanged" type="checkbox" /> 変更のない行も表示</label>
          </div>
        </div>
      </section>

      <section v-if="hasInput" class="result-section mtm">
        <div class="container">
          <div class="result-title">
            <h2 class="h2">比較結果</h2>
            <div class="summary">
              <span class="summary-changed">変更 {{ summary.changed }}</span>
              <span class="summary-added">追加 {{ summary.added }}</span>
              <span class="summary-removed">削除 {{ summary.removed }}</span>
            </div>
          </div>

          <p v-if="!summary.changed && !summary.added && !summary.removed" class="no-difference mt20">
            違いはありません。
          </p>

          <div v-else class="diff-table mt20">
            <div class="diff-row diff-header">
              <div class="line-number">行</div>
              <div>変更前</div>
              <div class="line-number">行</div>
              <div>変更後</div>
            </div>

            <div
              v-for="(row, index) in visibleRows"
              :key="`${row.oldNumber || 0}-${row.newNumber || 0}-${index}`"
              class="diff-row"
              :class="`diff-${row.type}`"
            >
              <div class="line-number">{{ row.oldNumber || '' }}</div>
              <div class="line-content old-line">
                <template v-for="(part, partIndex) in row.oldParts" :key="partIndex">
                  <mark v-if="part.changed">{{ part.value }}</mark><template v-else>{{ part.value }}</template>
                </template>
              </div>
              <div class="line-number">{{ row.newNumber || '' }}</div>
              <div class="line-content new-line">
                <template v-for="(part, partIndex) in row.newParts" :key="partIndex">
                  <mark v-if="part.changed">{{ part.value }}</mark><template v-else>{{ part.value }}</template>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-gray ptm pbm mtm">
        <div class="container">
          <h2 class="h2">使い方</h2>
          <ul class="list mtxxs">
            <li>左側に変更前、右側に変更後のテキストを入力します。</li>
            <li>行ごとの差分が自動で表示されます。</li>
            <li>赤は削除、緑は追加、黄色は変更された行です。</li>
            <li>変更行の中では、実際に変わった文字も強調表示されます。</li>
          </ul>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { diffLines, diffWordsWithSpace } from 'diff'

useHead({
  title: '一発でテキスト差分比較｜1行ずつ違いがわかる無料オンラインツール',
  meta: [{
    name: 'description',
    content: '2つのテキストを比較し、追加・削除・変更箇所を行番号付きでわかりやすく表示する無料オンライン差分ツールです。'
  }]
})

const oldText = ref('')
const newText = ref('')
const ignoreWhitespace = ref(false)
const showUnchanged = ref(true)

const hasInput = computed(() => Boolean(oldText.value || newText.value))

const rows = computed(() => {
  const changes = diffLines(oldText.value, newText.value, {
    ignoreWhitespace: ignoreWhitespace.value,
    newlineIsToken: false
  })
  const result = []
  let oldNumber = 1
  let newNumber = 1
  let index = 0

  while (index < changes.length) {
    const change = changes[index]

    if (!change.added && !change.removed) {
      splitLines(change.value).forEach((line) => {
        result.push(createRow('unchanged', line, line, oldNumber++, newNumber++))
      })
      index++
      continue
    }

    const removedLines = []
    const addedLines = []
    while (index < changes.length && (changes[index].added || changes[index].removed)) {
      const changedLines = splitLines(changes[index].value)
      if (changes[index].removed) removedLines.push(...changedLines)
      if (changes[index].added) addedLines.push(...changedLines)
      index++
    }

    const length = Math.max(removedLines.length, addedLines.length)
    for (let lineIndex = 0; lineIndex < length; lineIndex++) {
      const oldLine = removedLines[lineIndex]
      const newLine = addedLines[lineIndex]
      if (oldLine !== undefined && newLine !== undefined) {
        result.push(createRow('changed', oldLine, newLine, oldNumber++, newNumber++))
      } else if (oldLine !== undefined) {
        result.push(createRow('removed', oldLine, '', oldNumber++, null))
      } else {
        result.push(createRow('added', '', newLine, null, newNumber++))
      }
    }
  }

  return result
})

const visibleRows = computed(() => showUnchanged.value ? rows.value : rows.value.filter((row) => row.type !== 'unchanged'))
const summary = computed(() => rows.value.reduce((count, row) => {
  if (row.type === 'changed') count.changed++
  if (row.type === 'added') count.added++
  if (row.type === 'removed') count.removed++
  return count
}, { changed: 0, added: 0, removed: 0 }))

function splitLines(value) {
  if (!value) return []
  const normalized = value.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  if (normalized.endsWith('\n')) lines.pop()
  return lines
}

function createRow(type, oldValue, newValue, oldNumber, newNumber) {
  if (type !== 'changed') {
    return {
      type,
      oldNumber,
      newNumber,
      oldParts: oldValue === '' ? [] : [{ value: oldValue, changed: type === 'removed' }],
      newParts: newValue === '' ? [] : [{ value: newValue, changed: type === 'added' }]
    }
  }

  const parts = diffWordsWithSpace(oldValue, newValue)
  return {
    type,
    oldNumber,
    newNumber,
    oldParts: parts.filter((part) => !part.added).map((part) => ({ value: part.value, changed: Boolean(part.removed) })),
    newParts: parts.filter((part) => !part.removed).map((part) => ({ value: part.value, changed: Boolean(part.added) }))
  }
}

function swapTexts() {
  const previous = oldText.value
  oldText.value = newText.value
  newText.value = previous
}

function clearTexts() {
  oldText.value = ''
  newText.value = ''
}
</script>

<style scoped>
.input-head,.result-title { display:flex; align-items:center; justify-content:space-between; gap:16px; }
.input-actions { display:flex; gap:8px; }
.input-actions button { padding:7px 12px; border:1px solid #ccc; border-radius:4px; background:#fff; cursor:pointer; }
.input-actions button:disabled { opacity:.45; cursor:default; }
.input-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
.input-grid label { color:#555; font-weight:bold; }
.input-grid textarea { box-sizing:border-box; display:block; width:100%; margin-top:8px; padding:14px; border:1px solid #ccc; border-radius:6px; font-family:Consolas,Monaco,monospace; line-height:1.6; resize:vertical; }
.settings { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:18px; }
.settings label { display:inline-flex; align-items:center; gap:7px; color:#555; cursor:pointer; }
.summary { display:flex; flex-wrap:wrap; gap:8px; font-size:13px; }
.summary span { padding:5px 10px; border-radius:999px; }
.summary-changed { background:#fff2b8; }.summary-added { background:#dff5e5; }.summary-removed { background:#ffe1e1; }
.no-difference { padding:28px; border:1px solid #cde7d4; border-radius:8px; background:#effaf2; text-align:center; }
.diff-table { overflow-x:auto; border:1px solid #ddd; border-radius:7px; font-family:Consolas,Monaco,monospace; font-size:13px; }
.diff-row { display:grid; grid-template-columns:52px minmax(300px,1fr) 52px minmax(300px,1fr); min-width:704px; border-top:1px solid #e5e5e5; }
.diff-row:first-child { border-top:0; }
.diff-row > div { box-sizing:border-box; min-height:34px; padding:7px 10px; border-left:1px solid #e5e5e5; }
.diff-row > div:first-child { border-left:0; }
.diff-header { position:sticky; top:0; z-index:1; background:#555; color:#fff; font-family:inherit; font-weight:bold; }
.line-number { background:rgba(0,0,0,.035); color:#888; text-align:right; user-select:none; }
.line-content { white-space:pre-wrap; overflow-wrap:anywhere; }
.diff-changed .old-line,.diff-changed .new-line { background:#fff9dc; }
.diff-removed .old-line,.diff-removed > .line-number:first-child { background:#fff0f0; }
.diff-added .new-line,.diff-added > .line-number:nth-child(3) { background:#eaf8ee; }
.old-line mark { background:#ffb8b8; color:inherit; }.new-line mark { background:#aee7bd; color:inherit; }
@media (max-width:767px) { .input-head,.result-title { align-items:flex-start; flex-direction:column; }.input-grid { grid-template-columns:1fr; }.settings { justify-content:flex-start; }.summary { margin-top:4px; } }
</style>
