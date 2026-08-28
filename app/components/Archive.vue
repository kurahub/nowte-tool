<template>
    <section
        id="archive"
        class="service-list-box"
    >
        <div class="container-fluid">
            <div class="service-list df flex-wrap no-gutters">
                <div class="col-12 tac">
                    <NuxtLink
                        v-for="(tool, index) in tools"
                        :key="tool.to"
                        :class="{ mls: index > 0 }"
                        :to="tool.to"
                    >{{ tool.label }}</NuxtLink>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
const tools = [
    { to: "/merge-pdf/", label: "PDF結合" },
    { to: "/split-pdf/", label: "PDF分割" },
    { to: "/sort-pdf/", label: "PDF並び替え" },
    { to: "/pdf-to-image/", label: "PDFを画像に変換" },
    { to: "/image-to-pdf/", label: "画像をPDFに変換" },
    { to: "/compress-image/", label: "画像圧縮" },
    { to: "/resize-image/", label: "画像リサイズ" },
    { to: "/merge-image/", label: "画像結合" },
    { to: "/webp-to-jpg/", label: "WEBPをPNG・JPGに変換" },
    { to: "/image-to-webp/", label: "画像をWEBPに変換" },
    { to: "/jfif-to-jpg/", label: "JFIFをJPG・PNGに変換" },
    { to: "/png-transparent/", label: "PNG背景透過" },
    { to: "/text-to-image/", label: "テキスト画像変換" },
    { to: "/japanese-check/", label: "日本語チェック" },
    { to: "/replace-text/", label: "文字列置換" },
    { to: "/anchor-link-generator/", label: "ページ内リンク生成" },
    { to: "/golden-ratio/", label: "黄金比" },
];
</script>
