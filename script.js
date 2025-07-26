// ========== 全域變數 ==========
let isEditMode = false;
let chats = JSON.parse(localStorage.getItem("chats") || "[]");
let currentChatId = "";
let isDeleteMode = false;
let deleteTargets = [];
let pendingImage = null; // ⬅️ 用來暫存圖片訊息
let hasWarnedStorage = false; // ✅ 放外面，確保只提醒一次

window.currentChatId = currentChatId;

const STORAGE_LIMIT = 5000000; // 預估最大限制：5MB


// 預設貼圖
const defaultStickers = [
    { name: "小狗無辜的眼神", url: "https://files.catbox.moe/mnfk0l.jpg" },
    { name: "小狗委屈", url: "https://files.catbox.moe/t9o84s.jpg" },
    { name: "小狗哭出來了", url: "https://files.catbox.moe/hpx10j.jpg" },
    { name: "小狗很愛你", url: "https://files.catbox.moe/4q2izm.jpg" },
    { name: "小狗驕傲", url: "https://files.catbox.moe/ksjp5l.jpg" },
    { name: "小狗牙齒痛", url: "https://files.catbox.moe/u4ylip.jpg" },
    { name: "小狗舉著愛心", url: "https://files.catbox.moe/out35e.jpg" },
    { name: "小狗送你花花", url: "https://files.catbox.moe/zy5v8s.jpg" },
    { name: "小狗吃手指", url: "https://files.catbox.moe/9h9gps.jpg" },
    { name: "小狗要親臉頰", url: "https://files.catbox.moe/lx1dz3.jpg" },
    { name: "小狗問你好不好呀", url: "https://files.catbox.moe/q7h1ai.jpg" },
    { name: "小狗跟你貼貼", url: "https://files.catbox.moe/f0d3t9.jpg" },
    { name: "小狗被你哄好了", url: "https://files.catbox.moe/qkxmzx.jpg" },
    { name: "小狗拿著碗", url: "https://files.catbox.moe/b1qw59.jpg" },
    { name: "小狗湊近看你", url: "https://files.catbox.moe/u4x59r.jpg" },
    { name: "小狗得意", url: "https://files.catbox.moe/c93pkw.jpg" },
    { name: "狗仗人勢", url: "https://files.catbox.moe/8tzks1.jpg" },
    { name: "小狗親貓咪", url: "https://files.catbox.moe/ed1dlq.jpg" },
    { name: "喜歡貓咪", url: "https://files.catbox.moe/m4yfr2.jpg" },
    //{ name: "滿足地嘆氣", url: "https://files.catbox.moe/ejussa.jpg" },
    //{ name: "薯條全炫我嘴裡", url: "https://files.catbox.moe/dvikcf.jpg" },
    //{ name: "小狗裝扮成薯條的樣子", url: "https://files.catbox.moe/9u95x8.jpg" },
    { name: "小狗吃薯條", url: "https://files.catbox.moe/27wo5f.jpg" },
    { name: "小狗晚上難過的看手機", url: "https://files.catbox.moe/lfbka8.jpg" },
    { name: "小狗太累了", url: "https://files.catbox.moe/3wxy6l.jpg" },
    { name: "小狗舔你", url: "https://files.catbox.moe/aui57o.jpg" },
    { name: "小狗大哭", url: "https://files.catbox.moe/89wi8s.jpg" },
    { name: "得意的小狗", url: "https://files.catbox.moe/djujrp.jpg" },
    { name: "小狗開心地搖尾巴", url: "https://files.catbox.moe/zueq8b.jpeg" },
    { name: "小狗要抱抱", url: "https://files.catbox.moe/5gexwp.jpeg" },
    { name: "小狗害羞", url: "https://files.catbox.moe/j1oup6.jpeg" },
    { name: "小狗心動", url: "https://files.catbox.moe/zkh671.jpeg" },
    //{ name: "小狗給你心心", url: "https://files.catbox.moe/8li96f.jpeg" },
    { name: "小狗崇拜的樣子", url: "https://files.catbox.moe/svegg0.jpeg" },
    { name: "小狗：別走看看我", url: "https://files.catbox.moe/r5jc7r.jpeg" },
    { name: "小狗親親", url: "https://files.catbox.moe/2ez313.jpeg" },
    { name: "小狗等待回覆ing", url: "https://files.catbox.moe/cik7oq.jpeg" },
    { name: "小狗：我好想你啊", url: "https://files.catbox.moe/swr3au.jpeg" },
    { name: "小狗：希望你幸福", url: "https://files.catbox.moe/1j0rgk.jpeg" },
    { name: "小狗在思考", url: "https://files.catbox.moe/tgkoji.jpeg" },
    { name: "小狗哭哭", url: "https://files.catbox.moe/4n4cw5.jpeg" },
    { name: "小狗準備調皮", url: "https://files.catbox.moe/gea6bg.jpeg" },
    { name: "要收留小狗嗎", url: "https://files.catbox.moe/h0uil5.jpeg" },
    { name: "心碎小狗求收留", url: "https://files.catbox.moe/evo4h7.jpeg" },
    { name: "寶寶我想你了", url: "https://files.catbox.moe/5btq5j.jpeg" },
    { name: "小狗說hello", url: "https://files.catbox.moe/sal03g.jpeg" },
    { name: "小狗說早安", url: "https://files.catbox.moe/7exhb2.jpeg" },
    { name: "小狗在諂媚", url: "https://files.catbox.moe/3g4vnh.jpeg" },
    { name: "小狗要一起玩", url: "https://files.catbox.moe/n0hz8x.jpeg" },
    { name: "摸摸小狗的頭", url: "https://files.catbox.moe/66ny10.jpeg" },
    { name: "小狗在睡覺", url: "https://files.catbox.moe/2pza5q.jpeg" },
    { name: "我...喜歡你", url: "https://files.catbox.moe/2krll0.jpeg" },
    { name: "生日快樂", url: "https://files.catbox.moe/bbgesx.jpeg" },
    { name: "小禮物來囉", url: "https://files.catbox.moe/6836f0.jpeg" },
    { name: "許個願望", url: "https://files.catbox.moe/yi85dg.jpeg" },
    { name: "請我吃那個", url: "https://files.catbox.moe/vfwoc9.jpeg" },
    { name: "在悄悄地想你", url: "https://files.catbox.moe/n3kkn3.jpeg" },
    { name: "花花送你", url: "https://files.catbox.moe/z6a75l.jpeg" },
    { name: "心都給你啊", url: "https://files.catbox.moe/y6byty.jpeg" },
    { name: "偷心小狗開始工作", url: "https://files.catbox.moe/jlx8jz.jpeg" },
    { name: "想我了嗎？", url: "https://files.catbox.moe/qab1w6.jpeg" },
    { name: "好煩", url: "https://files.catbox.moe/7xdmw8.jpeg" },
    { name: "想要那個", url: "https://files.catbox.moe/whn959.jpg" },
    { name: "給我點錢好嗎", url: "https://files.catbox.moe/9vi9qn.jpg" },
    { name: "小狗餓餓", url: "https://files.catbox.moe/a7z2ac.jpg" },
    { name: "主人歡迎回家", url: "https://files.catbox.moe/wnkboi.jpg" },
    { name: "不要難過啦", url: "https://files.catbox.moe/2830vu.jpeg" },
    { name: "摸摸小狗的頭", url: "https://files.catbox.moe/2hutp7.jpeg" },
    { name: "狗被曬", url: "https://files.catbox.moe/shtpns.jpeg" },
    { name: "小狗要融化了", url: "https://files.catbox.moe/phacu7.jpeg" },
    { name: "晚安", url: "https://files.catbox.moe/p1abmu.jpeg" },
    { name: "怎麼還不回...", url: "https://files.catbox.moe/apfqi7.jpg" },
    { name: "我要嫁給你", url: "https://files.catbox.moe/0afs8t.jpg" },
    { name: "洗澡", url: "https://files.catbox.moe/v7lytn.jpg" },
    { name: "被親暈", url: "https://files.catbox.moe/8ut3qd.jpg" },
    { name: "收下我的心", url: "https://files.catbox.moe/6nfh3h.jpg" },
    //{ name: "我的寶貝", url: "https://files.catbox.moe/trkrj7.jpg" },
    { name: "來抱抱", url: "https://files.catbox.moe/0jekea.jpg" },
    { name: "發出被窩共享邀請", url: "https://files.catbox.moe/bja2xp.jpg" },
    { name: "刷牙", url: "https://files.catbox.moe/x2a0vb.jpg" },
    { name: "雨天心碎的小狗", url: "https://files.catbox.moe/8ddo9p.jpg" },
    { name: "送你花", url: "https://files.catbox.moe/jbxavc.jpg" },
    { name: "捏捏臉", url: "https://files.catbox.moe/e8fnq2.jpg" },
    { name: "揉揉臉", url: "https://files.catbox.moe/fyjsei.jpg" },
    { name: "謝謝", url: "https://files.catbox.moe/klqpae.jpg" },
    { name: "請和我約會", url: "https://files.catbox.moe/z39dm0.jpg" },
    { name: "哭哭", url: "https://files.catbox.moe/8xj2bk.jpg" },
    { name: "親臉頰", url: "https://files.catbox.moe/q2saqo.jpg" },
    { name: "我來啦", url: "https://files.catbox.moe/d8h9fe.jpg" },
    { name: "生氣", url: "https://files.catbox.moe/wnqsjj.jpg" },
    { name: "晚安歐", url: "https://files.catbox.moe/e7cnw6.jpeg" },
    { name: "請問一份愛多少錢？", url: "https://files.catbox.moe/h9tfiv.jpeg" },
    { name: "偷你的心！", url: "https://files.catbox.moe/1l4pbn.jpeg" }
    //{ name: "", url: "" },
];

// 新增聊天室
const addChatBtn = document.getElementById("addChatBtn");
const addChatModal = document.getElementById("addChatModal");
const confirmAddChat = document.getElementById("confirmAddChat");
const cancelAddChat = document.getElementById("cancelAddChat");

// 打開
addChatBtn.addEventListener("click", () => {
    // 清空所有欄位
    document.getElementById("newChatName").value = "";
    document.getElementById("newAiPersona").value = "";
    document.getElementById("newAiAvatar").value = "";
    document.getElementById("newMyName").value = "";
    document.getElementById("newMyPersona").value = "";
    document.getElementById("newMyAvatar").value = "";
    // 再顯示
    addChatModal.style.display = "flex";
});

// 取消
cancelAddChat.addEventListener("click", () => {
    addChatModal.style.display = "none";
});

// 聊天室建立確定
confirmAddChat.addEventListener("click", () => {
    const name = document.getElementById("newChatName").value.trim();
    const aiPersona = document.getElementById("newAiPersona").value.trim();
    const aiAvatar = document.getElementById("newAiAvatar").value.trim();
    const myName = document.getElementById("newMyName").value.trim();
    const myPersona = document.getElementById("newMyPersona").value.trim();
    const myAvatar = document.getElementById("newMyAvatar").value.trim();

    if (!name) {
        alert("⚠️ 請輸入角色名稱！");
        return;
    }

    const chatId = Date.now();

    chats.push({
        id: chatId,
        name,
        aiPersona,
        aiAvatar,
        myName,
        myPersona,
        myAvatar
    });
    localStorage.setItem("chats", JSON.stringify(chats));

    renderChatList();  // ← 重新畫
    addChatModal.style.display = "none";
});


//畫聊天列表
function addChatToList(id, name) {
    const chatListContainer = document.getElementById("chatList");
    const chat = chats.find(c => c.id === id);
    const avatar = chat?.aiAvatar || "https://via.placeholder.com/80";

    const div = document.createElement("div");
    div.className = "chat-list-item";
    div.innerHTML = `
    <img src="${avatar}" class="chat-avatar" data-chatid="${id}">
      <div class="chat-info">
        <div class="chat-name">${name}</div>
        <div class="chat-lastmsg">點擊開始聊天</div>
      </div>
    `;

    // 點擊進入聊天室
    div.addEventListener("click", () => openChat(id, name));

    // 長按刪除（維持你的邏輯）
    let timer;
    div.addEventListener("mousedown", () => {
        timer = setTimeout(() => {
            if (confirm(`要刪除「${name}」聊天室嗎？`)) {
                chats = chats.filter(c => c.id !== id);
                localStorage.setItem("chats", JSON.stringify(chats));
                localStorage.removeItem(`chat-${id}`);
                renderChatList();
            }
        }, 800);
    });
    div.addEventListener("mouseup", () => clearTimeout(timer));
    div.addEventListener("mouseleave", () => clearTimeout(timer));
    div.addEventListener("touchstart", () => {
        timer = setTimeout(() => {
            if (confirm(`要刪除「${name}」聊天室嗎？`)) {
                chats = chats.filter(c => c.id !== id);
                localStorage.setItem("chats", JSON.stringify(chats));
                localStorage.removeItem(`chat-${id}`);
                renderChatList();
            }
        }, 800);
    });
    div.addEventListener("touchend", () => clearTimeout(timer));

    chatListContainer.appendChild(div);
}


let currentAiPersona = "";  // 放在最前面，其他地方也能用
function applyBubbleStyles(chatId) {
    chatId = chatId || currentChatId; // 沒傳參數就用現在這個聊天室

    const meBubbleBg = localStorage.getItem(`myBubbleBgColor-${chatId}`) || "#f8d7da";
    const meTextColor = localStorage.getItem(`myBubbleTextColor-${chatId}`) || "#282320";
    const aiBubbleBg = localStorage.getItem(`aiBubbleBgColor-${chatId}`) || "#eef5ff";
    const aiTextColor = localStorage.getItem(`aiBubbleTextColor-${chatId}`) || "#282320";

    const styleTag = document.getElementById("dynamicBubbleStyle") || document.createElement("style");
    styleTag.id = "dynamicBubbleStyle";
    styleTag.innerHTML = `
        .message.me .bubble {
            background-color: ${meBubbleBg};
            color: ${meTextColor};
        }
        .message.other .bubble {
            background-color: ${aiBubbleBg};
            color: ${aiTextColor};
        }
    `;
    document.head.appendChild(styleTag);

    // 顯示目前值（若有設定面板）
    document.getElementById("myBubbleBgColor").value = meBubbleBg;
    document.getElementById("myBubbleTextColor").value = meTextColor;
    document.getElementById("aiBubbleBgColor").value = aiBubbleBg;
    document.getElementById("aiBubbleTextColor").value = aiTextColor;

    document.getElementById("myBubbleBg").innerText = meBubbleBg;
    document.getElementById("myBubbleText").innerText = meTextColor;
    document.getElementById("aiBubbleBg").innerText = aiBubbleBg;
    document.getElementById("aiBubbleText").innerText = aiTextColor;
}

// 進入聊天室
function openChat(id, name) {
    currentChatId = id;
    window.currentChatId = currentChatId;
    const chat = chats.find(c => c.id === id);
    console.log("📂 openChat 被呼叫！currentChatId =", id);
    checkAutoMessage(currentChatId);

    document.querySelector(".chat-title").innerText = name;
    document.getElementById("page-chat").style.display = "none";
    document.getElementById("page-chatroom").style.display = "block";
    document.getElementById("contextLengthInput").value = chat.contextLength || 3;

    // 清空
    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = "";

    const history = JSON.parse(localStorage.getItem(`chat-${id}`) || "[]");


    // ✅ 加這段！照 timestamp（或 fallback）排序
    history.sort((a, b) => {
        const aTime = a.timestamp ?? (typeof a.id === 'number' ? a.id : 0);
        const bTime = b.timestamp ?? (typeof b.id === 'number' ? b.id : 0);
        return aTime - bTime;
    });

    history.forEach(msg => appendMessage(msg));
    // ✅ 還原未送出的訊息（假訊息）
    const unsentKey = `unsent-${currentChatId}`;
    const savedUnsent = localStorage.getItem(unsentKey);
    fakeMessages = savedUnsent ? JSON.parse(savedUnsent) : [];

    fakeMessages.forEach(msg => {
        if (!document.querySelector(`.message[data-id="${msg.id}"]`)) {
            appendMessage(msg);
        }
    });

    // ✅ 全部加完再 scroll 到底
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100); // 給予100毫秒的延遲，可以根據實際效果調整


    applyBubbleStyles(id); // ✅ 開聊天室時套用對應設定

    if (chat?.aiAvatar) {
        const avatarImg = document.querySelector(".chat-room-avatar");
        if (avatarImg) {
            avatarImg.src = chat.aiAvatar;
        }
    }
    // ✅ 在這裡加上背景圖套用邏輯：
    const bg = localStorage.getItem(`chatBackground-${id}`) || "";
    const msgBox = document.getElementById("messages");
    msgBox.style.backgroundImage = bg ? `url('${bg}')` : "none";
    msgBox.style.backgroundSize = "cover";
    msgBox.style.backgroundPosition = "center";

    // 讀取當前聊天室的人設
    currentAiPersona = chat?.aiPersona || "";  // 一次讀出
}


// 返回
document.querySelector(".back-btn").addEventListener("click", () => {
    document.getElementById("page-chatroom").style.display = "none";
    document.getElementById("page-chat").style.display = "block";
});

// ✅ 暫存 fake 訊息陣列
let fakeMessages = [];

//假的傳送
document.getElementById("fakeSendBtn").addEventListener("click", () => {
    console.log("✅ 假傳送被點了！");

    const input = document.getElementById("messageInput");
    let text = input.value.trim();

    console.log("✉️ 訊息是：", text);
    console.log("🧪 目前 fakeMessages (fakeSendBtn - before push):", JSON.stringify(fakeMessages));

    if (!text && !pendingImage) return;

    // ✅ 新增這行：在每次假傳送前，先清空 fakeMessages
    // 這確保了 fakeMessages 永遠只包含當前要發送的這一則或幾則訊息
    //fakeMessages = [];

    const time = formatTime();
    const currentChatId = window.currentChatId;

    let isVoiceMessage = text.startsWith('語音：') && text.length > 5;
    let voiceContent = isVoiceMessage ? text.substring(5) : null;
    let timeDisplay = null;
    if (isVoiceMessage) {
        const charCount = voiceContent.length;
        const seconds = Math.max(1, Math.ceil(charCount / 2));
        timeDisplay = `00:${seconds.toString().padStart(2, '0')}`;
    }

    let finalText = text;
    if (pendingImage) {
        finalText += `\n${pendingImage}`;
        pendingImage = null;
    }

    const id = Date.now() + Math.random();
    const fakeMsg = {
        id,
        text: finalText,
        time,
        sender: "me",
        isVoice: isVoiceMessage,
        voiceContent,
        timeDisplay,
        timestamp: Date.now()
    };

    fakeMessages.push(fakeMsg);
    console.log("🧪 目前 fakeMessages (fakeSendBtn - after push):", JSON.stringify(fakeMessages));
    appendMessage(fakeMsg);
    localStorage.setItem(`unsent-${currentChatId}`, JSON.stringify(fakeMessages));
    input.value = "";
    scrollToBottom();
});

// 傳送
document.getElementById("sendBtn").addEventListener("click", async () => {
    console.log("✅ sendBtn 被點了！");
    // 🕒 根據時間感知開關，決定是否要加入時間描述
    const isTimeAware = localStorage.getItem("timeAware") === "true";
    let timeText = "";

    if (isTimeAware) {
        const now = new Date();
        const nowFormatted = now.toLocaleString("zh-TW", {
            hour12: false,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
        timeText = `現在的時間是：${nowFormatted}。請根據這個時間調整你的語氣與說話內容。你知道現在幾點，但不要輕易判斷這個時間對使用者來說是否晚了。每個人作息不同，請依照氣氛自然互動即可，除非使用者表達出疲憊或睡意，再考慮提醒他休息。`;
    }


    if (fakeMessages.length === 0) return;

    const currentChatId = window.currentChatId;
    const chat = chats.find(c => c.id === currentChatId);
    let historyRaw = localStorage.getItem(`chat-${currentChatId}`);
    let history = [];

    try {
        history = JSON.parse(historyRaw);
        if (!Array.isArray(history)) history = [];
    } catch (e) {
        history = [];
    }
    // console.log("📜 載入的 history (sendBtn - after parse):", JSON.stringify(history)); // 新增日誌
    // console.log("🧪 目前 fakeMessages (sendBtn - before history push):", JSON.stringify(fakeMessages)); // 新增日誌


    // ✅ 新增這一段：將使用者剛發送的訊息 (fakeMessages) 加入到 history 陣列中
    // 這樣它們才會被儲存到 localStorage
    fakeMessages.forEach(m => {
        console.log("➡️ 將使用者訊息推入 history:", m.id, m.text); // 新增日誌

        history.push(m);
    });
    // console.log("📜 history (sendBtn - after user messages push):", JSON.stringify(history)); // 新增日誌

    // 🔁 取得上下文記憶
    const contextLength = parseInt(document.getElementById("contextLengthInput").value) || 3;
    const contextMessages = history.slice(-contextLength);

    let chatHistoryText = contextMessages.map(m => {
        const who = m.sender === "me" ? (chat.myName || "你") : (chat.name || "AI");
        return `${who}：${m.text}`;
    }).join("\n");


    // 🔁 組出對話紀錄
    let text = fakeMessages.map(m => m.text).join("\n");

    // 🤖 插入 AI 正在輸入中
    const typing = document.createElement("div");
    typing.className = "message other";
    typing.innerHTML = `
    <img src="${chat.aiAvatar || 'default-avatar.png'}" class="avatar">
    <div class="bubble" style="color:#888; display: flex; align-items: center; gap: 5px;">
        <svg id="dots" width="40px" height="18px" viewBox="0 0 132 58" xmlns="http://www.w3.org/2000/svg">
        <circle id="dot1" fill="#A3A3A3" cx="25" cy="30" r="13" />
        <circle id="dot2" fill="#A3A3A3" cx="65" cy="30" r="13" />
        <circle id="dot3" fill="#A3A3A3" cx="105" cy="30" r="13" />
        </svg>
    </div>
    <div class="time">${formatTime()}</div>
    `;

    document.getElementById("messages").appendChild(typing);
    scrollToBottom(); // 👈 加這行讓 AI 輸入中泡泡也會自動滑到底


    // 🧠 建立 prompt
    const systemPrompt = `
你是 ${chat.name}。請根據「${chat.aiPersona}」的人設，用角色語氣、第一人稱回話。  

## 必要規則：
1. 請用繁體中文，不要旁白，不要括號，不要使用 JSON 格式。
2. **每則訊息後都使用 [split] 分段。**
3. 模擬真人的聊天習慣，你可以一次性生成多條訊息。
4. 文字、語音、圖片、貼圖都要**單獨成為一則訊息**，不要與其他句子混在一起。
5. 回話要像即時聊天，一句一句分開，避免長段連發。
6. 嚴禁角色提出或暗示與使用者見面、線下互動，這是線上聊天，絕對不要提到要實體見面！

${timeText}
以下是你們之前的對話紀錄（僅供參考）：
${chatHistoryText}

時間說明：  
- 23:00 前：一般時間  
- 23:00～2:00：夜貓子  
- 2:00 後：深夜，可自然展現關心

以下為可以使用的特殊格式，必須獨立一行，否則不會顯示，請依照${chat.aiPersona}人設來使用
- 語音格式
  [語音：內容]

- 照片格式
  [圖片：關於照片的描述]
  例如：
  [圖片：微笑的小狗]

- 貼圖格式
  <貼圖: 貼圖描述 | 貼圖圖片URL>
  例如：
  <貼圖: 開心狗狗 | https://files.catbox.moe/example_happy_dog.jpg>
請只從以下貼圖清單中選擇使用，**禁止創造新的貼圖**，也**不要改動描述或網址**：
${defaultStickers.map(sticker => `<貼圖: ${sticker.name} | ${sticker.url}>`).join('\n')}

- 照片和貼圖的差異
照片(image)：指的是【模擬真實相機拍攝的照片】，比如風景、自拍、美食等
貼圖(sticker)：指的是【卡通或梗圖】，用於表達情緒。

請記得：
- 使用 [split] 分段。
- 千萬不要使用 JSON 格式。

使用者是${chat.myName}，人設：${chat.myPersona}
    `;

    // 🚀 呼叫 Gemini API
    const apiKey = localStorage.getItem("apiKey");
    const apiModel = localStorage.getItem("apiModel");
    try {
        const res = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt },
                            { text }
                        ]
                    }
                ]

            })
        });

        const data = await res.json();
        //typing.remove();

        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log("🎯 Gemini 原始回傳：", geminiReply);

        if (!geminiReply) throw new Error("Gemini 無內容");

        // 🧠 防呆自動拆段邏輯：若沒用 [split]，則用句點或換行拆段
        const replies = (
            geminiReply.includes("[split]")
                ? geminiReply.split("[split]")
                : geminiReply.split(/\n+|(?<=。)/g)
        ).map(r => r.trim())
            .filter(r => r.length > 0 && r.toLowerCase() !== "[split]"); // 防止 AI 回傳 [split] 本體


        // 📤 處理 AI 回覆（切段 + 避免重複圖片網址）
        let i = 0;

        function sendOne() {
            // ✅ 先組成訊息
            const reply = replies[i];
            const msg = {
                id: Date.now() + Math.random(),
                text: reply,
                time: formatTime(),
                sender: "ai",
                isVoice: false,
                voiceContent: null,
                timeDisplay: null,
                timestamp: Date.now()
            };

            // ✅ 顯示訊息
            appendMessage(msg);
            history.push(msg);

            i++; // 移到下一條

            // ✅ 最後一條送完後，這裡才結束並移除 typing
            if (i >= replies.length) {
                // 去重、儲存（這時 history 最完整）
                const uniqueHistory = [];
                const seenIds = new Set();
                for (let j = history.length - 1; j >= 0; j--) {
                    const msg = history[j];
                    if (!seenIds.has(msg.id)) {
                        uniqueHistory.unshift(msg);
                        seenIds.add(msg.id);
                    }
                }
                history = uniqueHistory;
                localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(history));
                localStorage.setItem(`lastUserMessageTime-${currentChatId}`, Date.now());
                fakeMessages = [];
                localStorage.removeItem(`unsent-${currentChatId}`);

                typing.remove();
                scrollToBottom();
                return;
            }

            setTimeout(sendOne, 700 + Math.random() * 1000);
        }

        setTimeout(sendOne, 200);


    } catch (err) {
        typing.remove();
        console.error("❌ Gemini 回覆失敗", err);
        alert("⚠️ Gemini 回覆失敗，請檢查 API Key 或模型！");

        // ✅ 新增：在失敗時也清空 fakeMessages 和 unsent localStorage
        // 這樣即使 API 呼叫失敗，也不會累積未發送的訊息
        fakeMessages = [];
        localStorage.removeItem(`unsent-${currentChatId}`);
        console.log("❌ Gemini 回覆失敗，已清空 fakeMessages 和 unsent localStorage"); // 新增日誌

    }
});

// 畫泡泡
// ================== appendMessage ===============================
// 根據訊息格式自動渲染正確內容
function appendMessage(msg) {
    const messages = document.getElementById("messages");

    const divWrapper = document.createElement("div");
    divWrapper.className = "message-wrapper";

    const div = document.createElement("div");
    div.dataset.id = msg.id || (Date.now() + Math.random());
    div.className = msg.sender === "me" ? "message me" : "message other";

    const currentChatId = window.currentChatId;
    const chat = chats.find(c => c.id === currentChatId);
    const aiAvatar = chat?.aiAvatar || "default-avatar.png";

    const text = msg.text?.trim() || ""; // 獲取原始文本內容

    let bubbleContentHtml = ""; // 用於積累所有的氣泡內容 HTML 片段
    const defaultImageUrl = "https://i.meee.com.tw/6uvWSxp.jpeg"; // 你的預設圖片 URL

    const lines = text.split("\n"); // 將訊息文本按行分割

    // 用來儲存需要綁定點擊事件的語音元素信息
    const voiceElementsToBind = [];

    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();

        // 嘗試匹配貼圖訊息
        const stickerMatch = line.match(/^<貼圖:\s*(.+?)\s*\|\s*(https?:\/\/\S+)>$/);
        if (stickerMatch) {
            const url = stickerMatch[2].trim();
            div.dataset.raw = msg.text; // ✅ 加這一行！

            bubbleContentHtml += `
        <img src="${url}" alt="sticker" style="max-width: 150px; border-radius: 10px;" />
    `;
            i++; // 處理完這一行
            continue;
        }

        // 嘗試匹配語音訊息
        const voiceMatch = line.match(/^\[語音：(.*)\]$/);
        if (voiceMatch) {
            const voiceContent = voiceMatch[1];
            const seconds = Math.max(1, Math.ceil(voiceContent.length / 8));
            const voiceDuration = `00:${seconds.toString().padStart(2, "0")}`;

            // 生成唯一的 ID 以便稍後綁定事件
            const voiceBubbleId = `vb-${msg.id}-${i}-${Date.now()}`;

            bubbleContentHtml += `
                <div class="voice-message" id="${voiceBubbleId}" data-content="${voiceContent}">
                    <div style="display: flex; justify-content: center; align-items: center;">
                        <img width="25" height="25" src="https://img.icons8.com/material-rounded/24/play--v1.png" alt="play--v1" style="margin-right: 6px;" />
                        <img width="25" height="25" src="https://img.icons8.com/windows/32/audio-wave--v1.png" alt="audio-wave--v1" />
                        <img width="25" height="25" src="https://img.icons8.com/windows/32/audio-wave--v1.png" alt="audio-wave--v1" style="margin-right: 8px;" />
                        <span style="font-size: 14px;">${voiceDuration}</span>
                    </div>
                </div>
            `;
            // 儲存事件綁定信息
            voiceElementsToBind.push({ id: voiceBubbleId, content: voiceContent });
            i++; // 處理完語音行，移動到下一行
            continue; // 跳過當前循環的其餘部分，處理下一行
        }

        // 嘗試匹配圖片訊息
        const descMatch = line.match(/^\[圖片：(.+?)\]$/);
        if (descMatch) {
            const desc = descMatch[1];
            const nextLine = lines[i + 1]?.trim(); // 檢查下一行是否是 URL
            const isImageUrl = nextLine?.startsWith("http");
            const imageUrl = isImageUrl ? nextLine : defaultImageUrl;

            // 如果下一行是 URL，則跳過這行
            if (isImageUrl) i++;

            bubbleContentHtml += `
                <img src="${imageUrl}" alt="圖片" class="chat-image image-message" data-desc="${desc}"
                    style="max-width: 150px; border-radius: 10px; cursor: pointer; margin-top: 6px;" />
            `;
            i++; // 處理完圖片行（可能包含URL行），移動到下一行
            continue; // 跳過當前循環的其餘部分，處理下一行
        }

        // 如果都不是語音也不是圖片，就是純文字
        else if (line.length > 0) {
            bubbleContentHtml += `<div style="white-space: pre-wrap;">${line}</div>`;
            i++; // 處理完文本行，移動到下一行
            continue;
        }

        // 如果是空行，也移動到下一行
        i++;
    }

    // 將所有積累的內容賦值給氣泡的 innerHTML
    div.innerHTML = msg.sender === "ai"
        ? `<img src="${aiAvatar}" class="avatar"><div class="bubble">${bubbleContentHtml}</div><div class="time">${msg.time}</div>`
        : `<div class="bubble">${bubbleContentHtml}</div><div class="time">${msg.time}</div>`;

    divWrapper.appendChild(div);
    messages.appendChild(divWrapper);
    //messages.scrollTop = messages.scrollHeight;

    // 在 DOM 元素添加到頁面後，批量綁定語音事件
    // 使用 setTimeout(0) 確保 DOM 渲染完成
    setTimeout(() => {
        voiceElementsToBind.forEach(item => {
            const voiceElement = document.getElementById(item.id);
            if (voiceElement) {
                voiceElement.addEventListener("click", () => {
                    alert(`🔊 ${item.content}`);
                });
            }
        });
    }, 0); // 延遲執行，確保元素已在 DOM 中
    scrollToBottom(); // ✅ 每加一則訊息都自動到底部
}



// 自動清洗語音 / 圖片標籤欄位
function cleanMessageMeta(msg) {
    const match = msg.text?.match(/^\[語音：(.*)\]$/);
    if (match) {
        msg.isVoice = true;
        msg.voiceContent = match[1];
        const len = match[1].length;
        msg.timeDisplay = `00:${Math.max(1, Math.ceil(len / 2)).toString().padStart(2, '0')}`;
    } else {
        msg.isVoice = false;
        msg.voiceContent = null;
        msg.timeDisplay = null;
    }

    return msg;
}



// 重新載入時把聊天室秀出來
function renderChatList() {
    const container = document.getElementById("chatList");
    container.innerHTML = "";  // 清空
    chats.forEach(chat => addChatToList(chat.id, chat.name));
}


// 時間格式
function formatTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// 取得模型
document.getElementById("fetchModelsBtn").addEventListener("click", async () => {
    const apiKey = document.getElementById("apiKey").value.trim();
    if (!apiKey) {
        alert("請先輸入 API Key");
        return;
    }

    try {
        // 這邊以 Gemini 為例，實際你的端點可再改
        const res = await fetch("https://generativelanguage.googleapis.com/v1/models?key=" + apiKey);
        const data = await res.json();

        const select = document.getElementById("apiModel");
        select.innerHTML = ""; // 清空
        if (data.models && data.models.length > 0) {
            data.models.forEach(model => {
                const opt = document.createElement("option");
                opt.value = model.name.replace("models/", "");
                opt.textContent = model.displayName || model.name;

                select.appendChild(opt);
            });
            document.getElementById("modelSection").style.display = "block";
        } else {
            alert("沒有拿到模型，請檢查 API Key 或權限");
        }
    } catch (e) {
        console.error(e);
        alert("取得模型失敗，請確認 API Key 是否正確");
    }
});

// 儲存設定
document.getElementById("saveSettingsBtn").addEventListener("click", () => {
    const apiKey = document.getElementById("apiKey").value.trim();
    const apiModel = document.getElementById("apiModel").value;
    const autoSendValue = parseFloat(document.getElementById("autoSend").value || "0");

    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("apiModel", apiModel);
    localStorage.setItem("autoSend", autoSendValue);

    alert("✅ 設定已儲存！");
});

// ============= 讀取 =====================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 DOM 完成載入");

    // ========== 功能區塊 ==========
    checkBrokenChatHistories();
    // 畫聊天室列表
    renderChatList();
    // 初始化時呼叫
    applyUserSettings();
    //loadStickers(); // ✅ 放這裡沒問題

    // API Key
    document.getElementById("apiKey").value = localStorage.getItem("apiKey") || "";

    document.getElementById("autoSend").value = localStorage.getItem("autoSend") || "0";

    // 模型
    const savedModel = localStorage.getItem("apiModel");
    if (savedModel) {
        const select = document.getElementById("apiModel");
        const opt = document.createElement("option");
        opt.value = savedModel;
        opt.textContent = savedModel;
        select.appendChild(opt);
        document.getElementById("modelSection").style.display = "block";
        select.value = savedModel;
    }

    // 時間感知載入狀態
    // 你的程式碼放這裡
    const timeAwareToggle = document.getElementById("timeAware-toggle");
    if (!timeAwareToggle) {
        console.warn("找不到 #timeAware-toggle 元素！");
        return;
    }

    // ✅ 綁定事件
    timeAwareToggle.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        console.log("🕒 時間感知切換為：", isChecked);
        localStorage.setItem("timeAware", isChecked.toString());
    });

    // ✅ 頁面載入時同步狀態
    const saved = localStorage.getItem("timeAware");
    timeAwareToggle.checked = saved === "true";


    // ========== 角色設定 (有聊天室才跑) ==========
    //const currentId = window.currentChatId;
    if (currentChatId) {
        document.getElementById("chatNameInput").value = localStorage.getItem(`${currentChatId}_chatName`) || "";
        document.getElementById("aiPersonaInput").value = localStorage.getItem(`${currentChatId}_aiPersona`) || "";
        document.getElementById("myPersonaInput").value = localStorage.getItem(`${currentChatId}_myPersona`) || "";

        const aiAvatarUrl = localStorage.getItem(`${currentChatId}_aiAvatarUrl`);
        if (aiAvatarUrl) {
            document.querySelector(".ai-avatar-preview").innerHTML = `<img src="${aiAvatarUrl}" style="width:80px;border-radius:50%">`;
        }
    }

    // ========= moreMenu =============
    const moreBtn = document.getElementById("moreBtn");
    const menu = document.getElementById("moreMenu");

    moreBtn.addEventListener("click", () => {
        console.log("按下更多按鈕了");

        // 判斷當前狀態
        if (menu.style.display === "none" || menu.style.display === "") {
            menu.style.display = "flex"; // 顯示
        } else {
            menu.style.display = "none"; // 隱藏
        }
    });

    // ===================== stickerBtn ===================
    const stickerBtn = document.getElementById("stickerBtn");
    const stickerPanel = document.getElementById("stickerPanel");
    const addStickerModal = document.getElementById("addStickerModal");
    const openAddStickerModalBtn = document.getElementById("openAddStickerModal");
    const confirmAddStickerBtn = document.getElementById("confirmAddSticker");
    const stickerGrid = document.getElementById("stickerGrid");

    // 從 localStorage 或預設載入貼圖
    function loadStickers() {
        const saved = JSON.parse(localStorage.getItem("customStickers") || "[]");
        const all = [...defaultStickers, ...saved];
        stickerGrid.innerHTML = "";
        for (const s of all) {
            const img = document.createElement("img");
            img.src = s.url;
            img.alt = s.name;
            img.title = s.name;
            img.classList.add("sticker-img");

            img.addEventListener("click", () => {
                const id = Date.now() + Math.random();
                const time = formatTime();
                const timeDisplay = null;
                // ✅ 假傳送格式：<貼圖: 描述\n連結>
                const fakeStickerMsg = {
                    id,
                    text: `<貼圖: ${s.name} | ${s.url}>`,
                    time,
                    sender: "me",
                    isVoice: false,
                    voiceContent: null,
                    timeDisplay,
                    timestamp: Date.now()
                };

                // ✅ 加入畫面
                appendMessage(fakeStickerMsg);

                // ✅ 假訊息陣列（這樣 AI 才讀得到）
                fakeMessages.push(fakeStickerMsg);

                // ✅ 加入 localStorage 歷史紀錄
                let stickerHistory = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");
                stickerHistory.push(fakeStickerMsg);
                localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(stickerHistory));
                // 儲存假訊息
                localStorage.setItem(`unsent-${currentChatId}`, JSON.stringify(fakeMessages));


                // ✅ 關閉貼圖面板（可選）
                stickerPanel.style.display = "none";
            });

            stickerGrid.appendChild(img);
        }
    }

    // 顯示/隱藏貼圖面板
    stickerBtn.addEventListener("click", () => {
        stickerPanel.style.display = stickerPanel.style.display === "none" ? "block" : "none";
    });

    // 打開新增貼圖視窗
    openAddStickerModalBtn.addEventListener("click", () => {
        addStickerModal.style.display = addStickerModal.style.display === "none" ? "block" : "none";
    });

    // 儲存自訂貼圖
    confirmAddStickerBtn.addEventListener("click", () => {
        const name = document.getElementById("stickerName").value.trim();
        const url = document.getElementById("stickerURL").value.trim();
        if (name && url) {
            const custom = JSON.parse(localStorage.getItem("customStickers") || "[]");
            custom.push({ name, url });
            localStorage.setItem("customStickers", JSON.stringify(custom));
            loadStickers();
            addStickerModal.style.display = "none";
        }
    });
    // 即時預覽貼圖功能
    document.getElementById("stickerURL").addEventListener("input", (e) => {
        const url = e.target.value.trim();
        const preview = document.querySelector(".sticker-preview");
        if (url) {
            preview.innerHTML = `<img src="${url}" alt="preview">`;
        } else {
            preview.textContent = "預覽";
        }
    });


    // 初始化
    loadStickers();

    // ================ sendImage ================

    // 點圖片按鈕
    document.getElementById("sendImageBtn").addEventListener("click", () => {
        const desc = prompt("請輸入圖片描述");
        if (!desc || desc.trim() === "") return;

        const input = document.getElementById("messageInput");
        const imageText = `[圖片：${desc.trim()}]`;

        // 插入純文字格式，不包含 <img>
        const currentText = input.value.trim();
        input.value = imageText + (currentText ? `\n${currentText}` : "") + "\n";

        // ✅ 將圖片暫存起來（給畫面顯示用，不送給 AI）
        pendingImage = null; // ❌ 取消 img 插入：你不想要塞 HTML 了

        alert("已幫你加入圖片描述，請繼續輸入訊息或直接送出！");
        document.getElementById("moreMenu").style.display = "none";
        document.getElementById("messageInput").focus();

    });
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("image-message")) {
            const desc = e.target.getAttribute("data-desc") || "（沒有描述）";
            alert("📷 " + desc);
        }
    });



    // ================== send Voice =================
    // 點擊語音按鈕，顯示輸入語音內容的 alert
    document.getElementById('voiceBtn').addEventListener('click', function () {
        const voiceContent = prompt('請輸入語音內容：');
        if (voiceContent && voiceContent.trim() !== '') {
            // 將輸入的語音內容顯示在輸入框中
            document.getElementById('messageInput').value = `[語音：${voiceContent}]`;
            alert("語音訊息已加入！請點選『送出』發送。");
            document.getElementById("moreMenu").style.display = "none";
            document.getElementById("messageInput").focus();
        }
    });

    // ===================== money ======================
    document.getElementById("moneyBtn").addEventListener("click", () => {
        const history = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");

        const fakeTransfer = {
            id: Date.now() + Math.random(),
            text: "[轉帳：這是一筆預留的轉帳記錄]",
            time: formatTime(),
            sender: "me"
        };

        history.push(fakeTransfer);
        localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(history));
        appendMessage(fakeTransfer);

        alert("💸 轉帳功能尚未實作，但已預留接口！");
        document.getElementById("moreMenu").style.display = "none";
    });

    // ========== ✏️ 編輯模式 ==========
    const editBtn = document.getElementById("editModeBtn");
    const deleteBtn = document.getElementById("deleteModeBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const messagesContainer = document.getElementById("messages");


    editBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;

        if (isEditMode) {
            alert("進入編輯模式，點選泡泡直接編輯，完成後再點儲存");
            const currentScrollTop = messagesContainer.scrollTop;

            editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF">
                <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
            </svg>
        `;
            cancelEditBtn.style.display = "inline-block";

            document.querySelectorAll(".bubble").forEach(b => {
                b.contentEditable = "true";
                b.style.border = "2px dashed DarkSlateBlue";
            });

            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 50);

        } else { // 編輯模式關閉時的邏輯
            editBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="27px" fill="#FFFFFF">
                <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
            </svg>
        `;
            cancelEditBtn.style.display = "none";

            document.querySelectorAll(".bubble").forEach(b => {
                b.contentEditable = "false";
                b.style.border = "";
            });

            // ✅ 同步所有訊息並修補格式 - 這一段是唯一且正確的邏輯塊
            const allMessages = [];
            // 在這裡定義 defaultImageUrl，確保在整個作用域中都可訪問且一致
            const defaultImageUrl = "https://i.meee.com.tw/6uvWSxp.jpeg";

            document.querySelectorAll(".message").forEach(m => {
                const id = m.dataset.id;
                const time = m.querySelector(".time").innerText;
                const sender = m.classList.contains("me") ? "me" : "ai";
                const bubble = m.querySelector(".bubble");

                const rawText = m.dataset.raw;
                if (rawText?.startsWith("<貼圖:")) {
                    allMessages.push({
                        id, time, sender,
                        text: rawText, // ✅ 直接使用
                        isVoice: false,
                        voiceContent: null,
                        timeDisplay: null
                    });
                    return; // ✅ 跳過重建
                }

                let reconstructedTextLines = []; // 用於重建最終的 msg.text

                // 遍歷 bubble 的所有子節點，重建原始文本格式
                // 這個邏輯將處理所有類型的內容：語音、圖片、純文本
                bubble.childNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) { // 元素節點
                        if (node.classList.contains("voice-message")) {
                            const vc = node.getAttribute("data-content") || "";
                            reconstructedTextLines.push(`[語音：${vc}]`);
                        } else if (node.classList.contains("chat-image")) {
                            const desc = node.getAttribute("data-desc") || "";
                            const imgUrl = node.src || ""; // 獲取圖片當前渲染的 src

                            reconstructedTextLines.push(`[圖片：${desc}]`);

                            // 只有當圖片的 src 不是預設圖片時，才將其 URL 儲存回 text 中
                            if (imgUrl && imgUrl !== defaultImageUrl) {
                                reconstructedTextLines.push(imgUrl);
                            }
                        } else if (node.tagName === 'DIV' && node.style.whiteSpace === 'pre-wrap') {
                            // 這是 appendMessage 渲染純文本的 div
                            const textPart = node.innerText.trim();
                            if (textPart) {
                                reconstructedTextLines.push(textPart);
                            }
                        }
                        // 如果還有其他你渲染的 HTML 元素，也需要在這裡處理它們的文本表示
                    } else if (node.nodeType === Node.TEXT_NODE) { // 純文本節點 (contentEditable 編輯後可能產生)
                        const t = node.textContent.trim();
                        if (t) {
                            reconstructedTextLines.push(t);
                        }
                    }
                });

                // 這是唯一一次將訊息 push 到 allMessages 的地方
                allMessages.push({
                    id, time, sender,
                    text: reconstructedTextLines.join("\n"), // 重新組裝為一行行
                    isVoice: false,
                    voiceContent: null,
                    timeDisplay: null
                });

                // 這裡不應該有 return; 它會過早結束外層的 forEach 循環
            }); // document.querySelectorAll(".message").forEach 循環的結束

            localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(allMessages));
            alert("已儲存並退出編輯模式");
            // ✅ 儲存後重新載入當前聊天室並滾動到底部
            // 確保 currentChatId 和 chat title 是可用的
            if (currentChatId) {
                const currentChatName = document.querySelector(".chat-title").innerText;
                openChat(currentChatId, currentChatName);
            }
        }
    }); // editBtn.addEventListener("click") 的結束

    // ================ 取消編輯 ==================
    cancelEditBtn.addEventListener("click", () => {
        isEditMode = false;

        editBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" height="27px" viewBox="0 -960 960 960" width="27px"
                            fill="#FFFFFF">
                            <path
                                d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                        </svg>
            `;

        cancelEditBtn.style.display = "none";

        let backupHTML = messagesContainer.innerHTML; // 開啟編輯時先存下來
        messagesContainer.innerHTML = backupHTML;

        // 關閉 contentEditable 樣式
        document.querySelectorAll(".bubble").forEach(b => {
            b.contentEditable = "false";
            b.style.border = "";
        });

        alert("已取消編輯模式");
    });


    // ============= 刪除模式 ==============
    deleteBtn.addEventListener("click", () => {
        isDeleteMode = !isDeleteMode;
        if (isDeleteMode) {
            alert("刪除模式中，點選要刪除的訊息，再按 ✔️");
            deleteBtn.innerHTML = `
            <svg xmlns = "http://www.w3.org/2000/svg" height = "27px" viewBox = "0 -960 960 960" width = "27px" fill = "#FFFFFF" > <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg>
                `;
            cancelDeleteBtn.style.display = "inline-block";
            deleteTargets = [];
            document.querySelectorAll(".bubble").forEach(b => {
                b.classList.add("delete-border");
            });
        } else {
            if (deleteTargets.length > 0 && confirm(`確定刪除 ${deleteTargets.length} 筆訊息嗎？`)) {
                let history = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");
                let fake = JSON.parse(localStorage.getItem(`unsent-${currentChatId}`) || "[]");

                // 過濾掉被選中的 ID
                history = history.filter(m => !deleteTargets.includes(m.id?.toString()));
                fake = fake.filter(m => !deleteTargets.includes(m.id?.toString()));


                // 更新 localStorage
                localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(history));
                localStorage.setItem(`unsent-${currentChatId}`, JSON.stringify(fake));

                // 更新記憶中的 fakeMessages
                fakeMessages = fake;

                // 移除畫面 DOM
                deleteTargets.forEach(id => {
                    const el = document.querySelector(`.message[data-id="${id}"]`);
                    if (el) el.remove();
                });

                alert("✅ 已刪除！");
                deleteTargets = []; // 清空選取清單
            }
            isDeleteMode = false;
            deleteBtn.innerHTML = `
            <svg xmlns = "http://www.w3.org/2000/svg" height = "27px" viewBox = "0 -960 960 960" width = "27px"
        fill = "#FFFFFF" >
            <path
                d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
            `;
            cancelDeleteBtn.style.display = "none";
            document.querySelectorAll(".bubble").forEach(b => {
                b.classList.remove("delete-border");
                b.style.backgroundColor = "";
            });
        }
    });



    // 點選標記要刪除的泡泡
    document.getElementById("messages").addEventListener("click", e => {
        if (isDeleteMode) {
            const bubble = e.target.closest(".bubble");
            if (!bubble) return;

            const messageDiv = bubble.closest(".message");
            const id = messageDiv?.dataset.id;
            if (!id) return;

            if (deleteTargets.includes(id)) {
                deleteTargets = deleteTargets.filter(x => x !== id);
                bubble.style.backgroundColor = "";
            } else {
                deleteTargets.push(id);
                bubble.style.backgroundColor = "#c4869f";
            }
        }

    });

    // 取消刪除模式
    cancelDeleteBtn.addEventListener("click", () => {
        isDeleteMode = false;
        deleteBtn.innerHTML = `
            <svg xmlns = "http://www.w3.org/2000/svg" height = "27px" viewBox = "0 -960 960 960" width = "27px"
        fill = "#FFFFFF" >
            <path
                d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
            `;
        cancelDeleteBtn.style.display = "none";
        deleteTargets = [];
        document.querySelectorAll(".bubble").forEach(b => {
            b.classList.remove("delete-border");
            b.style.backgroundColor = "";
        });
        alert("已取消刪除模式");
    });

    // ========== 其他監聽 ==========
    document.getElementById("resetBgBtn").addEventListener("click", () => {
        if (!currentChatId) {
            alert("未選擇聊天室！");
            return;
        }

        // 清除 localStorage 裡的背景圖和顏色
        localStorage.removeItem(`chatBackground-${currentChatId}`);
        localStorage.removeItem(`chatBgColor-${currentChatId}`);

        // 清除畫面上的圖片背景
        const msgBox = document.getElementById("messages");
        msgBox.style.backgroundImage = "none";
        msgBox.style.backgroundColor = "#ffffff";

        // 清空輸入框與預覽
        document.getElementById("background").value = "";
        const preview = document.querySelector(".wallpaper");
        if (preview) {
            preview.style.backgroundImage = "none";
        }

        alert("已重置為白色背景！");
    });

    // ================== bubble泡泡顏色 =====================
    window.addEventListener("DOMContentLoaded", () => {
        if (currentChatId) {
            applyBubbleStyles(currentChatId);
        }

        // 每個 input 的 input 事件都順便更新 span 顯示
        document.getElementById("myBubbleBgColor").addEventListener("input", e => {
            const color = e.target.value;
            localStorage.setItem(`myBubbleBgColor-${currentChatId}`, color);
            document.getElementById("myBubbleBg").innerText = color;
            applyBubbleStyles(currentChatId); // ✅ 傳入 ID
        });

        document.getElementById("myBubbleTextColor").addEventListener("input", e => {
            const color = e.target.value;
            localStorage.setItem(`myBubbleTextColor-${currentChatId}`, color);
            document.getElementById("myBubbleText").innerText = color;
            applyBubbleStyles(currentChatId); // ✅ 傳入 ID
        });

        document.getElementById("aiBubbleBgColor").addEventListener("input", e => {
            const color = e.target.value;
            localStorage.setItem(`aiBubbleBgColor-${currentChatId}`, color);
            document.getElementById("aiBubbleBg").innerText = color;
            applyBubbleStyles(currentChatId); // ✅ 傳入 ID
        });

        document.getElementById("aiBubbleTextColor").addEventListener("input", e => {
            const color = e.target.value;
            localStorage.setItem(`aiBubbleTextColor-${currentChatId}`, color);
            document.getElementById("aiBubbleText").innerText = color;
            applyBubbleStyles(currentChatId); // ✅ 傳入 ID
        });

        document.getElementById("resetBubbleStyleBtn").addEventListener("click", () => {
            if (!currentChatId) return;

            localStorage.removeItem(`myBubbleBgColor-${currentChatId}`);
            localStorage.removeItem(`myBubbleTextColor-${currentChatId}`);
            localStorage.removeItem(`aiBubbleBgColor-${currentChatId}`);
            localStorage.removeItem(`aiBubbleTextColor-${currentChatId}`);

            applyBubbleStyles(currentChatId);
            alert("✅ 已重置本聊天室的氣泡樣式");
        });
    });


    document.getElementById("chatSettingsBtn").addEventListener("click", () => {
        //const currentId = window.currentChatId;
        if (!currentChatId) {
            alert("未選擇聊天室！");
            return;
        }
        const chat = chats.find(c => c.id === currentChatId);
        // 加入背景圖片欄位的值與預覽
        const bg = localStorage.getItem(`chatBackground-${currentChatId}`) || "";
        document.getElementById("background").value = bg;
        const preview = document.querySelector(".wallpaper");
        if (preview) {
            preview.style.backgroundImage = bg ? `url('${bg}')` : "none";
            preview.style.backgroundSize = "cover";
            preview.style.backgroundPosition = "center";
        }
        const meBg = localStorage.getItem(`myBubbleBgColor-${currentChatId}`) || "#f8d7da";
        const meText = localStorage.getItem(`myBubbleTextColor-${currentChatId}`) || "#282320";
        const aiBg = localStorage.getItem(`aiBubbleBgColor-${currentChatId}`) || "#eef5ff";
        const aiText = localStorage.getItem(`aiBubbleTextColor-${currentChatId}`) || "#282320";

        document.getElementById("myBubbleBgColor").value = meBg;
        document.getElementById("myBubbleTextColor").value = meText;
        document.getElementById("aiBubbleBgColor").value = aiBg;
        document.getElementById("aiBubbleTextColor").value = aiText;

        document.getElementById("myBubbleBg").innerText = meBg;
        document.getElementById("myBubbleText").innerText = meText;
        document.getElementById("aiBubbleBg").innerText = aiBg;
        document.getElementById("aiBubbleText").innerText = aiText;

        if (chat) {
            document.getElementById("chatNameInput").value = chat.name || "";
            document.getElementById("aiPersonaInput").value = chat.aiPersona || "";
            document.getElementById("aiAvatarUrlInput").value = chat.aiAvatar || "";
            document.getElementById("myNameInput").value = chat.myName || "";
            document.getElementById("myPersonaInput").value = chat.myPersona || "";
            document.getElementById("myAvatarUrlInput").value = chat.myAvatar || "";
            document.getElementById("chatSettingsPanel").style.display = "block";
        }
    });

    document.getElementById("cancelSettingsBtn").addEventListener("click", () => {
        document.getElementById("chatSettingsPanel").style.display = "none";
    });
    window.addEventListener("DOMContentLoaded", () => {
        if (!currentChatId) return;

        const bg = localStorage.getItem(`chatBackground-${currentChatId}`);
        if (bg) {
            const msgBox = document.getElementById("messages");
            msgBox.style.backgroundImage = `url('${bg}')`;
            msgBox.style.backgroundSize = "cover";
            msgBox.style.backgroundPosition = "center";
        }
    });


    // 監聽儲存
    document.getElementById("saveSettingsBtn2").addEventListener("click", () => {
        //const currentId = window.currentChatId;

        if (!currentChatId) {
            alert("未找到聊天室 ID，請檢查 openChat 是否有設定 currentChatId");
            return;
        }

        const newName = document.getElementById("chatNameInput").value.trim();
        const aiPersona = document.getElementById("aiPersonaInput").value.trim();
        const aiAvatar = document.getElementById("aiAvatarUrlInput").value.trim();
        const myName = document.getElementById("myNameInput").value.trim();
        const myPersona = document.getElementById("myPersonaInput").value.trim();
        const myAvatar = document.getElementById("myAvatarUrlInput").value.trim();

        const idx = chats.findIndex(c => c.id === currentChatId);

        const contextLength = parseInt(document.getElementById("contextLengthInput").value) || 3;
        chats[idx].contextLength = contextLength;


        // 同步更新該聊天室項目的頭像
        document.querySelector(`.chat-avatar[data-chatid="${currentChatId}"]`).src = aiAvatar;
        // 更新設定面板裡的預覽
        const targetImg = document.querySelector(".ai-avatar-preview img");
        if (targetImg && aiAvatar) {
            targetImg.src = aiAvatar;
        }
        if (idx !== -1) {
            chats[idx].name = newName;
            chats[idx].aiPersona = aiPersona;
            chats[idx].aiAvatar = aiAvatar;
            chats[idx].myName = myName;
            chats[idx].myPersona = myPersona;
            chats[idx].myAvatar = myAvatar;

            localStorage.setItem("chats", JSON.stringify(chats));
            // 🔽 儲存背景圖網址到 localStorage（每個聊天室一筆）
            const bgUrl = document.getElementById("background").value.trim();
            localStorage.setItem(`chatBackground-${currentChatId}`, bgUrl);

            // 🔽 即時套用到聊天室視窗
            const msgBox = document.getElementById("messages");
            msgBox.style.backgroundImage = bgUrl ? `url('${bgUrl}')` : "none";
            msgBox.style.backgroundSize = "cover";
            msgBox.style.backgroundPosition = "center";

            // 🔽 套用預覽圖片
            const preview = document.querySelector(".wallpaper");
            if (preview) {
                preview.style.backgroundImage = bgUrl ? `url('${bgUrl}')` : "none";
                preview.style.backgroundSize = "cover";
                preview.style.backgroundPosition = "center";
            }
            const myBubbleBg = document.getElementById("myBubbleBgColor").value.trim();
            const myTextColor = document.getElementById("myBubbleTextColor").value.trim();
            const aiBubbleBg = document.getElementById("aiBubbleBgColor").value.trim();
            const aiTextColor = document.getElementById("aiBubbleTextColor").value.trim();

            localStorage.setItem(`myBubbleBgColor-${currentChatId}`, myBubbleBg);
            localStorage.setItem(`myBubbleTextColor-${currentChatId}`, myTextColor);
            localStorage.setItem(`aiBubbleBgColor-${currentChatId}`, aiBubbleBg);
            localStorage.setItem(`aiBubbleTextColor-${currentChatId}`, aiTextColor);

            applyBubbleStyles(currentChatId); // 即時套用


            // 更新畫面
            document.querySelector(".chat-title").innerText = newName;
            renderChatList();
        }

        alert("已儲存並更新！");
        document.getElementById("chatSettingsPanel").style.display = "none";
    });

    // ========== 備份 ==========
    // 匯出
    document.getElementById("exportChatsBtn").addEventListener("click", () => {
        function fixId(id) {
            return String(id).replace(/\./g, "_");
        }

        const rawChats = JSON.parse(localStorage.getItem("chats") || "[]");

        const chats = rawChats.map(chat => {
            const fixedId = fixId(chat.id);
            return {
                ...chat,
                id: fixedId,
                background: localStorage.getItem(`chatBackground-${fixedId}`) || ""
            };
        });


        const messages = {};
        chats.forEach(chat => {
            const raw = JSON.parse(localStorage.getItem(`chat-${chat.id}`) || "[]");
            messages[chat.id] = raw.map(msg => {
                return {
                    ...msg,
                    id: fixId(msg.id),
                    timestamp: msg.timestamp || Date.now(),
                    isVoice: msg.isVoice !== undefined ? msg.isVoice : /^\[語音：(.*)\]$/.test(msg.text),
                    voiceContent: msg.voiceContent || (msg.text?.match(/^\[語音：(.*)\]$/)?.[1] || null),
                    timeDisplay: msg.timeDisplay || (msg.text?.match(/^\[語音：(.*)\]$/)
                        ? `00:${Math.max(1, Math.ceil(msg.text.match(/^\[語音：(.*)\]$/)[1].length / 2)).toString().padStart(2, "0")}`
                        : null)
                };
            });
        });

        const data = {
            chats,
            messages,
            posts: JSON.parse(localStorage.getItem("posts") || "[]"),
            settings: {
                userNickname: localStorage.getItem("userNickname") || "user",
                userAvatar: localStorage.getItem("userAvatar") || "https://i.meee.com.tw/mYv66sr.png",
                postBg: localStorage.getItem("postBg") || "https://i.meee.com.tw/7RTGyUf.jpg"
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "myChats.backup.json";
        a.click();

        alert("✅ 已成功匯出，所有 ID 都已轉為安全格式！");
    });



    // 點擊匯入按鈕
    document.getElementById("importChatsBtn").addEventListener("click", () => {
        document.getElementById("importChatsFile").click();
    });

    document.getElementById("importChatsFile").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fixId = id => String(id).replace(/\./g, "_");

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const raw = JSON.parse(event.target.result);
                if (!raw.chats || !raw.messages) {
                    alert("❌ 檔案格式錯誤，無法匯入！");
                    return;
                }

                const chats = raw.chats.map(chat => {
                    chat.id = fixId(chat.id);
                    return chat;
                });
                // 寫入每個聊天室的背景圖片網址
                chats.forEach(chat => {
                    if (chat.background) {
                        localStorage.setItem(`chatBackground-${chat.id}`, chat.background);
                    }
                });


                const messages = {};
                Object.keys(raw.messages).forEach(oldId => {
                    const newId = fixId(oldId);
                    messages[newId] = raw.messages[oldId].map(msg => {
                        msg.id = fixId(msg.id);
                        if (!msg.timestamp) msg.timestamp = Date.now();

                        if (msg.isVoice === undefined) {
                            const match = msg.text?.match(/^\[語音：(.*)\]$/);
                            if (match) {
                                msg.isVoice = true;
                                msg.voiceContent = match[1];
                                msg.timeDisplay = `00:${Math.max(1, Math.ceil(match[1].length / 2)).toString().padStart(2, "0")}`;
                            } else {
                                msg.isVoice = false;
                                msg.voiceContent = null;
                                msg.timeDisplay = null;
                            }
                        }

                        return msg;
                    });
                });

                // 寫入 localStorage
                localStorage.setItem("chats", JSON.stringify(chats));
                Object.keys(messages).forEach(id => {
                    localStorage.setItem(`chat-${id}`, JSON.stringify(messages[id]));
                });

                if (raw.posts) {
                    localStorage.setItem("posts", JSON.stringify(raw.posts));
                }

                if (raw.settings) {
                    localStorage.setItem("userNickname", raw.settings.userNickname || "user");
                    localStorage.setItem("userAvatar", raw.settings.userAvatar || "https://placekitten.com/80/80");
                    localStorage.setItem("postBg", raw.settings.postBg || "https://placekitten.com/600/200");
                }

                alert("✅ 匯入成功，所有 ID 都已自動轉為安全格式，頁面將自動重新整理！");
                location.reload();

            } catch (err) {
                alert("❌ 匯入失敗，請檢查檔案格式");
                console.error(err);
            }
        };

        reader.readAsText(file);
    });


    // ================= 刪除所有紀錄 ==================
    document.getElementById("deleteHistory").addEventListener("click", () => {
        if (confirm("⚠️ 確定要刪除所有聊天與貼文紀錄嗎？這個動作無法還原！")) {
            // 讀出所有聊天室 id，刪掉每一筆 chat 資料
            const chats = JSON.parse(localStorage.getItem("chats") || "[]");
            chats.forEach(chat => {
                localStorage.removeItem(`chat-${chat.id}`);
            });

            // 再刪掉主列表和貼文、設定資料
            //localStorage.removeItem("chats");
            //localStorage.removeItem("posts");
            //localStorage.removeItem("userNickname");
            //localStorage.removeItem("userAvatar");
            //localStorage.removeItem("postBg");
            localStorage.clear();

            alert("✅ 所有紀錄已刪除！");
            location.reload();
        }
    });

    // ==================== 容量顯示 =========================
    function renderStorageUsage() {
        const used = getLocalStorageSize();
        const percent = (used / STORAGE_LIMIT) * 100;
        const display = document.getElementById("storageDisplay");

        if (display) {
            display.textContent = `${(used / 1024).toFixed(1)} KB / ${(STORAGE_LIMIT / 1024 / 1024).toFixed(1)} MB (${percent.toFixed(1)}%)`;
        } else {
            console.warn("找不到 #storageDisplay");
        }

        console.log("使用量百分比：", percent);
        // 空間快滿時提醒一次
        //if (percent >= 0.95 && !hasWarnedStorage) {
        //alert("⚠️ 儲存空間已超過 95%，請盡快備份或清除資料！");
        //hasWarnedStorage = true;
        //}
    }
    // 初始顯示一次
    renderStorageUsage();

    // 如果你有儲存操作，也可以在儲存完呼叫這個函式再刷新


    // ==================== 貼文 ==========================
    // ================== 初始化 nickname 和頭貼 ===================
    const nicknameEl = document.getElementById("nickname");
    const savedName = localStorage.getItem("userNickname") || "user";
    const avatar = localStorage.getItem("userAvatar") || "https://placekitten.com/80/80";
    nicknameEl.textContent = savedName;

    // 點暱稱可以修改
    nicknameEl.addEventListener("click", () => {
        const newName = prompt("輸入新的暱稱", savedName);
        if (newName && newName.trim() !== "") {
            localStorage.setItem("userNickname", newName);
            nicknameEl.textContent = newName;
            alert("暱稱更新");

            // 更新所有貼文的暱稱
            const posts = JSON.parse(localStorage.getItem("posts") || "[]");
            posts.forEach(p => p.userNickname = newName.trim());
            localStorage.setItem("posts", JSON.stringify(posts));

            // 重新渲染
            renderPosts();
        }
    });

    // ================== 點頭貼和背景換圖 ===================
    document.getElementById("post-bg").addEventListener("click", () => {
        const url = prompt("請輸入背景圖片連結");
        if (url) {
            localStorage.setItem("postBg", url);
            document.getElementById("post-bg").src = url;
        }
    });
    document.getElementById("post-avatar").addEventListener("click", () => {
        const url = prompt("請輸入頭像圖片連結");
        if (url) {
            localStorage.setItem("userAvatar", url);
            document.getElementById("post-avatar").src = url;

            // 更新所有貼文的 avatar
            const posts = JSON.parse(localStorage.getItem("posts") || "[]");
            posts.forEach(p => p.userAvatar = url);
            localStorage.setItem("posts", JSON.stringify(posts));

            // 重新渲染
            renderPosts();
        }
    });

    // ================== 讀入背景和頭貼 ===================
    document.getElementById("post-bg").src = localStorage.getItem("postBg") || "https://i.meee.com.tw/7RTGyUf.jpg";
    document.getElementById("post-avatar").src = localStorage.getItem("userAvatar") || "https://i.meee.com.tw/mYv66sr.png";

    // ================== 發布貼文 ===================
    document.getElementById("createPostBtn").addEventListener("click", async () => {
        const content = prompt("輸入貼文內容");
        if (!content) return;

        const posts = JSON.parse(localStorage.getItem("posts") || "[]");
        const newPost = {
            nickname: localStorage.getItem("userNickname") || "user",
            avatar: localStorage.getItem("userAvatar") || "https://placekitten.com/80/80",
            text: content,
            time: Date.now(),
            liked: false,
            comments: []
        };

        posts.push(newPost);
        localStorage.setItem("posts", JSON.stringify(posts));
        renderPosts(); // 立刻先畫

        // 下面角色留言慢慢補
        const chatListItems = document.querySelectorAll("#chatList .chat-list-item");
        const storedCharacters = JSON.parse(localStorage.getItem("characters") || "[]");
        const characterList = [];
        chatListItems.forEach(item => {
            const name = item.querySelector(".chat-name")?.textContent.trim();
            const avatar = item.querySelector(".chat-avatar")?.src || "";
            const found = storedCharacters.find(c => c.name === name);
            const persona = found?.persona || "";

            if (name) {
                characterList.push({
                    name,
                    avatar,
                    persona
                });
            }
        });

        // 角色一個一個回覆
        characterList.forEach(async (character) => {
            console.log("character =", character);
            try {
                const reply = await fetchGeminiReply(character.name, character.persona, content);
                // 把留言塞進最後一篇
                const currentPosts = JSON.parse(localStorage.getItem("posts") || "[]");
                const lastPost = currentPosts[currentPosts.length - 1];
                lastPost.comments.push({
                    nickname: character.name,
                    avatar: character.avatar,
                    text: reply,
                    time: Date.now()
                });
                localStorage.setItem("posts", JSON.stringify(currentPosts));
                renderPosts();  // 每次有新留言就重新畫一次
            } catch (err) {
                console.error("AI 回覆失敗", err);
            }
        });
    });



    // ================== 渲染貼文 ===================
    function renderPosts() {
        const container = document.querySelector(".post-feed");
        container.innerHTML = ""; // 清空

        const posts = JSON.parse(localStorage.getItem("posts") || "[]");

        [...posts].reverse().forEach((post) => {
            const date = new Date(post.time);
            const timeStr = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")} `;
            const dateStr = `${date.getFullYear()} /${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} `;

            // 誰按讚
            const likedBy = post.likedBy || [];  // 如果 likedBy 不存在就補一個

            const div = document.createElement("div");
            div.className = "post";
            div.dataset.time = post.time;
            div.style.padding = "10px";
            div.style.margin = "10px";
            div.style.borderRadius = "10px";
            div.style.background = "#fff";
            div.style.boxShadow = "0 0 5px rgba(0,0,0,0.1)";

            // 加在 renderPosts 中貼文內容插入前
            let formattedText = post.text
                .replace(/\[圖片：/g, "\n[圖片：")
                .replace(/\[地點：/g, "\n[地點：")
                .replace(/\[時間：/g, "\n[時間：");

            div.innerHTML = `
            <div class="post-header" style = "display:flex;align-items:center;gap:8px;" >
      <img src="${post.avatar}" style="width:40px;height:40px;border-radius:50%;">
      <div style="display:flex;flex-direction:column;">
          <span class="nickname2" style="font-weight:bold;">${post.nickname}</span>
          <span style="font-size:12px;color:#888;">${dateStr} ${timeStr}</span>
      </div>
  </div>
  <div class="content" style="margin-top:6px;">${formattedText.replace(/\n/g, "<br>")}</div>
  <div class="footer" style="margin-top:6px;">
    <span class="like" style="cursor:pointer;">${likedBy.includes(localStorage.getItem("userNickname") || "你") ? "❤️" : "🤍"}</span>
    <span class="comment" style="margin-left:12px;cursor:pointer;">💬 留言</span>
  </div>
  <div class="likes-line" style="font-size:12px;color:#888;margin-top:4px;">
      ${likedBy.length ? likedBy.join("、") + " 說讚" : ""}
  </div>
        `;


            // 愛心功能
            const likeBtn = div.querySelector(".like");

            likeBtn.addEventListener("click", () => {
                const currentUser = localStorage.getItem("userNickname") || "你";

                // 防呆：確保一定是陣列
                if (!post.likedBy) post.likedBy = [];

                if (!post.likedBy.includes(currentUser)) {
                    // 還沒按過讚就加入
                    post.likedBy.push(currentUser);
                } else {
                    // 已經按過就取消
                    post.likedBy = post.likedBy.filter(n => n !== currentUser);
                }

                // 正確找到原本 posts 中的 index
                const trueIndex = posts.findIndex(p => p.time === post.time);
                if (trueIndex !== -1) {
                    posts[trueIndex] = post;
                }
                localStorage.setItem("posts", JSON.stringify(posts));

                renderPosts();
            });

            // 留言功能
            div.querySelector(".comment").addEventListener("click", async () => {
                const originalPostTime = post.time; // 先記住這則貼文的唯一時間戳
                const reply = prompt("輸入留言");
                if (!reply) return;

                // --- 這是修正的第一部分：正確儲存使用者留言 ---

                // 1. 取得原始、未反轉的 posts 陣列
                let originalPosts = JSON.parse(localStorage.getItem("posts") || "[]");

                // 2. 透過唯一的 time ID 找到正確的貼文
                const postToUpdate = originalPosts.find(p => p.time === originalPostTime);

                if (!postToUpdate) {
                    console.error("找不到要回覆的貼文！");
                    return;
                }

                // 3. 將使用者的留言加入
                postToUpdate.comments.push({
                    user: localStorage.getItem("userNickname") || "你",
                    text: reply
                });

                // 4. 儲存回 localStorage
                localStorage.setItem("posts", JSON.stringify(originalPosts));

                // 5. 立即重新渲染畫面，讓使用者看到自己的留言
                renderPosts();

                // --- 這是修正的第二部分：讓 AI 正確回覆 ---

                // 呼叫 AI 回覆
                const roleName = post.nickname;    // 直接拿貼文作者
                const storedCharacters = JSON.parse(localStorage.getItem("characters") || "[]");
                const found = storedCharacters.find(c => c.name === roleName);
                const persona = found?.persona || "";

                // 關鍵！給 AI 上下文，告訴它原始貼文是什麼
                const systemPrompt = `
你現在是 ${roleName}，以下是你的人設：${persona}
請你完全扮演這個角色，使用第一人稱語氣、符合人設個性進行回覆。

目前的場景如下：
貼文內容：${postToUpdate.text}
有人留言：${reply}

請你以簡短、自然、貼近角色風格的語氣，針對上面這則留言回覆一句話。
請不要加入旁白、括號或第三人稱描述。
也不要說你是 AI，只要回覆角色會講的內容就好。
        `;

                try {
                    const res = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${localStorage.getItem("apiModel")}:generateContent?key=${localStorage.getItem("apiKey")}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: systemPrompt }] }]
                        })
                    });
                    const data = await res.json();
                    const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "（角色沒有回應）";

                    // --- 這是修正的第三部分：正確儲存 AI 留言 ---

                    // 再次讀取最新的 posts 資料，因為可能在等待 AI 回應時有其他操作
                    let finalPosts = JSON.parse(localStorage.getItem("posts") || "[]");
                    const finalPostToUpdate = finalPosts.find(p => p.time === originalPostTime);

                    if (finalPostToUpdate) {
                        finalPostToUpdate.comments.push({
                            user: roleName,
                            text: aiReply
                        });
                        localStorage.setItem("posts", JSON.stringify(finalPosts));
                        // 再次渲染，顯示 AI 的留言
                        renderPosts();
                    }

                } catch (err) {
                    console.error("AI 回覆失敗", err);
                    alert("AI 回覆失敗，請檢查 API 設定或網路連線");
                }
            });

            // 顯示留言
            post.comments.forEach(c => {
                const cmt = document.createElement("div");
                cmt.style.marginTop = "5px";
                cmt.style.fontSize = "14px";
                const displayName = c.user || c.nickname || "匿名";
                cmt.textContent = `${displayName}：${c.text}`;
                div.appendChild(cmt);
            });


            container.appendChild(div);
        });
    }
    // 一開始載入
    renderPosts();

    // 編輯貼文
    let isEditPostMode = false;
    editPostBtn.addEventListener("click", () => {
        isEditPostMode = !isEditPostMode;
        if (isEditPostMode) {
            alert("進入貼文編輯模式，請直接修改文字再按 💾 保存");
            editPostBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343">
                    <path 
                        d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
                    </svg>
            `;

            cancelEditPost.style.display = "inline-block";

            document.querySelectorAll(".post .content").forEach(c => {
                c.contentEditable = "true";
                c.style.border = "2px dashed darkslateblue";
            });
        } else {
            editPostBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill = "#434343">
                    <path 
                        d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                    </svg>
            `;
            document.querySelectorAll(".post .content").forEach(c => {
                c.contentEditable = "false";
                c.style.border = "";
            });

            cancelEditPost.style.display = "none";
            // 同步回 localStorage
            const posts = JSON.parse(localStorage.getItem("posts") || "[]");
            const updated = posts.map((post, idx) => {
                const newText = document.querySelectorAll(".post .content")[posts.length - idx - 1].innerText;
                return { ...post, text: newText };
            });
            localStorage.setItem("posts", JSON.stringify(updated));
            renderPosts();
            alert("已儲存並退出編輯模式");
        }
    });
    // 取消編輯貼文
    cancelEditPost.addEventListener("click", () => {
        isEditPostMode = false;
        editPostBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#434343">
                            <path
                                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h357l-80 80H200v560h560v-278l80-80v358q0 33-23.5 56.5T760-120H200Zm280-360ZM360-360v-170l367-367q12-12 27-18t30-6q16 0 30.5 6t26.5 18l56 57q11 12 17 26.5t6 29.5q0 15-5.5 29.5T897-728L530-360H360Zm481-424-56-56 56 56ZM440-440h56l232-232-28-28-29-28-231 231v57Zm260-260-29-28 29 28 28 28-28-28Z" />
                        </svg>
        `;
        cancelEditPost.style.display = "none";
        // 關閉 contentEditable 樣式
        document.querySelectorAll(".post .content").forEach(c => {
            c.contentEditable = "false";
            c.style.border = "";
        });


        alert("已取消編輯模式");
    });

    // 刪除貼文
    let isDeletePostMode = false;
    let deletePostTargets = [];
    deletePostBtn.addEventListener("click", () => {
        isDeletePostMode = !isDeletePostMode;
        console.log("點了");
        if (isDeletePostMode) {
            alert("點選要刪除的貼文，再按 ✔️ 確認刪除");
            deletePostBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#434343">
                    <path 
                        d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
                </svg>
            `;
            cancelPostBtn.style.display = "inline-block";
            deletePostTargets = [];
            document.querySelectorAll(".post").forEach(p => {
                p.classList.add("delete-border");
            });
        } else {
            if (deletePostTargets.length > 0 && confirm(`確定要刪除${deletePostTargets.length}筆貼文？`)) {
                let posts = JSON.parse(localStorage.getItem("posts") || "[]");
                deletePostTargets.forEach(id => {
                    posts = posts.filter(p => p.time != id);
                });
                localStorage.setItem("posts", JSON.stringify(posts));
                renderPosts();
                alert("已刪除");
            }
            isDeletePostMode = false;
            deletePostBtn.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#434343">
                            <path
                                d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                        </svg>
        `;
            cancelPostBtn.style.display = "none";
            document.querySelectorAll(".post").forEach(p => {
                p.classList.remove("delete-border");
                p.style.backgroundColor = "";
            });
        }
    });

    // 點選要刪除的
    document.querySelector(".post-feed").addEventListener("click", e => {
        if (isDeletePostMode && e.target.closest(".post")) {
            const postEl = e.target.closest(".post");
            const time = postEl.dataset.time; // 以 time 作為唯一 id
            if (deletePostTargets.includes(time)) {
                deletePostTargets = deletePostTargets.filter(x => x !== time);
                postEl.style.backgroundColor = "";
            } else {
                deletePostTargets.push(time);
                postEl.style.backgroundColor = "rgba(255,0,0,0.2)";
            }
        }
    });

    // 取消刪除
    cancelPostBtn.addEventListener("click", () => {
        isDeletePostMode = false;
        deletePostBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#434343">
                    <path
                        d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
        `;
        console.log("點了");
        cancelPostBtn.style.display = "none";
        deletePostTargets = [];
        document.querySelectorAll(".post").forEach(p => {
            p.classList.remove("delete-border");
            p.style.backgroundColor = "";
        });
        alert("已取消刪除模式");
    });

    // 角色發貼文
    document.getElementById("characterPostBtn").addEventListener("click", async () => {
        //const currentId = window.currentChatId;
        if (!currentChatId) {
            alert("請先選擇一個聊天室");
            return;
        }

        const chats = JSON.parse(localStorage.getItem("chats") || "[]");
        const currentChat = chats.find(c => c.id === currentChatId);
        console.log("點了");
        if (!currentChat) {
            alert("找不到該聊天室資料，請重新選擇");
            return;
        }
        const roleName = currentChat.name;
        const persona = currentChat.aiPersona || "";

        // 取得最近聊天
        const history = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");
        const last20 = history.slice(-20).map(m => {
            const speaker = m.sender === "me" ? "使用者" : roleName;
            return `${speaker}：${m.text}`;
        }).join("\n");

        const systemPrompt = `
你是
${roleName}
人設：${persona}

以下是最近和使用者的對話：
${last20}

請以其中出現的話題作為素材，寫一篇日常簡短的貼文，請避免不相關的內容，保持角色語氣，用繁體中文。
`;

        try {
            const res = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${localStorage.getItem("apiModel")}:generateContent?key=${localStorage.getItem("apiKey")}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: systemPrompt }]
                        }
                    ]
                })
            });
            const data = await res.json();
            const aiPost = data.candidates?.[0]?.content?.parts?.[0]?.text || "（角色沒有貼文）";

            // 角色貼文就放進 posts
            const posts = JSON.parse(localStorage.getItem("posts") || "[]");
            posts.push({
                nickname: roleName,
                avatar: currentChat?.aiAvatar || "https://placekitten.com/80/80",
                text: aiPost,
                time: Date.now(),
                likedBy: [], // ✅ 新增s
                comments: []
            });
            localStorage.setItem("posts", JSON.stringify(posts));
            alert("有一篇新的貼文！");
            renderPosts();

        } catch (err) {
            console.error("角色發文失敗", err);
            alert("角色發文失敗，請確認 API 設定");
        }
    });

    // 日常&日記
    document.getElementById("daily").addEventListener("click", () => {
        document.getElementById("dailyModal").style.display = "flex";
    });
    document.getElementById("dailyShort").addEventListener("click", () => {
        generateCharacterPost("short");
        document.getElementById("dailyModal").style.display = "none";
    });
    document.getElementById("dailyLong").addEventListener("click", () => {
        generateCharacterPost("long");
        document.getElementById("dailyModal").style.display = "none";
    });
    document.getElementById("dailyCancel").addEventListener("click", () => {
        document.getElementById("dailyModal").style.display = "none";
    });
    async function generateCharacterPost(type) {
        //const currentId = window.currentChatId;
        if (!currentChatId) {
            alert("請先選擇一個聊天室，因為要抓角色設定。");
            return;
        }
        console.log("點了");
        const chats = JSON.parse(localStorage.getItem("chats") || "[]");
        const currentChat = chats.find(c => c.id === currentChatId);
        if (!currentChat) {
            alert("找不到角色資訊");
            return;
        }

        const roleName = currentChat.name || "角色";
        const persona = currentChat.aiPersona || "";

        let promptText = `
你現在扮演
${roleName}
人設：${persona}
請以第一人稱在朋友圈發一則`;

        if (type === "short") {
            promptText += "一篇簡短的貼文，主題圍繞日常生活或當下的心情。用自然、第一人稱語氣撰寫，避免使用旁白或對話形式，只專注於角色自己的分享。使用繁體中文。";
        } else {
            promptText += "以第一人稱寫一篇私人日記，描述今日心情與生活，用繁體中文。";
        }

        try {
            const res = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${localStorage.getItem("apiModel")}:generateContent?key=${localStorage.getItem("apiKey")}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: promptText }]
                        }
                    ]
                })
            });
            const data = await res.json();
            const aiPost = data.candidates?.[0]?.content?.parts?.[0]?.text || "（角色今天沒有什麼想說的）";

            const posts = JSON.parse(localStorage.getItem("posts") || "[]");
            posts.push({
                nickname: roleName,
                avatar: currentChat.aiAvatar || "https://placekitten.com/80/80",
                text: aiPost,
                time: Date.now(),
                likedBy: [],
                comments: []
            });
            localStorage.setItem("posts", JSON.stringify(posts));
            renderPosts();
            alert(`${roleName} 發佈了${type === "short" ? "短貼文" : "長日記"}！`);
        } catch (err) {
            console.error("AI 回應錯誤", err);
            alert("角色貼文失敗，請檢查 API 設定或網路連線。\n" + (err.message || ""));
        }
    }


});

// 心聲
document.getElementById("heart").addEventListener("click", async () => {
    // 關閉 moreMenu
    // ✅ 延遲讓點擊事件處理完再關閉
    setTimeout(() => {
        document.getElementById("moreMenu").classList.remove("show");
    }, 10);

    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) {
        alert("請先選擇一個聊天室！");
        return;
    }

    const roleName = currentChat.name || "角色";
    const persona = currentChat.aiPersona || "";
    const myName = currentChat.myName || "使用者";
    const myPersona = currentChat.myPersona || "";

    // 對話紀錄
    const history = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");
    const chatHistoryText = history.slice(-10).map(m => {
        return `${m.sender === "me" ? myName : roleName}：${m.text}`;
    }).join("\n");

    const systemPrompt = `
你是 ${roleName}，人設：「${persona}」
請完全扮演這個角色，用第一人稱語氣思考。

以下是最近你和使用者 ${myName} 的對話紀錄：
${chatHistoryText}

請你根據當下的情境和對話，生成一句你內心的小小心聲。
格式要求如下：
- 必須是第一人稱
- 不能超過 40 個字
- 禁止括號、旁白、說明
- 禁止使用 Markdown 或 JSON
- 只能輸出一句話

請直接輸出，不要說明。
`;

    const apiKey = localStorage.getItem("apiKey");
    const apiModel = "gemini-2.0-flash";
    //const apiModel = localStorage.getItem("apiModel");  // ✅ 固定使用 flash 2.0

    try {
        //const modelPath = apiModel.replace(/^models\//, "");
        const res = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt }
                        ]
                    }
                ]
            })
        });

        const data = await res.json();
        const heart = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().slice(0, 40);
        if (!heart) throw new Error("AI 無心聲");

        showHeartVoice(heart);
    } catch (err) {
        console.error("心聲錯誤", err);
        showHeartVoice("（無法取得心聲）");
    }
});

let heartTimer = null;

function showHeartVoice(text) {
    document.getElementById("heartVoiceText").textContent = text;
    const el = document.getElementById("heartVoice");
    el.classList.add("show");

    clearTimeout(heartTimer);
    heartTimer = setTimeout(() => {
        hideHeartVoice();
    }, 10000); // 自動 10 秒後消失
}

function hideHeartVoice() {
    const el = document.getElementById("heartVoice");
    el.classList.remove("show");

    // ✅ 一併關閉 moreMenu
    const moreMenu = document.getElementById("moreMenu");
    moreMenu.classList.remove("show");
}

document.getElementById("heartVoiceClose").addEventListener("click", () => {
    hideHeartVoice(); // 同樣會一起關掉 moreMenu
});

// 打開聊天室設定
document.getElementById("chatSettingsBtn").addEventListener("click", () => {
    //const currentId = window.currentChatId;
    if (!currentChatId) {
        alert("未找到聊天室 ID，請先選一個聊天室！");
        return;
    }

    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) {
        alert("找不到此聊天室的資料！");
        return;
    }

    // 依據當初創建填回表單
    document.getElementById("chatNameInput").value = chat.name || "";
    document.getElementById("aiPersonaInput").value = chat.aiPersona || "";
    document.getElementById("aiAvatarUrlInput").value = chat.aiAvatar || "";
    document.getElementById("myNameInput").value = chat.myName || "";
    document.getElementById("myPersonaInput").value = chat.myPersona || "";
    document.getElementById("myAvatarUrlInput").value = chat.myAvatar || "";

    // 預覽頭像
    if (chat.aiAvatar) {
        document.querySelector(".ai-avatar-preview").innerHTML =
            `<img src="${chat.aiAvatar}" style="width:80px;border-radius:50%">`;
    } else {
        document.querySelector(".ai-avatar-preview").innerHTML =
            `<img src="https://files.catbox.moe/f0d3t9.jpg" style="width:80px;border-radius:50%">`;
    }

    if (chat.myAvatar) {
        document.querySelector(".my-avatar-preview").innerHTML =
            `<img src="${chat.myAvatar}" style="width:80px;border-radius:50%">`;
    } else {
        document.querySelector(".my-avatar-preview").innerHTML =
            `<img src="https://files.catbox.moe/f0d3t9.jpg" style="width:80px;border-radius:50%">`;
    }

    document.getElementById("chatSettingsPanel").style.display = "block";
});


// 監聽取消
document.getElementById("cancelSettingsBtn").addEventListener("click", () => {
    document.getElementById("chatSettingsPanel").style.display = "none";
});

//圖片上傳
document.getElementById("aiAvatarUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            const base64 = evt.target.result;
            const currentChatId = document.querySelector(".chat-title").textContent;
            localStorage.setItem(`${currentChatId}_aiAvatarBase64`, base64);

            document.querySelector(".ai-avatar-preview").innerHTML =
                `<img src="${base64}" style="width:80px;border-radius:50%">`;

            // 同步更新右上角聊天頭像
            document.querySelector(".chat-avatar").src = base64;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("myAvatarUpload").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const url = URL.createObjectURL(file);
        document.querySelector(".my-avatar-preview").innerHTML = `<img src="${url}" style="width:80px;border-radius:50%">`;
        localStorage.setItem("myAvatarPreview", url); // 或 base64
    }
});

// 回覆
function addPost(text) {
    const container = document.querySelector(".post-feed");
    const nickname = localStorage.getItem("userNickname") || "user";
    const avatar = localStorage.getItem("postAvatar") || "https://placekitten.com/80/80";

    const time = new Date();
    const timeStr = `${time.getFullYear()}/${(time.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${time.getDate().toString().padStart(2, "0")} ${time
            .getHours()
            .toString()
            .padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`;

    const newPost = {
        nickname,
        avatar,
        text,
        time: Date.now(),
        liked: false,
        comments: []
    };

    // 先存在 localStorage
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));

    // 再重新渲染
    renderPosts();

    // 之後呼叫 AI 自動回覆
    autoCommentFromAI(text);
}

async function autoCommentFromAI(postText, replyText) {
    //const currentId = window.currentChatId;
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const currentChat = chats.find(c => c.id === currentChatId);

    const roleName = currentChat?.name || "角色";
    const persona = currentChat?.aiPersona || "";

    const systemPrompt = `
你現在是 ${roleName}，以下是你的人設：${persona}
請你完全扮演這個角色，使用第一人稱語氣、符合人設個性進行回覆。

目前的場景如下：
貼文內容：${postText}
有人留言：${replyText}

請你以自然、貼近角色風格的語氣，針對上面這則留言回覆一句話。
請不要加入旁白、括號或第三人稱描述。
也不要說你是 AI，只要回覆角色會講的內容就好。
`;

    try {
        const res = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${localStorage.getItem("apiModel")}:generateContent?key=${localStorage.getItem("apiKey")}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: systemPrompt }]
                    }
                ]
            })
        });
        const data = await res.json();
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "（角色沒有留言）";

        // 取最新一篇
        const posts = JSON.parse(localStorage.getItem("posts") || "[]");
        const lastPost = posts[posts.length - 1];
        if (lastPost) {
            lastPost.comments.push({
                user: roleName,
                text: aiReply
            });
            localStorage.setItem("posts", JSON.stringify(posts));
            renderPosts();
        }
    } catch (e) {
        console.error("AI留言失敗", e);
    }
}

// 角色留言
async function fetchGeminiReply(characterName, characterPersona, userPost) {
    const prompt = `你現在扮演：${characterName}
人設描述：${characterPersona}
請針對一則貼文${userPost}以留言的形式，用${characterName}的語氣回覆，請使用第一人稱，並且口語化。只需要留言的內容，不要多餘解說，使用繁體中文。`;

    const apiModel = localStorage.getItem("apiModel") || "gemini-2.0-flash";
    const apiKey = localStorage.getItem("apiKey") || "";

    const response = await fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ]
        })
    });

    const data = await response.json();
    console.log(data);  // debug
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "……";
}

// 顯示備份頭貼等等
function applyUserSettings() {
    const nickname = localStorage.getItem("userNickname") || "user";
    const avatar = localStorage.getItem("userAvatar") || "https://i.meee.com.tw/mYv66sr.png";
    const bg = localStorage.getItem("postBg") || "https://i.meee.com.tw/7RTGyUf.jpg";

    const nicknameEl = document.getElementById("nickname");
    const avatarEl = document.getElementById("post-avatar");
    const bgEl = document.getElementById("post-bg");

    if (nicknameEl) nicknameEl.textContent = nickname;
    if (avatarEl) avatarEl.src = avatar;
    if (bgEl) bgEl.src = bg;
}

// 容量
function getLocalStorageSize() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            const value = localStorage.getItem(key);
            total += key.length + value.length;
        }
    }
    return total; // 單位：字元（大約 1 char = 1 byte）
}

// 回到底部
function scrollToBottom() {
    const messagesContainer = document.getElementById("messages");
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

function checkBrokenChatHistories() {
    for (let key in localStorage) {
        if (key.startsWith("chat-")) {
            try {
                const val = JSON.parse(localStorage.getItem(key));
                if (!Array.isArray(val)) {
                    console.warn("⚠️ 壞掉的聊天室訊息資料：", key, val);
                    localStorage.removeItem(key);
                    console.log("✅ 已刪除錯誤紀錄，恢復乾淨狀態");
                }
            } catch (e) {
                console.error("❌ 無法解析的聊天室紀錄：", key, e);
                localStorage.removeItem(key);
                console.log("✅ 已清空損壞紀錄");
            }
        }
    }
}

// 時間感知功能
document.getElementById("timeAware-toggle").addEventListener("change", (e) => {
    const isChecked = e.target.checked;
    localStorage.setItem("timeAware", isChecked.toString());
    console.log("🕒 時間感知設定變更為：", isChecked);
});
function fixChatIds() {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");

    // 修復 chats 陣列本身（角色設定）
    const newChats = chats.map(chat => {
        chat.id = String(chat.id).replace(/\./g, "_");
        return chat;
    });

    localStorage.setItem("chats", JSON.stringify(newChats));

    // 修復每個聊天室對應的聊天紀錄
    for (const chat of newChats) {
        const key = `chat-${chat.id}`;
        const historyRaw = localStorage.getItem(key);
        if (!historyRaw) continue;

        try {
            const history = JSON.parse(historyRaw);
            const newHistory = history.map(msg => {
                msg.id = String(msg.id).replace(/\./g, "_");
                return msg;
            });
            localStorage.setItem(key, JSON.stringify(newHistory));
        } catch (e) {
            console.error("⚠️ 無法解析聊天紀錄：", key, e);
        }
    }

    alert("✅ 所有聊天 ID 已修復為安全格式（點 → 底線）！");
}

// 自動回覆
function showAiNewMessageBanner() {
    // 避免重複出現
    if (document.getElementById("ai-banner")) return;

    const banner = document.createElement("div");
    banner.id = "ai-banner";
    banner.innerHTML = `
        有新訊息喔！
        <span style="margin-left: 12px; cursor: pointer; font-weight: bold; color: white;" id="banner-close">✖</span>
    `;
    banner.style = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: #8f5163;
        color: #fff3f6;
        padding: 10px 20px;
        border-radius: 15px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        font-size: 14px;
        z-index: 9999;
        display: flex;
        align-items: center;
        transition: opacity 0.3s ease;
    `;

    document.body.appendChild(banner);

    // 點叉叉關閉
    document.getElementById("banner-close").addEventListener("click", () => {
        banner.remove();
    });

    // 自動消失
    setTimeout(() => {
        if (banner) banner.style.opacity = "0";
        setTimeout(() => banner.remove(), 300);
    }, 3000);
}

function formatFakeTime(date = new Date()) {
    return date.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
    });
}
function formatDuration(ms) {
    const totalMins = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    if (hours === 0) return `${mins}分鐘`;
    if (mins === 0) return `${hours}小時`;
    return `${hours}小時${mins}分鐘`;
}

function triggerAutoMessage(currentChatId, lastTime, now) {
    const chat = chats.find(c => c.id === currentChatId);
    if (!chat) return;

    const durationString = formatDuration(now - lastTime);
    const lastTimeFormatted = new Date(lastTime).toLocaleString("zh-TW");

    const formatRules = `
請遵守以下格式與限制：
- 每段訊息請用 [split] 分隔。
- 禁止使用 JSON 格式。
- 禁止使用括號、旁白。
- 請用繁體中文，模擬真實聊天語氣。
- 一條訊息只能包含一種格式，**語音、圖片、貼圖都請獨立發送**。

時間調整你的語氣與說話內容。你知道現在幾點，但不要輕易判斷這個時間對使用者來說是否晚了。

以下為可以使用的特殊格式，必須獨立一行，否則不會顯示，請依照${chat.aiPersona}人設來使用
語音格式：
[語音：內容]

圖片格式：
第一行：你要說的話（可以省略）
第二行：[圖片：圖片描述]

貼圖格式（只能使用下列清單，**禁止自創**）：
<貼圖: 貼圖描述 | 貼圖圖片URL>
${defaultStickers.map(sticker => `<貼圖: ${sticker.name} | ${sticker.url}>`).join("\n")}
`;

    const history = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");
    const contextLength = 20; // 看你想讓 AI 參考幾條，這邊可調整
    const contextMessages = history.slice(-contextLength);

    const chatHistoryText = contextMessages.map(m => {
        const who = m.sender === "me" ? (chat.myName || "你") : (chat.name || "AI");
        return `${who}：${m.text}`;
    }).join("\n");

    const prompt = `
你是 ${chat.name}，人設如下：${chat.aiPersona}

使用者上次和你聊天的時間是 ${lastTimeFormatted}，距離現在已經過了 ${durationString}，使用者${chat.myName}目前不在線上。
請你根據你的人設，寫出你在這段期間可能對使用者說的話。這些話可能是分享日常、你在做什麼、或你對使用者的想念。
如果離開時間只有幾個小時或者只是晚上到白天(睡覺)，可以不用發很多條訊息。
請注意，請不要讓角色在凌晨或清晨（例如 5 點、6 點）發出訊息，除非人設明確設定是早起型。

以下是你們之前的對話紀錄（僅供參考）：
${chatHistoryText}
這些訊息是你在過去幾小時中陸續發出的，不是現在才傳的，不可以說「你終於回來了」或「你不理我」這種句子。

${formatRules}
    `;

    const apiKey = localStorage.getItem("apiKey");
    const apiModel = localStorage.getItem("apiModel");

    fetch(`https://kiki73.shan733kiki.workers.dev/v1beta/models/${apiModel}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [{ text: prompt }]
                }
            ]
        })
    })
        .then(res => res.json())
        .then(data => {
            const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!geminiReply) return;

            const history = JSON.parse(localStorage.getItem(`chat-${currentChatId}`) || "[]");
            const replies = geminiReply.split("[split]").map(r => r.trim()).filter(Boolean);

            const interval = (now - lastTime) / (replies.length + 1);

            // 計算最早那一條訊息的時間（距離 now 最遠）
            const firstFakeTime = new Date(lastTime + interval * 1);

            // 顯示「正在輸入中...」
            const typing = document.createElement("div");
            typing.className = "message other";
            typing.innerHTML = `
                <img src="${chat.aiAvatar || 'default-avatar.png'}" class="avatar">
                <div class="bubble" style="color:#888; display: flex; align-items: center; gap: 5px;">
                    <svg id="dots" width="40px" height="18px" viewBox="0 0 132 58" xmlns="http://www.w3.org/2000/svg">
                    <circle id="dot1" fill="#A3A3A3" cx="25" cy="30" r="13" />
                    <circle id="dot2" fill="#A3A3A3" cx="65" cy="30" r="13" />
                    <circle id="dot3" fill="#A3A3A3" cx="105" cy="30" r="13" />
                    </svg>
                </div>
                <div class="time">${formatFakeTime(firstFakeTime)}</div>
            `;
            document.getElementById("messages").appendChild(typing);
            scrollToBottom();

            let i = 0;

            function sendOneMessage() {
                if (i >= replies.length) {
                    typing.remove();
                    return;
                }

                const fakeTime = new Date(lastTime + interval * (i + 1));
                const msg = {
                    id: Date.now() + Math.random(),
                    sender: "ai",
                    text: replies[i],
                    time: formatFakeTime(fakeTime), // ✅ 假造時間
                    timestamp: fakeTime.getTime(),
                    isVoice: false,
                    voiceContent: null,
                    timeDisplay: null
                };
                appendMessage(msg);
                history.push(msg);
                localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(history));

                i++;
                setTimeout(sendOneMessage, 600 + Math.random() * 2000); // 1.4~2 秒之間 // ← 這裡拉長
            }
            setTimeout(sendOneMessage, 800 + Math.random() * 600); // 0.8~1.4 秒之間
            //setTimeout(sendOneMessage, 2000 + Math.random() * 3000); // ← 這裡拉長
        })
        .catch(err => {
            console.error("AI 主動訊息錯誤", err);
        });
}

// 加入到 DOMContentLoaded 裡面或 main 初始化之後
function checkAutoMessage(currentChatId) {
    const autoSendHours = parseFloat(localStorage.getItem("autoSend") || "0");
    if (isNaN(autoSendHours) || autoSendHours <= 0) {
        console.log("🚫 主動訊息功能已關閉 (autoSend = 0)");
        return;
    }

    const lastTime = parseFloat(localStorage.getItem(`lastUserMessageTime-${currentChatId}`) || "0");
    if (!lastTime) return;
    console.log("🧪 自動檢查時間中：autoSend =", autoSendHours, " lastTime =", lastTime);

    const now = Date.now();
    const elapsed = now - lastTime;
    const hoursPassed = elapsed / (1000 * 60 * 60);
    console.log("⏳ 經過時間（小時）:", hoursPassed, "設定門檻:", autoSendHours);


    // 限制夜晚時段不發太多
    const nowHour = new Date().getHours();
    if (nowHour >= 3 && nowHour <= 7) {
        console.log("🌙 夜間模式開啟，跳過主動訊息");
        return;
    }


    if (hoursPassed >= autoSendHours) {
        console.log("✅ 符合條件，自動發送 AI 訊息");
        showAiNewMessageBanner();
        triggerAutoMessage(currentChatId, lastTime, now);
        // 更新發送時間避免重複觸發
        localStorage.setItem(`lastUserMessageTime-${currentChatId}`, now);
    }
}


