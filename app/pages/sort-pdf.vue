<template>
    <div>
        <main
            id="main"
            class="sort-pdf"
            :class="{ 'has-download-bar': pages.length }"
        >
            <section class="page-header">
                <div class="container">
                    <div class="h1-sub">＼　一発で！　／</div>
                    <h1 class="h1">PDF並び替え</h1>
                    <p class="page-description">
                        PDFのページをドラッグして好きな順番に並び替えます。<br />
                        アップロード不要。ブラウザ内だけで処理します。
                    </p>
                </div>
            </section>

            <section>
                <div class="container">
                    <div
                        class="drop-zone mt20"
                        :class="{ 'drag-active': isFileDragging, 'is-processing': isProcessing }"
                        @dragenter.prevent="isFileDragging = true"
                        @dragover.prevent
                        @dragleave.prevent="leaveDropZone"
                        @drop.prevent="fileDropEvent"
                    >
                        <div class="drop-zone-text">
                            <b>{{ isProcessing ? 'PDFを読み込んでいます…' : 'ファイルをここにドラッグ&ドロップ' }}</b>
                        </div>
                        <label
                            for="sort-pdf-file"
                            class="select-file mt10"
                        >
                            ファイルを選択
                            <input
                                id="sort-pdf-file"
                                type="file"
                                accept=".pdf,application/pdf"
                                :disabled="isProcessing"
                                @change="fileChangeEvent"
                            />
                        </label>
                    </div>

                    <p
                        v-if="message"
                        class="status-message mt20"
                        :class="{ error: hasError }"
                    >
                        {{ message }}
                    </p>
                </div>
            </section>

            <section
                v-if="pages.length"
                ref="sortSection"
                class="mtm"
            >
                <div class="container">
                    <h2 class="h2">ページを並び替え</h2>
                    <p class="page-description mtxxs">ページをドラッグして移動してください。</p>

                    <div class="page-grid mt20">
                        <article
                            v-for="(page, index) in pages"
                            :key="page.originalIndex"
                            class="page-card"
                            :class="{ 'is-dragging': draggedIndex === index }"
                            draggable="true"
                            @dragstart="pageDragStart(index, $event)"
                            @dragover.prevent="pageDragOver(index)"
                            @dragend="pageDragEnd"
                        >
                            <div class="page-number">{{ index + 1 }}</div>
                            <img
                                :src="page.preview"
                                :alt="`元のPDF ${page.originalIndex + 1}ページ目`"
                            />
                            <p>元のページ：{{ page.originalIndex + 1 }}</p>
                            <div class="page-actions">
                                <button
                                    type="button"
                                    :disabled="index === 0"
                                    aria-label="前へ移動"
                                    @click="movePage(index, index - 1)"
                                >←</button>
                                <span>ドラッグ</span>
                                <button
                                    type="button"
                                    :disabled="index === pages.length - 1"
                                    aria-label="後ろへ移動"
                                    @click="movePage(index, index + 1)"
                                >→</button>
                            </div>
                        </article>
                    </div>

                    <div class="download-area tac">
                        <button
                            type="button"
                            class="btn btn-primary"
                            :disabled="isDownloading"
                            @click="downloadSortedPdf"
                        >
                            <i class="fa fa-download"></i>
                            {{ isDownloading ? 'PDFを作成しています…' : '並び替えたPDFをダウンロード' }}
                        </button>
                    </div>
                </div>
            </section>

            <section class="bg-gray ptm pbm mtm">
                <div class="container">
                    <h2 class="h2">特徴</h2>
                    <ul class="list mtxxs">
                        <li>PDFのページをドラッグ操作で自由に並び替えられます。</li>
                        <li>矢印ボタンでも1ページずつ順番を変更できます。</li>
                        <li>PDFはサーバーへアップロードせず、ブラウザ内だけで処理します。</li>
                    </ul>

                    <h2 class="h2 mts">PDFを並び替える方法</h2>
                    <ul class="list mtxxs">
                        <li>PDFを選択、またはドラッグ＆ドロップします。</li>
                        <li>表示されたページを希望の順番へ移動します。</li>
                        <li>「並び替えたPDFをダウンロード」を押して保存します。</li>
                    </ul>
                </div>
            </section>

            <Archive />
        </main>
    </div>
</template>

<script setup>
import { nextTick, ref } from "vue";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

useHead({
    title: "一発でPDF並び替え｜ページ順を変更する無料オンラインツール",
    meta: [
        {
            name: "description",
            content:
                "PDFのページをドラッグして自由に並び替えられる無料オンラインツールです。アップロード不要で、ブラウザ内だけで安全に処理します。",
        },
    ],
});

const pages = ref([]);
const sourceBytes = ref(null);
const sourceName = ref("document.pdf");
const isFileDragging = ref(false);
const isProcessing = ref(false);
const isDownloading = ref(false);
const draggedIndex = ref(null);
const sortSection = ref(null);
const message = ref("");
const hasError = ref(false);

function leaveDropZone(event) {
    if (event.currentTarget?.contains(event.relatedTarget)) return;
    isFileDragging.value = false;
}

function fileDropEvent(event) {
    isFileDragging.value = false;
    loadPdf(event.dataTransfer?.files);
}

function fileChangeEvent(event) {
    loadPdf(event.target?.files);
    event.target.value = "";
}

async function loadPdf(files) {
    if (!files?.length || isProcessing.value) return;

    const file = files[0];
    if (
        (file.type && file.type !== "application/pdf") ||
        !/\.pdf$/i.test(file.name)
    ) {
        showError("PDFファイルを選択してください。");
        return;
    }

    isProcessing.value = true;
    pages.value = [];
    sourceBytes.value = null;
    message.value = "";
    hasError.value = false;

    try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        await PDFDocument.load(bytes.slice(), {
            ignoreEncryption: true,
            updateMetadata: false,
        });

        const pdfjsLib = await import("pdfjs-dist");
        const pdfWorker = (
            await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
        ).default;
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

        const loadingTask = pdfjsLib.getDocument({ data: bytes.slice() });
        const previewPdf = await loadingTask.promise;
        const loadedPages = [];

        for (let pageNo = 1; pageNo <= previewPdf.numPages; pageNo++) {
            const page = await previewPdf.getPage(pageNo);
            loadedPages.push({
                originalIndex: pageNo - 1,
                preview: await renderPage(page),
            });
            message.value = `${pageNo} / ${previewPdf.numPages} ページを読み込んでいます…`;
        }

        sourceBytes.value = bytes;
        sourceName.value = file.name;
        pages.value = loadedPages;
        message.value = `${previewPdf.numPages}ページを読み込みました。ドラッグして並び替えてください。`;
        await nextTick();
        sortSection.value?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    } catch (error) {
        console.error("[sort-pdf]", error);
        const detail = error?.message || String(error);
        showError(
            /encrypted|password/i.test(detail)
                ? "パスワードで保護されたPDFは並び替えできません。"
                : "PDFの読み込みに失敗しました。ファイルを確認してください。"
        );
    } finally {
        isProcessing.value = false;
    }
}

async function renderPage(page) {
    const viewport = page.getViewport({ scale: 0.5, rotation: 0 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvasを初期化できませんでした。");

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.8);
}

function pageDragStart(index, event) {
    draggedIndex.value = index;
    event.dataTransfer.effectAllowed = "move";
}

function pageDragOver(targetIndex) {
    if (draggedIndex.value === null || draggedIndex.value === targetIndex)
        return;
    const movingIndex = draggedIndex.value;
    movePage(movingIndex, targetIndex);
    draggedIndex.value = targetIndex;
}

function pageDragEnd() {
    draggedIndex.value = null;
}

function movePage(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= pages.value.length || fromIndex === toIndex)
        return;
    const reordered = [...pages.value];
    const [movingPage] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, movingPage);
    pages.value = reordered;
}

async function downloadSortedPdf() {
    if (!sourceBytes.value || !pages.value.length || isDownloading.value)
        return;
    isDownloading.value = true;
    hasError.value = false;

    try {
        const sourcePdf = await PDFDocument.load(sourceBytes.value.slice(), {
            ignoreEncryption: true,
            updateMetadata: false,
        });
        const outputPdf = await PDFDocument.create();
        const order = pages.value.map((page) => page.originalIndex);
        const copiedPages = await outputPdf.copyPages(sourcePdf, order);
        copiedPages.forEach((page) => outputPdf.addPage(page));

        const bytes = await outputPdf.save();
        const baseName = sourceName.value.replace(/\.pdf$/i, "") || "document";
        saveAs(
            new Blob([bytes], { type: "application/pdf" }),
            `${baseName}_並び替え.pdf`
        );
        message.value = "並び替えたPDFをダウンロードしました。";
    } catch (error) {
        console.error("[sort-pdf] save error:", error);
        showError("PDFの作成に失敗しました。もう一度お試しください。");
    } finally {
        isDownloading.value = false;
    }
}

function showError(text) {
    message.value = text;
    hasError.value = true;
}
</script>

<style scoped>
.sort-pdf .drop-zone.is-processing {
    pointer-events: none;
    opacity: 0.65;
}

.sort-pdf.has-download-bar {
    padding-bottom: 92px;
}

.status-message {
    text-align: center;
}

.status-message.error {
    color: #c62828;
}

.page-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
}

.page-card {
    position: relative;
    padding: 12px;
    border: 2px solid #ddd;
    border-radius: 8px;
    background: #fff;
    cursor: grab;
    transition: border-color 0.15s, opacity 0.15s;
}

.page-card:hover {
    border-color: #999;
}

.page-card.is-dragging {
    opacity: 0.45;
}

.page-card img {
    display: block;
    width: 100%;
    height: 220px;
    object-fit: contain;
    background: #f5f5f5;
}

.page-card p {
    margin: 8px 0 0;
    color: #777;
    text-align: center;
    font-size: 13px;
}

.page-number {
    position: absolute;
    top: 18px;
    left: 18px;
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border-radius: 50%;
    background: #333;
    color: #fff;
    font-weight: bold;
}

.page-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8px;
}

.page-actions span {
    color: #888;
    font-size: 12px;
}

.page-actions button {
    width: 36px;
    height: 32px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
}

.page-actions button:disabled {
    cursor: default;
    opacity: 0.3;
}

.download-button {
    padding: 15px 26px;
    border: 0;
    border-radius: 5px;
    background: #555;
    color: #fff;
    font-size: 16px;
    cursor: pointer;
}

.download-area {
    position: fixed;
    z-index: 100;
    right: 0;
    bottom: 0;
    left: 0;
    padding: 20px 16px;
    border-top: 1px solid #ddd;
    background: rgba(255, 255, 255, 0.96);
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(6px);
}
.btn {
    padding: 20px 20px;
}
.download-button:disabled {
    cursor: wait;
    opacity: 0.6;
}

@media (max-width: 991px) {
    .page-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 767px) {
    .page-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
    }
    .page-card {
        padding: 8px;
    }
    .page-card img {
        height: 180px;
    }
    .page-number {
        top: 12px;
        left: 12px;
    }
}
</style>
