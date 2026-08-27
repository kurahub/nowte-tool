<template>
    <div>
        <main
            id="main"
            class="pdf-to-image"
        >
            <section class="page-header">
                <div class="container">
                    <h1 class="h1">PDFを画像に変換 PNG・JPG</h1>

                    <p class="page-description">
                        PDFの各ページをPNGまたはJPG画像に変換します。
                        <br />
                        ファイルを入れたら一発変換・自動ダウンロード。
                    </p>
                </div>
            </section>
            <section>
                <div class="container">
                    <div
                        class="drop-zone mt20"
                        :class="{ 'drag-active': isDragging, 'is-processing': isProcessing }"
                        @dragenter.prevent="isDragging = true"
                        @dragover.prevent
                        @dragleave.prevent="leaveDropZone"
                        @drop.prevent="fileDropEvent"
                    >
                        <div class="drop-zone-text">
                            <b>{{ isProcessing ? statusMessage : 'ファイルをここにドラッグ&ドロップ' }}</b>
                        </div>

                        <label
                            v-if="!isProcessing"
                            for="pdf-file"
                            class="select-file mt10"
                        >
                            ファイルを選択
                            <input
                                id="pdf-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                @change="fileChangeEvent"
                            />
                        </label>
                    </div>

                    <p
                        v-if="errorMessage"
                        class="error-message tac mts"
                    >{{ errorMessage }}</p>
                    <p
                        v-else-if="statusMessage && !isProcessing"
                        class="gray tac mts"
                    >{{ statusMessage }}</p>

                    <div class="settings mt20">
                        <div>
                            <div class="gray mt0 fsms">出力形式</div>
                            <div class="radio-button-group mt5">
                                <div class="item">
                                    <input
                                        id="format-png"
                                        v-model="outputFormat"
                                        type="radio"
                                        class="radio-button"
                                        value="png"
                                    />
                                    <label for="format-png">PNG</label>
                                </div>
                                <div class="item">
                                    <input
                                        id="format-jpg"
                                        v-model="outputFormat"
                                        type="radio"
                                        class="radio-button"
                                        value="jpg"
                                    />
                                    <label for="format-jpg">JPG</label>
                                </div>
                            </div>
                        </div>

                        <label class="resolution-setting">
                            <div class="gray fsms">解像度</div>
                            <select v-model.number="renderScale">
                                <option :value="1.5">標準</option>
                                <option :value="2">高画質</option>
                                <option :value="3">最高画質</option>
                            </select>
                        </label>
                    </div>

                    <section v-if="resultImages.length" class="image-results mtm">
                        <div class="result-heading">
                            <h2 class="h2">変換した画像</h2>
                            <button
                                v-if="resultImages.length > 1"
                                type="button"
                                class="download-all-button"
                                @click="downloadZip"
                            ><i class="fa fa-download"></i> まとめてダウンロード</button>
                        </div>

                        <div class="item-list row mt20">
                            <div
                                v-for="image in resultImages"
                                :key="image.page"
                                class="col-md-4 mbxs"
                            >
                                <a
                                    class="image-card db bg-gray box over"
                                    :href="image.url"
                                    :download="image.filename"
                                >
                                    <p class="mt0 gray tac">ページ {{ image.page }}</p>
                                    <figure class="mtxxs">
                                        <img :src="image.url" width="100%" :alt="`PDF ${image.page}ページ目の画像`" />
                                    </figure>
                                    <p class="tac mts"><i class="fa fa-download"></i> ダウンロード</p>
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            </section>
            <section class="bg-gray ptm pbm mtm">
                <div class="container-fluid">
                    <section>
                        <div class="container">
                            <div class="bg-gray">
                                <h2 class="h2">特徴</h2>
                                <ul class="list mtxxs">
                                    <li>PDFの全ページをPNGまたはJPGに変換します。</li>
                                    <li>複数ページはZIPにまとめて自動ダウンロードします。</li>
                                    <li>PDFはサーバーへアップロードしません。</li>
                                    <li>ブラウザ内だけで変換処理を行います。</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                    <section class="mts">
                        <div class="container">
                            <h2 class="h2">PDFを画像に変換する方法</h2>
                            <ul class="list mtxxs">
                                <li>出力形式と解像度を選びます。</li>
                                <li>PDFを選択、またはドラッグ＆ドロップします。</li>
                                <li>変換が完了すると画像またはZIPが自動でダウンロードされます。</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </section>

            <Archive />
        </main>
    </div>
</template>

<script setup>
import { onBeforeUnmount, ref } from "vue";
import JSZip from "jszip";

useHead({
    title: "一発でPDFを画像に変換｜PNG・JPGへ無料変換 - 一発ツールズ",
    meta: [
        {
            name: "description",
            content:
                "PDFの各ページをPNGまたはJPG画像に変換できる無料オンラインツールです。アップロード不要。PDFを入れると一発変換して自動ダウンロードします。",
        },
    ],
});

const outputFormat = ref("png");
const renderScale = ref(2);
const isDragging = ref(false);
const isProcessing = ref(false);
const statusMessage = ref("");
const errorMessage = ref("");
const resultImages = ref([]);
const zipFilename = ref("pdf-images.zip");

function fileChangeEvent(event) {
    const file = event.target?.files?.[0];
    if (event.target) event.target.value = "";
    convertPdf(file);
}

function fileDropEvent(event) {
    isDragging.value = false;
    convertPdf(event.dataTransfer?.files?.[0]);
}

function leaveDropZone(event) {
    if (event.currentTarget?.contains(event.relatedTarget)) return;
    isDragging.value = false;
}

async function convertPdf(file) {
    if (!file || isProcessing.value) return;

    if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
        errorMessage.value = "PDFファイルを選択してください。";
        return;
    }

    isProcessing.value = true;
    errorMessage.value = "";
    statusMessage.value = "PDFを読み込んでいます…";
    revokeResultUrls();
    resultImages.value = [];

    let pdf;
    let loadingTask;

    try {
        const pdfjsLib = await import("pdfjs-dist");
        const pdfWorker = (
            await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
        ).default;
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

        const data = new Uint8Array(await file.arrayBuffer());
        loadingTask = pdfjsLib.getDocument({ data });
        pdf = await loadingTask.promise;
        const images = [];

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            statusMessage.value = `${pageNumber} / ${pdf.numPages} ページを変換しています…`;
            const page = await pdf.getPage(pageNumber);
            const blob = await renderPage(
                page,
                renderScale.value,
                outputFormat.value
            );
            images.push({
                blob,
                filename: `${baseName(file.name)}-${String(pageNumber).padStart(
                    3,
                    "0"
                )}.${outputFormat.value}`,
            });
            page.cleanup();
        }

        statusMessage.value = "ダウンロードを準備しています…";
        resultImages.value = images.map((image, index) => ({
            ...image,
            page: index + 1,
            url: URL.createObjectURL(image.blob),
        }));
        zipFilename.value = `${baseName(file.name)}-images.zip`;

        if (images.length === 1) {
            downloadBlob(images[0].blob, images[0].filename);
        } else {
            downloadBlob(await createZip(images), zipFilename.value);
        }

        statusMessage.value = `${pdf.numPages}ページの変換が完了しました。`;
    } catch (error) {
        console.error("[pdf-to-image]", error);
        const message = error?.message || String(error);
        errorMessage.value = /password/i.test(message)
            ? "パスワードで保護されたPDFは変換できません。"
            : "PDFの変換に失敗しました。ファイルを確認してください。";
        statusMessage.value = "";
    } finally {
        try {
            pdf?.cleanup?.();
        } catch (error) {
            console.warn("[pdf-to-image] cleanup failed:", error);
        }
        try {
            await loadingTask?.destroy?.();
        } catch (error) {
            console.warn("[pdf-to-image] loading task cleanup failed:", error);
        }
        isProcessing.value = false;
    }
}

async function renderPage(page, scale, format) {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: format === "png" });
    if (!context) throw new Error("Canvasの初期化に失敗しました。");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    if (format === "jpg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvas, canvasContext: context, viewport }).promise;

    return await new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) =>
                blob
                    ? resolve(blob)
                    : reject(new Error("画像を生成できませんでした。")),
            format === "png" ? "image/png" : "image/jpeg",
            format === "jpg" ? 0.92 : undefined
        );
    });
}

function baseName(filename) {
    return filename.replace(/\.pdf$/i, "") || "pdf";
}

async function createZip(images) {
    const zip = new JSZip();
    images.forEach((image) => zip.file(image.filename, image.blob));
    return await zip.generateAsync({ type: "blob" });
}

async function downloadZip() {
    downloadBlob(await createZip(resultImages.value), zipFilename.value);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function revokeResultUrls() {
    resultImages.value.forEach((image) => URL.revokeObjectURL(image.url));
}

onBeforeUnmount(revokeResultUrls);
</script>

<style scoped>
.pdf-to-image .settings {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    gap: 40px;
}
.pdf-to-image .resolution-setting {
    display: flex;
    flex-direction: column;
    gap: 5px;
}
.pdf-to-image .resolution-setting select {
    min-width: 140px;
    padding: 9px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
}
.pdf-to-image .drop-zone:hover,
.pdf-to-image .drop-zone.drag-active {
    border-color: #999;
    background: #f7f7f7;
}
.pdf-to-image .drop-zone.is-processing {
    cursor: wait;
}
.pdf-to-image .error-message {
    color: #c33;
}
.result-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}
.download-all-button {
    padding: 12px 18px;
    border: 0;
    border-radius: 4px;
    background: #555;
    color: #fff;
    cursor: pointer;
}
.image-card {
    height: 100%;
    text-decoration: none;
}
.image-card figure {
    overflow: hidden;
    max-height: 280px;
    background: #fff;
}
.image-card img {
    display: block;
    object-fit: contain;
}
@media (max-width: 767px) {
    .pdf-to-image .settings {
        align-items: flex-end;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 20px;
    }
}
</style>
