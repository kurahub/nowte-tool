<template>
  <div>
    <main id="main" class="tool-index">
      <section class="mts">
        <div class="container">
          <h1 class="h1">一発ツールズ</h1>

          <p class=" tac lead-text">
            ファイルを入れたら、一発完了。
            <br />
            無料・登録不要で使えるオンラインツール。
          </p>

          <section class="tool-section">
            <h2 class="h2">PDFツール</h2>

            <div class="tool-grid">
              <NuxtLink to="/merge-pdf/" class="tool-card">
                <strong>PDF結合</strong>
                <span>複数のPDFを一発でひとつに結合</span>
              </NuxtLink>

              <NuxtLink to="/split-pdf/" class="tool-card">
                <strong>PDF分割</strong>
                <span>PDFから必要なページを分割</span>
              </NuxtLink>

              <NuxtLink to="/sort-pdf/" class="tool-card">
                <strong>PDF並び替え</strong>
                <span>PDFのページを好きな順番に変更</span>
              </NuxtLink>

              <NuxtLink to="/pdf-to-image/" class="tool-card">
                <strong>PDF → PNG・JPG</strong>
                <span>PDFの全ページを画像へ一発変換</span>
              </NuxtLink>

              <NuxtLink to="/image-to-pdf/" class="tool-card">
                <strong>画像 → PDF</strong>
                <span>複数画像を一つのPDFへ一発変換</span>
              </NuxtLink>
            </div>
          </section>

          <section class="tool-section">
            <h2 class="h2">画像ツール</h2>

            <div class="tool-grid">
              <NuxtLink to="/compress-image/" class="tool-card">
                <strong>画像圧縮</strong>
                <span>JPG・PNG画像のファイルサイズを圧縮</span>
              </NuxtLink>

              <NuxtLink to="/resize-image/" class="tool-card">
                <strong>画像リサイズ</strong>
                <span>画像の幅・高さをかんたん変更</span>
              </NuxtLink>

              <NuxtLink to="/webp-to-jpg/" class="tool-card">
                <strong>WEBP → JPG・PNG</strong>
                <span>WEBP画像をJPGまたはPNGへ一発変換</span>
              </NuxtLink>

              <NuxtLink to="/image-to-webp/" class="tool-card">
                <strong>PNG・JPG → WEBP</strong>
                <span>PNG・JPG画像をWEBPへ一発変換</span>
              </NuxtLink>

              <NuxtLink to="/jfif-to-jpg/" class="tool-card">
                <strong>JFIF → JPG・PNG</strong>
                <span>JFIF画像をJPGまたはPNGへ一発変換</span>
              </NuxtLink>

              <NuxtLink to="/png-transparent/" class="tool-card">
                <strong>PNG背景透過</strong>
                <span>PNG画像の白背景を透明に変換</span>
              </NuxtLink>

              <NuxtLink to="/merge-image/" class="tool-card">
                <strong>画像結合</strong>
                <span>複数画像を縦・横に一枚へ結合</span>
              </NuxtLink>
            </div>
          </section>

          <section class="tool-section">
            <h2 class="h2">その他のツール</h2>

            <div class="tool-grid">
              <NuxtLink to="/text-to-image/" class="tool-card">
                <strong>テキスト → 画像</strong>
                <span>入力したテキストを画像に変換</span>
              </NuxtLink>

              <NuxtLink to="/golden-ratio/" class="tool-card">
                <strong>黄金比</strong>
                <span>黄金比のサイズをすぐに計算</span>
              </NuxtLink>

              <NuxtLink to="/japanese-check/" class="tool-card">
                <strong>日本語チェック</strong>
                <span>文章に日本語が含まれるかすぐ確認</span>
              </NuxtLink>

              <NuxtLink to="/replace-text/" class="tool-card">
                <strong>文字列置換</strong>
                <span>文章内の文字列をまとめて置換</span>
              </NuxtLink>

              <NuxtLink to="/anchor-link-generator/" class="tool-card">
                <strong>ページ内リンク生成</strong>
                <span>HTMLのIDからaタグを一括生成</span>
              </NuxtLink>
            </div>
          </section>

          <div class="privacy-box">
            <strong>ブラウザ内で処理</strong>
            <p>
              対応ツールはファイルをサーバーへアップロードせず、
              ブラウザ内で処理します。
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
useHead({
  title: '一発ツールズ｜無料・登録不要のオンラインツール',
  meta: [
    {
      name: 'description',
      content:
        'PDF結合・PDF分割・画像圧縮・画像変換などを無料で使えるオンラインツール。一発ツールズは、できるだけ少ない操作で素早く処理できる便利ツール集です。'
    }
  ]
})
</script>

<style scoped>
.tool-index {
  padding-bottom: 60px;
}

.lead-text {
  margin-top: 16px;
  line-height: 1.8;
}

.tool-section {
  margin-top: 48px;
}

.tool-section .h2 {
  margin-bottom: 18px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 22px 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.tool-card:hover {
  transform: translateY(-2px);
  border-color: #bbb;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.tool-card strong {
  font-size: 18px;
}

.tool-card span {
  color: #777;
  font-size: 14px;
  line-height: 1.6;
}

.privacy-box {
  margin-top: 48px;
  padding: 20px 24px;
  border-radius: 8px;
  background: #f7f7f7;
}

.privacy-box p {
  margin: 6px 0 0;
  color: #777;
  line-height: 1.7;
}

@media (max-width: 767px) {
  .tool-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tool-section {
    margin-top: 36px;
  }

  .tool-card {
    padding: 18px 20px;
  }
}
</style>
