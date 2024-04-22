const TIP_ID = "_quoteTip";
const SPEAKER_CLASS = "_speaker";
const MESSAGE_ID_PREFIX = "_messageId";

const BUTTON_ELEMENT = "li";
const BUTTON_TEXT = "クリップボードに引用";
const BUTTON_ID = "quotePartlyToClipboard";
const BUTTON_ROLE = "button";
const BUTTON_CLASS = "quoteTooltip__toTask"; // タスクに引用 のものを流用

function createQuoteText(text, aid, time) {
    return `[qt][qtmeta aid=${aid} time=${time}]${text}[/qt]`;
}

function getMessageTime(message) {
    return message.children[0].children[message.children[0].children.length - 1].getAttribute("data-tm");
}

function getMessageAid(message) {
    const messageId = message.getAttribute("id");
    if (message.children[0].children.length < 3) {
	const messageWithAid = document.evaluate(
	    `//div[@id="${messageId}"]/preceding-sibling::div[.//div[contains(@class, "${SPEAKER_CLASS}")]]`,
	    document,
	    null,
	    XPathResult.FIRST_ORDERED_NODE_TYPE
	).singleNodeValue;
	return messageWithAid.children[0].children[0].children[0].children[0].getAttribute("data-aid");
    } else {
	return message.children[0].children[0].children[0].children[0].getAttribute("data-aid");
	
    }
}

function quoteToClipboard() {
    const selection = window.getSelection();
    const text = selection.toString();
    const spanElement = selection.focusNode.parentElement;
    let messageRoot = spanElement.parentElement;
    // メッセージのルートエレメントまで遡る
    // infoの中などでどの深さに居るか変わるため
    while (!messageRoot.getAttribute("id")?.includes(MESSAGE_ID_PREFIX)) {
	messageRoot = messageRoot.parentElement;
    }
    const aid = getMessageAid(messageRoot);
    const time = getMessageTime(messageRoot);
    navigator.clipboard.writeText(createQuoteText(text, aid,time));
    // コピーした後はtipを消す
    const tip = document.getElementById(TIP_ID);
    tip.style.display = "none";
}


function addQuoteToClipboard() {
    const tip = document.getElementById(TIP_ID);
    const button = document.createElement(BUTTON_ELEMENT);
    button.textContent = BUTTON_TEXT;
    button.setAttribute("id", BUTTON_ID);
    button.setAttribute("role", BUTTON_ROLE);
    button.setAttribute("class", BUTTON_CLASS);
    button.addEventListener('click', quoteToClipboard);
    const container = tip.children[1];
    container.appendChild(button);
}

function main() {
    // Tipの中身が読み込めてなかったら1秒後にリトライ
    // Observer使いたいけどなんかエラー出るので後回し
    const tip = document.getElementById(TIP_ID);
    if (!tip || tip.children.length < 2 || tip.children[1].length < 2) {
	setTimeout(main, 1000);
	return;
    }
    addQuoteToClipboard();
}

main();
