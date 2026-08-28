<template>
  <div>
    <main id="main" class="golden-ratio">
      <section class="page-header tac">
        <div class="container">
          <div class="h1-sub">＼　一発で！　／</div>
          <h1 class="h1">黄金比表</h1>
          <p class="fwb fsl mtxxs">(1:1.618)</p>
          <p class="page-description">
            最も美しい比と言われる「黄金比」。
            <br />計算しなくても見れるように早見表を作成しました。
          </p>
        </div>
      </section>

      <section>
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-6">
              <table class="golden-ratio-table tbl mt20 fwb">
                <tr>
                  <th class="tal">横幅 (px)</th>
                  <th class="tal">縦幅 (px)</th>
                </tr>

                <tr
                  v-for="(item, index) in goldenRatio"
                  :key="index"
                >
                  <td class="tar bd bdl">
                    {{ item.width }}
                  </td>

                  <td class="tar bd bdl">
                    {{ item.height }}
                    <p class="gray fss mt0 fwn">
                      {{ item.height_dot }}
                    </p>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section class="tool-info-section bg-gray ptm pbm mtm">
        <div class="container">
          <h2 class="h2">黄金比とは</h2>
          <p class="mtxxs">黄金比は、およそ1対1.618の比率です。横幅に対応する縦幅を早見表ですぐに確認できます。</p>
        </div>
      </section>

      <Archive />
    </main>
  </div>
</template>

<script setup>
useHead({
  title: '黄金比表',
  meta: [{ name: 'description', content: '横幅に対応する黄金比1対1.618の縦幅をすぐ確認できる無料の黄金比早見表です。10pxから2000pxまで一覧表示します。' }]
})

/*
  旧Nuxt 2版の golden_ratio.json と同じロジック。
  横幅 10px ～ 2000px を10px刻みで生成する。
  黄金比 1 : 1.618 なので、縦幅 = 横幅 / 1.618
*/
const goldenRatio = Array.from({ length: 200 }, (_, index) => {
  const width = (index + 1) * 10
  const heightDot = width / 1.618

  return {
    width,
    height: Math.round(heightDot),
    height_dot: Number(heightDot.toFixed(3))
  }
})
</script>
