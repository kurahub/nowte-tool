<template>
  <main id="main" class="legal-page">
    <section class="page-header">
      <div class="container legal-container">
        <h1 class="h1">プライバシーポリシー</h1>
        <p class="page-description">一発ツールズで取り扱う情報についてご案内します。</p>

        <div class="legal-content mtm">
          <section>
            <h2>運営について</h2>
            <p>一発ツールズは、{{ legalInformation.operatorName }}が個人で運営しています。利用者のプライバシーに配慮し、取得した情報を適切に取り扱います。</p>
          </section>

          <section>
            <h2>ファイル・入力内容について</h2>
            <p>各ツールへ入力されたPDF、画像、テキストなどは、原則としてお使いのブラウザ内で処理されます。運営者のサーバーへアップロードしたり、保存したりする仕組みではありません。</p>
            <p class="mtxxs">ただし、利用者のブラウザ拡張機能や端末環境など、運営者が管理していない機能についてはこの限りではありません。</p>
          </section>

          <section>
            <h2>アクセス解析について</h2>
            <p>本サービスでは、サイトの利用状況を確認し、今後の改善に役立てるためGoogle Analyticsを利用しています。Google AnalyticsはCookieなどを利用して、閲覧ページ、利用環境、アクセス元などの情報を収集する場合があります。この情報から、運営者が個人を特定することはありません。</p>
            <ul>
              <li><a href="https://policies.google.com/privacy?hl=ja" target="_blank" rel="noopener noreferrer">Google プライバシーポリシー</a></li>
              <li><a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">Google Analytics オプトアウト アドオン</a></li>
            </ul>
          </section>

          <section>
            <h2>Cookieについて</h2>
            <p>Cookieは、サイトの利用状況を確認するために使われる小さなデータです。Cookieを使用したくない場合は、ブラウザの設定から無効化または削除できます。</p>
          </section>

          <section>
            <h2>アクセス情報の利用目的</h2>
            <p>Google Analyticsで取得したアクセス情報は、サイトの利用状況の確認や機能改善のために利用します。</p>
          </section>

          <section>
            <h2>内容の変更</h2>
            <p>サービス内容や利用する外部サービスの変更に合わせて、このプライバシーポリシーを更新することがあります。</p>
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
  title: 'プライバシーポリシー｜一発ツールズ',
  meta: [{ name: 'description', content: '一発ツールズにおける入力ファイル、Cookie、Google Analyticsなどの取り扱いについてご案内します。' }]
})
</script>
