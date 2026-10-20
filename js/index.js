
/*
 * PDF.jsを読み込む
 * PDFファイルを読み込んだり、ページを描画したりするためのライブラリ
 */
import * as pdfjsLib from "/pdfjs/build/pdf.mjs";

/*
 * PDF.jsが内部で使用するWeb Workerの場所を指定する
 * Workerは、メインの処理とは別にPDFの解析などを行う仕組み
 */
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "/pdfjs/build/pdf.worker.mjs";

/*
 * 表示するPDFファイルのURL
 * ここでは /pdf/linear-algebra.pdf を読み込む
 */
const url = "/math/9_29.pdf";

/*
 * HTMLから、PDFを表示するための要素を取得する
 * HTML側に <div id="pdf-container"></div> が必要
 */
const container = document.getElementById("pdf-container");

/*
 * PDFファイルを読み込む
 * getDocument(url) で読み込み処理を開始し、
 * promiseによって読み込み完了後にPDFの情報を取得する
 */
const pdf = await pdfjsLib.getDocument(url).promise;

/*
 * PDFの1ページ目から最終ページまで順番に処理する
 * pdf.numPages はPDFの総ページ数
 */
for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {

    /*
     * 現在のページの情報を取得する
     * PDF.jsではページ番号は1から始まる
     */
    const page = await pdf.getPage(pageNum);

    /*
     * ページの表示サイズなどを決める
     * scale: 1.5 は、基本サイズの1.5倍で描画するという意味
     */
    const viewport = page.getViewport({ scale: 1.5 });

    /*
     * ページを描画するためのcanvas要素を作成する
     * canvasは、文字や図形などを描画できるHTML要素
     */
    const canvas = document.createElement("canvas");

    /*
     * canvasに描画するための2D描画コンテキストを取得する
     */
    const context = canvas.getContext("2d");

    /*
     * canvas内部の描画領域の幅と高さを設定する
     * viewportに合わせることで、ページ全体を描画できる
     */
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    /*
     * CSSによる表示サイズの設定
     * 横幅を親要素の100%にし、高さは自動調整する
     */
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    /*
     * canvasをブロック要素として扱う
     * ページごとに改行されるようにする
     */
    canvas.style.display = "block";

    /*
     * 各ページの下に12pxの余白を設ける
     */
    canvas.style.marginBottom = "12px";

    /*
     * 作成したcanvasをHTMLの表示領域に追加する
     * これでページを描画する場所が画面上に用意される
     */
    container.appendChild(canvas);

    /*
     * PDFのページをcanvasに描画する
     * canvasContext: 描画先
     * viewport: ページのサイズや拡大率などの情報
     *
     * 描画が完了するまで待つ
     */
    await page.render({
        canvasContext: context,
        viewport: viewport
    }).promise;
}
