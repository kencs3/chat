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

// 進入聊天室
function openChat(id, name) {
    currentChatId = id;
    window.currentChatId = currentChatId;
    const chat = chats.find(c => c.id === id);

    document.querySelector(".chat-title").innerText = name;
    document.getElementById("page-chat").style.display = "none";
    document.getElementById("page-chatroom").style.display = "block";
    document.getElementById("contextLengthInput").value = chat.contextLength || 3;


    // 清空
    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = "";

    const history = JSON.parse(localStorage.getItem(`chat-${id}`) || "[]");
    history.forEach(msg => appendMessage(msg));

    // ✅ 全部加完再 scroll 到底
    messagesContainer.scrollTop = messagesContainer.scrollHeight;


    if (chat?.aiAvatar) {
        const avatarImg = document.querySelector(".chat-room-avatar");
        if (avatarImg) {
            avatarImg.src = chat.aiAvatar;
        }
    }

    // 讀取當前聊天室的人設
    currentAiPersona = chat?.aiPersona || "";  // 一次讀出
}


// 返回
document.querySelector(".back-btn").addEventListener("click", () => {
    document.getElementById("page-chatroom").style.display = "none";
    document.getElementById("page-chat").style.display = "block";
});

// 傳送
// 傳送按鈕事件監聽器
document.getElementById("sendBtn").addEventListener("click", async () => {
    const input = document.getElementById("messageInput");
    let text = input.value.trim();
    if (!text && !pendingImage) return; // 沒文字沒圖片就不送

    const time = formatTime();
    const currentId = window.currentChatId;
    const chat = chats.find(c => c.id === currentId);
    const history = JSON.parse(localStorage.getItem(`chat-${currentId}`) || "[]");

    const contextLength = chat.contextLength || 3;
    const recentMessages = history.slice(-contextLength);

    // 🔁 對話紀錄文字格式
    let chatHistoryText = "";
    recentMessages.forEach(m => {
        const who = m.sender === "me" ? (chat.myName || "你") : (chat.name || "AI");
        chatHistoryText += `${who}：${m.text}\n`;
    });

    // 🎤 語音訊息處理
    let isVoiceMessage = text.startsWith('語音：') && text.length > 5;
    let voiceContent = isVoiceMessage ? text.substring(5) : null;
    let timeDisplay = null;
    if (isVoiceMessage) {
        const charCount = voiceContent.length;
        const seconds = Math.max(1, Math.ceil(charCount / 2)); // 每2字1秒
        timeDisplay = `00:${seconds.toString().padStart(2, '0')}`;
    }

    // 🖼️ 加上待處理圖片
    let finalText = text;
    if (pendingImage) {
        finalText += `\n${pendingImage}`;
        pendingImage = null;
    }
    finalText = finalText.replace(/\[圖片：/g, "\n[圖片："); // 保證圖片描述獨立成行

    // 📨 顯示我方訊息
    const id = Date.now() + Math.random();
    const myMsg = {
        id,
        text: finalText,
        time,
        sender: "me",
        isVoice: isVoiceMessage,
        voiceContent,
        timeDisplay
    };
    appendMessage(myMsg);
    history.push(myMsg);
    localStorage.setItem(`chat-${currentId}`, JSON.stringify(history));

    input.value = "";

    // 🤖 插入 AI 正在輸入中
    const typing = document.createElement("div");
    typing.className = "message other";
    typing.innerHTML = `
        <img src="${chat.aiAvatar || 'default-avatar.png'}" class="avatar">
        <div class="bubble" style="color:#888;">對方正在輸入中...</div>
        <div class="time">${formatTime()}</div>
    `;
    document.getElementById("messages").appendChild(typing);

    // 🧠 建立 prompt
    const systemPrompt = `
你是 ${chat.name}。
請根據人設「${chat.aiPersona}」扮演他，僅用角色語氣第一人稱回話，不要有旁白、不要使用括號。
以下是你們剛剛的對話紀錄（僅供參考）：
${chatHistoryText}

你可以偶爾使用語音或圖片輔助說話，只有當你覺得非常可愛、有趣，或氣氛需要時才用。
但請以文字為主。不要頻繁使用圖片或貼圖。
- 如需要使用語音請用格式：
  [語音：內容]（請單獨一行，且不要加其他文字）

- 如需要使用圖片，請使用格式：
  第一行：可以是你要說的話，也可以省略）
  第二行：[圖片：圖片描述]
  例如：
  我今天看到這隻小狗好可愛
  [圖片：微笑的小狗]

請記得：
- 使用 [split] 分段。
- 千萬不要使用 JSON 格式。

使用者：${chat.myName}，人設：${chat.myPersona}
請用繁體中文回應。
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
        typing.remove();

        const geminiReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!geminiReply) throw new Error("Gemini 無內容");

        // 📤 處理 AI 回覆（切段 + 避免重複圖片網址）
        const replies = geminiReply.split("[split]").map(r => r.trim()).filter(Boolean);
        for (const reply of replies) {
            const replyTime = formatTime();
            const replyId = Date.now() + Math.random();

            const cleanReply = reply.replace(/https?:\/\/\S+\.(jpg|jpeg|png|gif)/gi, ""); // 移除網址
            const aiMsg = {
                id: replyId,
                text: cleanReply,
                time: replyTime,
                sender: "ai"
            };
            appendMessage(aiMsg);
            history.push(aiMsg);
            localStorage.setItem(`chat-${currentId}`, JSON.stringify(history));
        }

    } catch (err) {
        typing.remove();
        console.error("❌ Gemini 回覆失敗", err);
        alert("⚠️ Gemini 回覆失敗，請檢查 API Key 或模型！");
    }
});




// 畫泡泡
// ✅ appendMessage：根據訊息格式自動渲染正確內容
function appendMessage(msg) {
    const messages = document.getElementById("messages");

    const divWrapper = document.createElement("div");
    divWrapper.className = "message-wrapper";

    const div = document.createElement("div");
    div.dataset.id = msg.id || (Date.now() + Math.random());
    div.className = msg.sender === "me" ? "message me" : "message other";

    const currentId = window.currentChatId;
    const chat = chats.find(c => c.id === currentId);
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
                    <img width="24" height="24" src="https://img.icons8.com/material-rounded/24/play--v1.png" alt="play--v1"/>
                    <img width="23" height="23" src="https://img.icons8.com/ios/50/audio-wave--v1.png" alt="audio-wave--v1"/>
                    <span>${voiceDuration}</span>
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
    messages.scrollTop = messages.scrollHeight;

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

    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("apiModel", apiModel);

    alert("✅ 設定已儲存！");
});

// ============= 讀取 =====================
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 DOM 完成載入");

    // ========== 功能區塊 ==========
    // 畫聊天室列表
    renderChatList();
    // 初始化時呼叫
    applyUserSettings();

    // API Key
    document.getElementById("apiKey").value = localStorage.getItem("apiKey") || "";

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

    // ========== 角色設定 (有聊天室才跑) ==========
    const currentId = window.currentChatId;
    if (currentId) {
        document.getElementById("chatNameInput").value = localStorage.getItem(`${currentId}_chatName`) || "";
        document.getElementById("aiPersonaInput").value = localStorage.getItem(`${currentId}_aiPersona`) || "";
        document.getElementById("myPersonaInput").value = localStorage.getItem(`${currentId}_myPersona`) || "";

        const aiAvatarUrl = localStorage.getItem(`${currentId}_aiAvatarUrl`);
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

    editBtn.addEventListener("click", () => {
        isEditMode = !isEditMode;

        if (isEditMode) {
            alert("進入編輯模式，點選泡泡直接編輯，完成後再點儲存");

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
                history = history.filter(m => m); // 避免 undefined

                deleteTargets.forEach(id => {
                    const idx = history.findIndex(m => m && m.id?.toString() === id.toString());
                    if (idx !== -1) {
                        history.splice(idx, 1);
                        document.querySelector(`.message[data-id="${id}"]`)?.remove(); // 直接從畫面移除
                    }
                });
                localStorage.setItem(`chat-${currentChatId}`, JSON.stringify(history));
                alert("已刪除！");
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
                bubble.style.backgroundColor = "rgb(196, 134, 159)";
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
    document.getElementById("chatSettingsBtn").addEventListener("click", () => {
        const currentId = window.currentChatId;
        if (!currentId) {
            alert("未選擇聊天室！");
            return;
        }
        const chat = chats.find(c => c.id === currentId);
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

    // 監聽儲存
    document.getElementById("saveSettingsBtn2").addEventListener("click", () => {
        const currentId = window.currentChatId;

        if (!currentId) {
            alert("未找到聊天室 ID，請檢查 openChat 是否有設定 currentChatId");
            return;
        }

        const newName = document.getElementById("chatNameInput").value.trim();
        const aiPersona = document.getElementById("aiPersonaInput").value.trim();
        const aiAvatar = document.getElementById("aiAvatarUrlInput").value.trim();
        const myName = document.getElementById("myNameInput").value.trim();
        const myPersona = document.getElementById("myPersonaInput").value.trim();
        const myAvatar = document.getElementById("myAvatarUrlInput").value.trim();

        const idx = chats.findIndex(c => c.id === currentId);

        const contextLength = parseInt(document.getElementById("contextLengthInput").value) || 3;
        chats[idx].contextLength = contextLength;


        // 同步更新該聊天室項目的頭像
        document.querySelector(`.chat-avatar[data-chatid="${currentId}"]`).src = aiAvatar;
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
        const data = {
            chats: JSON.parse(localStorage.getItem("chats") || "[]"),
            messages: {},
            posts: JSON.parse(localStorage.getItem("posts") || "[]"),
            settings: {
                userNickname: localStorage.getItem("userNickname") || "user",
                userAvatar: localStorage.getItem("userAvatar") || "https://i.meee.com.tw/mYv66sr.png",
                postBg: localStorage.getItem("postBg") || "https://i.meee.com.tw/7RTGyUf.jpg"
            }
        };
        data.chats.forEach(chat => {
            data.messages[chat.id] = JSON.parse(localStorage.getItem(`chat-${chat.id}`) || "[]");
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "my-chats-backup.json";
        a.click();

        alert("已經成功匯出！");
    });

    // 點擊匯入按鈕
    document.getElementById("importChatsBtn").addEventListener("click", () => {
        document.getElementById("importChatsFile").click();
    });

    // 真的選檔案後
    document.getElementById("importChatsFile").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (!data.chats || !data.messages) {
                    alert("檔案格式錯誤，無法匯入");
                    return;
                }

                // 🔧 語音欄位補齊處理
                Object.keys(data.messages).forEach(chatId => {
                    data.messages[chatId] = data.messages[chatId].map(msg => {
                        // 統一 ID 為字串
                        msg.id = String(msg.id);

                        // 補語音欄位（只補 undefined 的，不會動到正常資料）
                        if (msg.isVoice === undefined) {
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
                        }

                        return msg;
                    });
                });

                // ✅ 儲存回 localStorage
                localStorage.setItem("chats", JSON.stringify(data.chats));
                Object.keys(data.messages).forEach(id => {
                    localStorage.setItem(`chat-${id}`, JSON.stringify(data.messages[id]));
                });

                if (data.posts) {
                    localStorage.setItem("posts", JSON.stringify(data.posts));
                }

                if (data.settings) {
                    localStorage.setItem("userNickname", data.settings.userNickname || "user");
                    localStorage.setItem("userAvatar", data.settings.userAvatar || "https://placekitten.com/80/80");
                    localStorage.setItem("postBg", data.settings.postBg || "https://placekitten.com/600/200");
                }

                alert("匯入成功，請重新整理頁面！");
            } catch (err) {
                alert("匯入失敗，請確認檔案格式");
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
            localStorage.removeItem("chats");
            localStorage.removeItem("posts");
            localStorage.removeItem("userNickname");
            localStorage.removeItem("userAvatar");
            localStorage.removeItem("postBg");
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
你現在是 ${roleName}，以下是你的人設：「${persona}」
請你完全扮演這個角色，使用第一人稱語氣、符合人設個性進行回覆。

目前的場景如下：
📝 貼文內容：「${postToUpdate.text}」
💬 有人留言：「${reply}」

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
        document.querySelectorAll(".bubble").forEach(b => {
            b.contentEditable = "false";
            b.style.border = "";
        });

        alert("已取消編輯模式");
    });

    // 刪除貼文
    let isDeletePostMode = false;
    let deletePostTargets = [];
    deltetPostBtn.addEventListener("click", () => {
        isDeletePostMode = !isDeletePostMode;
        if (isDeletePostMode) {
            alert("點選要刪除的貼文，再按 ✔️ 確認刪除");
            deltetPostBtn.innerHTML = `
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
            deltetPostBtn.innerHTML = `
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
        deltetPostBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#434343">
                    <path
                        d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                </svg>
        `;
        cancelPostBtn.style.display = "none";
        deletePostTargets = [];
        document.querySelectorAll(".post").forEach(p => {
            p.classList.remove("delete-border");
            p.style.backgroundColor = "";
        });
        alert("已取消刪除模式");
    });

    // 角色發動態
    document.getElementById("characterPostBtn").addEventListener("click", async () => {
        const currentId = window.currentChatId;
        if (!currentId) {
            alert("請先選擇一個聊天室");
            return;
        }

        const chats = JSON.parse(localStorage.getItem("chats") || "[]");
        const currentChat = chats.find(c => c.id === currentId);
        const roleName = currentChat?.name || "角色";
        const persona = currentChat?.aiPersona || "";

        // 取得最近聊天
        const history = JSON.parse(localStorage.getItem(`chat-${currentId}`) || "[]");
        const last10 = history
            .slice(-10)
            .map(m => `${m.sender === "me" ? "使用者" : roleName}：${m.text}`)
            .join("\n");

        const systemPrompt = `
你是
${roleName}
人設：${persona}

以下是最近和使用者的對話：
${last10}

請以其中出現的話題作為素材，寫一篇日常簡短的貼文，只能包含貼文內容，請避免不相關的內容，保持角色語氣，用繁體中文。
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
                liked: false,
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
        const currentId = window.currentChatId;
        if (!currentId) {
            alert("請先選擇一個聊天室，因為要抓角色設定。");
            return;
        }
        const chats = JSON.parse(localStorage.getItem("chats") || "[]");
        const currentChat = chats.find(c => c.id === currentId);
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
            promptText += "短貼文，簡單分享生活動態，自然表達生活或心情，不要假設使用者在旁邊，不要旁白，不要劇情描述，直接講內容，使用繁體中文。";
        } else {
            promptText += "像是在私人日記書寫，請多寫幾句，描述今日的心情與小細節，不要假設使用者在旁邊，不要旁白，直接用日記風格，使用繁體中文。。";
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
            console.error(err);
            alert("角色貼文失敗，請檢查 API 設定。");
        }
        post.comments.forEach(c => {
            const cmt = document.createElement("div");
            cmt.className = "comment-block";
            cmt.dataset.commentId = c.id;
            cmt.dataset.postTime = post.time;
            cmt.style.marginTop = "5px";
            cmt.style.fontSize = "14px";
            const displayName = c.user || c.nickname || "匿名";
            cmt.textContent = `${displayName}：${c.text}`;
            div.appendChild(cmt);
        });

    }


});


// 監聽愛心按鈕打開設定
document.getElementById("chatSettingsBtn").addEventListener("click", () => {
    const currentId = window.currentChatId;
    if (!currentId) {
        alert("未找到聊天室 ID，請先選一個聊天室！");
        return;
    }

    const chat = chats.find(c => c.id === currentId);
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
        document.querySelector(".ai-avatar-preview").innerHTML = "";
    }

    if (chat.myAvatar) {
        document.querySelector(".my-avatar-preview").innerHTML =
            `<img src="${chat.myAvatar}" style="width:80px;border-radius:50%">`;
    } else {
        document.querySelector(".my-avatar-preview").innerHTML = "";
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

async function autoCommentFromAI(postText) {
    const currentId = window.currentChatId;
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const currentChat = chats.find(c => c.id === currentId);

    const roleName = currentChat?.name || "角色";
    const persona = currentChat?.aiPersona || "";

    const systemPrompt = `
你現在是 ${roleName}，以下是你的人設：「${persona}」
請你完全扮演這個角色，使用第一人稱語氣、符合人設個性進行回覆。

目前的場景如下：
📝 貼文內容：「${postToUpdate.text}」
💬 有人留言：「${reply}」

請你以簡短、自然、貼近角色風格的語氣，針對上面這則留言回覆一句話。
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
請針對一則貼文「${userPost}」以留言的形式，用${characterName}的語氣回覆，請使用第一人稱，並且口語化。只需要留言的內容，不要多餘解說，使用繁體中文。`;

    const apiModel = localStorage.getItem("apiModel") || "gemini-pro";
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



