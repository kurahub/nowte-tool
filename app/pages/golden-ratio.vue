<template>
  <div>
    <main id="main">
      <section class="tac mtm">
        <div class="container">
          <h1 class="h1">黄金比 早見表</h1>
          <p class="fwb fsl mtxxs">(1:1.618)</p>
          <p class="">
            最も美しい比と言われる「黄金比」。
            <br />計算しなくても見れるように早見表を作成しました。
          </p>
        </div>
      </section>

      <section>
        <div class="container">
          <div class="row justify-content-center">
            <div class="col-lg-6">
              <table class="golden-ratio-table tbl mts fwb">
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

      <Archive />
    </main>
  </div>
</template>

<script setup>
useHead({
  title: '黄金比早見表'
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
