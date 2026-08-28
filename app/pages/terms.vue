<template>
  <main id="main" class="legal-page">
    <section class="page-header">
      <div class="container legal-container">
        <h1 class="h1">利用規約</h1>
        <p class="page-description">一発ツールズをご利用いただく際のお願いです。</p>

        <div class="legal-content mtm">
          <section>
            <h2>一発ツールズについて</h2>
            <p>一発ツールズは、個人で運営するサイトです。仕事や日常で使える便利な機能を提供しています。</p>
          </section>

          <section>
            <h2>ご利用にあたって</h2>
            <ul>
              <li>処理前のファイルは、念のためご自身でバックアップしてください。</li>
              <li>変換結果や処理結果は、ダウンロード後に内容をご確認ください。</li>
              <li>第三者の権利を侵害するファイルや、法律に違反する目的での利用は禁止です。</li>
            </ul>
          </section>

          <section>
            <h2>サービスの変更・停止</h2>
            <p>メンテナンスや不具合、仕様変更などにより、予告なく機能を変更または停止することがあります。</p>
          </section>

          <section>
            <h2>免責事項</h2>
            <p>本サービスは可能な限り正しく動作するよう努めていますが、すべての環境やファイルでの動作を保証するものではありません。本サービスの利用によって生じた損害やデータの消失などについて、運営者は責任を負いかねます。あらかじめご了承ください。</p>
          </section>

          <section>
            <h2>規約の変更</h2>
            <p>サービス内容の変更などに合わせて、この利用規約を更新することがあります。</p>
          </section>

          <section>
            <h2>お問い合わせ</h2>
            <LegalContact />
          </section>

          <p class="legal-date">制定日：{{ legalInformation.establishedOn }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { legalInformation } from '~/data/legal'

useHead({
  title: '利用規約｜一発ツールズ',
  meta: [{ name: 'description', content: '一発ツールズをご利用いただく際の注意事項や免責事項についてご案内します。' }]
})
</script>
