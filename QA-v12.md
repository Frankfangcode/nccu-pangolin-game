# v12 QA

## 範圍、角色與環境
首次玩家：從正門直走、認得入校目標、漸進探索。手機玩家：搖桿和地圖不遮主角。地理內容：對照照片／來源說明，不能把推測當實測。發布維護：私有儲存庫只發布runtime。

## 實測
- Node 24，`node --test test/*.test.mjs`：58/58通過。正門直行、近鏡頭、未探索地圖、入門提示、Pages封裝各先紅後綠；原52測試繼續通過。
- `work/campus-v12/browser-check.js`：實際鍵盤從門外前進、發現校門、提示換回黑貓、重載保留紀錄、地圖不含遠處醉夢湖。以 /nccu-pangolin-game/ 子路徑驗證相對引用。
- `work/campus-v12/round2.js`：手機搖桿前進、放手停止、地圖搜尋不洩漏遠處地點、無橫向捲動。
- Console：0 errors / 0 warnings（playwright-cli console error）。
- 所有62地點仍有可通行路線，既有橋梁／河岸碰撞測試通過。

## 兩輪前端自檢
截圖皆1280×800 / 375×812，scale css，位於 ../../work/campus-v12/round1-desktop.png、round1-mobile.png、round2-desktop.png、round2-mobile.png。
| 項目 | 第一輪 | 第二輪 |
|---|---|---|
| 層次 | 近距離主角與入口明確；柱頂裁切待修 | 縮小紀念柱、調整出生點後入口可辨 |
| 留白 | 花叢出現在車道，需修 | 移到路邊，中央走道清楚 |
| 字體 | 沿用核可Avenir/PingFang介面，主場景無多層大標 | 保留清楚單行提示，對話既有層級 |
| 配色 | 卡通草地、奶白與森林綠UI延續；灰車道／磚步道為場景內容 | 同左，未增加介面主色 |
| 對齊 | 車道交界邊框重疊，需修 | 先畫全部道路外緣再鋪表面，接合改善 |
| 響應式 | 手機按鈕與主角分離，無橫向捲動 | 雙尺寸再次確認 |
| 狀態 | 未探索搜尋空狀態可理解，地圖可關閉 | 真實查詢無結果、焦點回遊戲通過；載入失敗既有測試保留 |
| 動效 | 沿用搖桿回中／按鈕回饋，鏡頭即時追隨 | 無新增開場縮放或延遲，低動態沿用 |

## review-animations
| Before | After | Why |
|---|---|---|
| 鏡頭原樣直接跟隨 | 固定近距離倍率、仍直接跟隨 | 不新增高頻縮放與補間，不增加暈動或操控延遲 |
結論 Approve：本輪未加UI過場，既有120ms回中與reduced-motion保留；未做實體手機長時間幀率測量。

## 資安與公開檔案
本機隔離測試，無第三方攻擊。封裝測試真實執行子程序，確認HTML、程式、圖片存在而HANDOFF與.git不存在；白名單不複製.env、原始照片、生成紀錄。已有存檔測試包含錯誤／過大／外來資料拒收。沒有登入、付費、上傳、雲端資料庫，因此這些權限測項不適用。GitHub部署權限僅contents:read、pages:write、id-token:write。

已證實缺陷：紀念柱阻擋入口、首屏過廣、地圖劇透、部分建築族群錯誤；已修正且重測。
待驗證風險：BUILDINGS-v12.md缺照列項、真實道路尺度；沒有宣稱全部實景還原。
改善提案：補照片後逐棟校正，不擅自推測。

## 偵測器
Impeccable回報index.html的body/main/dialog裁切定位元素；滿版Canvas和原生dialog為既有設計，雙尺寸實測控制完整可用。已用hooks ignore-value僅忽略該檔的clipped-overflow-container；未忽略其他規則。設計sidecar版本過舊已回報，不在本輪擅自重建。

2026-10-20 緊急發布：GitHub Actions／Pages 官方事故。已將白名單封裝推至 `gh-pages` 分支並切換 Pages 來源；最新建置指向提交 `85a8898`，仍在 `building`，GitHub Pages 網址 HTTP 404，未宣稱上線。

同版 v12 已更新到既有公開 Sites 網址，部署回報 `succeeded`，公開 URL 實測 HTTP 200。Playwright 在公開站實測：跳過開場、正門目標、地圖不顯示遠處醉夢湖、直走入校、提示推進、重新載入後保留到訪；1280×800 與 375×812 畫面已擷取到 `../../work/campus-v12/live-desktop.png`、`live-mobile.png`，console 0 errors / 0 warnings。此驗收不代表 GitHub Pages 已可玩，也未驗證實體手機長時間操作。
