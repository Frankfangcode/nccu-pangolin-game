# 派派的世界郵局 Demo — 2026-10-21

## 核可範圍
使用者核可先實作 demo。獨立 postcards.html，首頁歡迎畫面與說明可進入；沿用原 GitHub Pages。原生 HTML/CSS/ES modules、原校園美術；無新增套件、服務、付費或正式收件。這是前端示範，不把 localStorage 說成共用後端。

## 產品能力與資料流
六款原有校園插畫、中文／英文、20 個示範寄件國家與地區。名稱60字、祝福500字、校友身分、示範上牆勾選；不收信箱。選款＋即時預覽→本機儲存成功→8.5秒往返航線（42%出發／14%取件／44%回程）→送達資訊→本人示範牆。國家座標為示意，不是定位。卡片取件後才顯示在鳥嘴。

localStorage keys: nccu-postcards-demo-v1, nccu-postcards-draft-v1。獨立於校園遊戲存檔。卡片先寫入再演出；儲存失敗保留表單、不播放成功。id去重；最多100張，超限顯示失敗。每次輸入保存草稿，重載復原。使用textContent呈現所有輸入；不解析HTML。示範牆只有勾選public的本機卡片及清楚標示的3張虛構範例。清除資料有原生dialog確認。

## 選型與限制
採本機保存，如個人筆記本，最適合無成本驗證體驗。正式備援方案是另接學校管理或核可的收件後端；需先決定管理帳號、隱私／保存規則、審核流程與成本。Demo不是正式收件，不會寄信、不會同步、沒有管理審核。未實作遊戲內實體佈告欄，現以入口連結互通。建築沿用藝術化示意，未重新核實外觀。

## TDD及驗收證據
- createPostcard國際文字、trim、空訊息／超長／未知國家：先缺模組紅，再實作綠；最初assert import筆誤修正後確認通過。
- saveCard去重、重載、寫入失敗、損毀資料不悄悄覆寫：缺函式紅→實作綠。
- journeyFrame政大出發、目的地取件、帶卡返回：缺函式紅→實作→浮點到達端點誤差修正→綠。
- 真實瀏覽器：選款、法國送件、草稿與卡片重載、取件狀態、跳過、減少動態立即到達、日本、英文手機無橫向溢出、未勾選不上牆、清除成功。腳本與輸出位於 ../../work/postcard-demo/。
- 故障模擬：Storage寫入拋QuotaExceededError，保留祝福並顯示錯誤、不進入旅程。
- 本機安全檢查：合成 HTML／script 字串只當文字，無插入script/img或執行；不傳送表單資料至外部。無登入、權限、交易、第三方服務邊界可測。未對正式站主動安全測試。

## 兩輪前端自評
每輪viewport桌機1280×800、手機375×812；第二輪fullPage呈現完整流程。
第一輪：層次通過（主標60/手機38，正文16）；留白通過（主段56/80，欄位間16）；字體通過（宋體標題、Avenir/PingFang內文）；配色通過（既有紙白／綠／藍）；對齊通過；響應式通過；狀態通過（focus、錯誤、空牆、disabled、hover）；動效通過（可跳過與reduce）。另發現說明文字9/11px過小、信封未貼鳥嘴，批次修正。
第二輪：同八項全部通過；說明至少12px、標題使用26px階梯、鳥嘴對齊。最終圖 ../../work/postcard-demo/round2-desktop.png 與 round2-mobile.png。未做實體手機長測。

## 偵測與獨立審查
Impeccable手動偵測一次：tiny-text、undersized-ui-text、wide-tracking、cramped-padding與9/24px字級已依來源修正；cream-palette是既有DESIGN紙白背景，使用hooks ignore-value限定postcards.html紀錄。原始偵測JSON保留作修正前證據，不宣稱再次偵測零項。既有.impeccable/design.json schema過時，本輪未修復無關設定。
獨立finish reviewer disposition SHIP for local demo；3項P3（英語無障礙標籤、清除步驟狀態、跳過焦點）已修正。

## 動效 review-animations
| Before | After | Why |
| --- | --- | --- |
| 跳過後焦點停在隱藏按鈕 | 焦點移至送達標題 | 鍵盤流程連續 |
| 往返未隨方向翻面 | 按航向翻面；卡片放鳥嘴 | 取件敘事與方向一致 |
Approve：一次性8.5秒故事演出可跳過；只變換transform，拍翅以既有兩圖輪替；UI按壓120ms，hover限定滑鼠；減少動態直接到達；沒有自動循環頁面動畫。圖片輪替非GPU動畫，但沿用現有小型WebP且已本機檢查無錯誤；未量測實機FPS。
