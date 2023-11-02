//var foreground = "33,33,33,1.0";
var newspan;
var oldoffset, newoffset;
var code, chapter, paragraph;
var parent;
var isTouchStart;
var isTouchMove;
var savedPageXOffset = 0;
var isVerticalTextMode = false;     // 縦書きモード（水平スクロール）か否か。
window.onscroll=scroll;

function setHorizontalMode()
{
    isVerticalTextMode = false;
}

function setVerticalMode()
{
    isVerticalTextMode = true;
}

function getWindowPageOffset()
{
    if (isVerticalTextMode) {
        // 縦書き・横スクロール（右上原点・左方向にー）
        return window.pageXOffset;
    } else {
        // 横書き・縦スクロール（左上原点・下方向に＋）
        return window.pageYOffset;
    }
}

// 横書き・縦スクロール時のみ使用
function savePageXOffset()
{
    if (isVerticalTextMode) {
        savedPageXOffset = window.pageXOffset;
    }
}

// 横書き・縦スクロール時のみ使用
function restorePageXOffset()
{
    if (isVerticalTextMode) {
        scrollTo(savedPageXOffset - 0.01, 0);        // XOffset == 0 の場合ちょっとずらさないとスクロールしてくれないので。
    }
}
/**
 * 恐らくここから下のtouchイベントをclickに変えれば良いはず。
 * だと信じて進む。
 * 何かあったら後から考えるべ。
 */

function touchstart(aCode, aChapter, aParagraph)
{
    window.location.href = "touchstart://";
    isTouchStart = true;
    oldoffset = getWindowPageOffset();
    code = aCode;
    chapter = aChapter;
    paragraph = aParagraph;
    newspan = document.getElementById( code + ":" + chapter + ":" + paragraph );
}

function touchmove()
{
    isTouchMove = true;
    window.location.href = "touchmove://";
}

function touchend(event)
{
    if (isTouchStart != true) {
        return;
    }
    // 引照や注のリンク（<a> タグ）をタップした場合、節選択状態を変えないようにする。
    if (event.target.tagName == "A") {
        isTouchStart = false;
        isTouchMove = false;
        event.preventDefault();
        window.location.href = event.target.href;
        return;
    }

    newoffset = getWindowPageOffset();
    // スクロールがない場合
    if (oldoffset == newoffset) {
        newspan.classList.toggle("selected");
        if (newspan.classList.contains("selected")) {
            window.location.href = "select://" + code + "/" + chapter + "/" + paragraph;
        } else {
            window.location.href = "deselect://" + code + "/" + chapter + "/" + paragraph;
        }
        if (!isTouchStart && !isTouchMove) {
            if ((isVerticalTextMode && isVerticalTextModeScrollEnd()) ||
                (!isVerticalTextMode && isHorizontalTextModeScrollEnd())) {
                window.location.href = "contentsend://";
            }
        }
        isTouchStart = false;
        isTouchMove = false;
    }
    // スクロールがあった場合
    else {
        isTouchStart = false;
        offsetcheck();
        isTouchMove = false;
    }
}

function touchcancel()
{
}

function deselectAll()
{
    var elms = document.getElementsByClassName("selected");
    for (var i = elms.length - 1; i >= 0 ; i--) {
        elms[i].classList.remove("selected");
    }
}

function scroll()
{
    newoffset = getWindowPageOffset();
    offsetcheck();
}

function calcOffset(divTag)
{
    var ofs = 0;

    if (isVerticalTextMode) {
        // newoffset は画面右端が 0 で左方向がー、offsetLeft は画面左端が 0 で右方向が＋。
        ofs = Math.abs( (document.body.clientWidth - (divTag.offsetLeft + divTag.clientWidth)) - Math.abs(newoffset) );
    } else {
        // newoffset, offsetTop ともに、画面上端が 0 で下方向が＋。
        ofs = Math.abs( divTag.offsetTop - newoffset );
    }
    return ofs
}

function offsetcheck()
{
    var nearest;
    var offset = 0;
    var divTags = document.getElementsByTagName("div");
    for (var i = 0; i < divTags.length ; i++) {
        var ofs = calcOffset(divTags[i]);
        if (i == 0) {
            offset = ofs;
            nearest = divTags[i];
        }
        if (ofs < offset) {
            offset = ofs;
            nearest = divTags[i];
        }
    }

    if (nearest.id) {
        // iOS8 の safari で ":" を含む URL 遷移が出来ないようなので "-" に置き換える。
        window.location.href = "currentposition://" + nearest.id.replace(/\:/g, "-") + "/";
    }

    if (!isTouchStart) {
        if ((isVerticalTextMode && isVerticalTextModeScrollEnd()) ||
            (!isVerticalTextMode && isHorizontalTextModeScrollEnd())) {
            window.location.href = "contentsend://";
        }
    }
}

function getParent()
{
    parent = document.getElementById("contents");
}

function newMTitle(code, chapter, paragraph, fontsize, align, extra)
{
    var newMTitleSpace = document.createElement("div");
    newMTitleSpace.setAttribute("style", "text-shadow:black 0px 0px 1px; text-align:left;");
    newMTitleSpace.innerHTML = "<br>";
    parent.appendChild(newMTitleSpace);
    var newMTitle = document.createElement("div");
    newMTitle.setAttribute("id", code + ":" + chapter + ":" + paragraph + ":mtitle");
    newMTitle.setAttribute("style", "font-size:" + fontsize + "pt; text-shadow:black 0px 0px 1px; text-align:" + align + ";");
    newMTitle.innerHTML = extra;
    parent.appendChild(newMTitle);
}

function newMComment(code, chapter, paragraph, align, extra)
{
    var newMComment = document.createElement("div");
    newMComment.setAttribute("id", code + ":" + chapter + ":" + paragraph + ":mcomment");
    newMComment.setAttribute("style", "text-align:" + align + ";");
    newMComment.innerHTML = extra + "<br>";
    parent.appendChild(newMComment);
}

function newSTitle(code, chapter, paragraph, align, extra)
{
    parent.appendChild(document.createElement("br"));
    parent.appendChild(document.createElement("br"));

    var newSTitle = document.createElement("div");
    newSTitle.setAttribute("class", "stitle_digit" + String(chapter).length);
    newSTitle.setAttribute("id", code + ":" + chapter + ":" + paragraph + ":stitle");
    newSTitle.setAttribute("style", "text-shadow:black 0px 0px 1px; text-align:" + align + ";");
    newSTitle.innerHTML = extra;
    parent.appendChild(newSTitle);
}

function newSComment(code, chapter, paragraph, align, extra)
{
    var newSComment = document.createElement("div");
    newSComment.setAttribute("id", code + ":" + chapter + ":" + paragraph + ":scomment");
    newSComment.setAttribute("style", "text-align:" + align + ";");
    newSComment.innerHTML = extra;
    parent.appendChild(newSComment);
}

function newFComment(code, chapter, paragraph, align, extra)
{
    var newFComment = document.createElement("div");
    newFComment.setAttribute("id", code + ":" + chapter + ":" + paragraph + ":fcomment");
    newFComment.setAttribute("style", "text-align:" + align + ";");
    newFComment.innerHTML = extra;
    parent.appendChild(newFComment);
}

function newChapter(code, chapter, paragraph, space, fontsize, width, height)
{
    if (space == 1) {
        var newChapterSpace = document.createElement("div");
        newChapterSpace.setAttribute("style", "text-shadow:black 0px 0px 1px; text-align:left;");
        newChapterSpace.innerHTML = "<br>";
        parent.appendChild(newChapterSpace);
    }
    var newChapter = document.createElement("div");
    newChapter.setAttribute("class", "chapter" + " chapter_digit" + String(chapter).length);
    newChapter.setAttribute("id", code + ":" + chapter + ":" + paragraph + ":chapter");
    newChapter.setAttribute("style", "font-size:" + fontsize + "pt; width:" + width + "px; height:" + height + "px;");
    newChapter.innerHTML = chapter;
    parent.appendChild(newChapter);
    parent.appendChild(document.createElement("br"));
    parent.appendChild(document.createElement("br"));
}

function newContentDiv(code, chapter, paragraph, color, html)
{
    var newContent = document.createElement("div");
    newContent.setAttribute("id", code + ":" + chapter + ":" + paragraph);
    newContent.setAttribute("ontouchstart","touchstart(" + code + "," + chapter + "," + paragraph + ");");
    newContent.setAttribute("class", color);
    newContent.innerHTML = html;
    parent.appendChild(newContent);
}

function setMarker(code, chapter, paragraph, color)
{
    var element = document.getElementById(code + ":" + chapter + ":" + paragraph);
    if (element.classList.contains("selected")) {
        element.className = color + " selected";
    } else {
        element.className = color;
    }
    element.classList.remove("selected")
}

function removeMarker(code, chapter, paragraph)
{
    var element = document.getElementById(code + ":" + chapter + ":" + paragraph);
    if (element.classList.contains("selected")) {
        element.className = "selected";
    } else {
        element.className = "";
    }
    element.classList.remove("selected")
}

function adoptMemoImage(code, chapter, paragraph, html)
{
    var element = document.getElementById(code + ":" + chapter + ":" + paragraph);
    element.innerHTML = html;
}

function gotoAction(ref)
{
    // スクロール以外の直接移動時は、選択状態解除。
    deselectAll();

    location.href = ref;
}

function isHorizontalTextModeScrollEnd()
{
    // 参考: https://ja.javascript.info/size-and-scroll-window
    // ブラウザ間の差異をカバーする
    // ページ全体の高さを取得する
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );

    // 一番下までスクロールした時の数値を取得(window.innerHeight分(画面表示領域分)はスクロールをしないため引く)
    const pageMostBottom = scrollHeight - window.innerHeight;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // iosはバウンドするので、無難に `>=` にする
    if (scrollTop >= pageMostBottom) {
        console.log('一番下までスクロールしました');
        return true;
    } else {
        console.log('まだ');
        return false;
    }
}

function isVerticalTextModeScrollEnd()
{
    // 参考: https://ja.javascript.info/size-and-scroll-window
    // ブラウザ間の差異をカバーする
    // ページ全体の高さを取得する
    const scrollWidth = Math.max(
      document.body.scrollWidth, document.documentElement.scrollWidth,
      document.body.offsetWidth, document.documentElement.offsetWidth,
      document.body.clientWidth, document.documentElement.clientWidth
    );

    // 一番下までスクロールした時の数値を取得(window.innerWidth分(画面表示領域分)はスクロールをしないため引く)
    const pageMostBottom = scrollWidth - window.innerWidth;

    const scrollTop = Math.abs(window.pageXOffset || document.documentElement.scrollTop);

    // iosはバウンドするので、無難に `>=` にする
    if (scrollTop >= pageMostBottom) {
        console.log('一番下までスクロールしました');
        return true;
    } else {
        console.log('まだ');
        return false;
    }
}

function noScroll(event)
{
    event.preventDefault();
}

function setScrollEnabled(enabled)
{
    if (enabled) {
        document.removeEventListener('touchmove', noScroll, { passive: false });
    } else {
        document.addEventListener('touchmove', noScroll, { passive: false });
    }
}
