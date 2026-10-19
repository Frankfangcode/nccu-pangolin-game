## 2026-10-20 使用者確認
使用者明確選擇「維持公開，使用 GitHub Pages」，取代先前私有儲存庫要求。保留現有public設定，不另建網站。再次查詢run39282052791仍queued、尚無執行步驟；Pages狀態errored。下一步仍是等待既有run結果並完成正式網址驗收，不能宣稱已上線。

## 2026-10-20 00:02 台灣時間：發布受GitHub服務異常阻塞
- 遊戲提交24b86ef61bddac53a3de98fecffa1c25e0b3bfaa已推送main，提交後全套58/58通過；證據 ../../work/campus-v12/main-tests.log。
- 發布工作 https://github.com/Frankfangcode/nccu-pangolin-game/actions/runs/39282052791 ，queued，尚未執行／上線。GitHub URL實測HTTP404。
- https://www.githubstatus.com/ 官方從2026-10-19 15:49 UTC通報Actions及Pages degraded performance。不要把排隊當部署成功；恢復後先追蹤同一次run，只有失敗才按證據重試。
- 已要求取消舊版run39280701699避免覆蓋；另一舊版39280036327已完成，未重啟。
- 遠端API最新回報private:false。本輪未呼叫修改visibility的指令；與先前私有要求不一致，已詢問使用者是否維持公開。回答尚未到，未擅自更動。
- 下一步：處理公開／私有回答；GitHub恢復後確認run成功，開 https://frankfangcode.github.io/nccu-pangolin-game/ 驗證v12、入校、地圖與手機操作。正式站驗收尚未完成。

# 本輪狀態 — v12

已核可：GitHub部署、全地點建築與道路比對、從正門逐步探索。GitHub依2026-10-20新授權維持公開。來源與限制見 BUILDINGS-v12.md，實作計畫 docs/campus-v12.md，QA見 QA-v12.md。

修改：正門外出生、紀念碑移旁、道路／門房；桌機1.75與手機1.15固定近距離鏡頭；地圖僅附近及已到訪地點；入門先導指示；四組生成素材校正五棟樓；五種命名道路表現；77個runtime檔案白名單封裝；GitHub Pages workflow自動全測後發布。

驗證：Node24 58/58測試；兩輪雙尺寸截圖見 ../../work/campus-v12/round2-desktop.png、round2-mobile.png；子目錄真實入校／地圖／重載／手機搖桿通過，console無錯誤。未新增套件、存檔欄位或付款服務。

重要限制：62個地點已逐項列比對結果，不等於全校建築均有實景照。缺照項、道路精確線形／尺度、門房造型仍待核實；完整動物鏈沿用單元與既有端到端證據，本輪未重走全鏈。GitHub新網域的進度與Sites分開。

部署：沿用 https://frankfangcode.github.io/nccu-pangolin-game/ ，GitHub Pages改workflow模式，.github/workflows/pages.yml。發布狀態於收尾補記。舊Sites未刪除，避免破壞既有連結，但不再作本輪發布目標。

---
以下為歷史紀錄：

# 本輪狀態 — v11.1

## 已核可
使用者要求私有GitHub `Frankfangcode/nccu-pangolin-game`、精簡常駐HUD、遊戲風格的小型手機搖桿。獨立2D專案，不修改nccu100。

## 修改
新增touch.mjs與joystick測試；rules支援類比速度；main整合觸控與情境警示；render減少標籤及舊方向按鈕；input保留鍵盤；index/style精簡HUD。無新增套件或存檔結構。

## 環境與驗證
Node24內建測試：`node --test test/*.test.mjs`，52/52通過。Python3啟動：`python3 -m http.server 8765 --bind 127.0.0.1`。無build/lint/typecheck設定；模組語法檢查及Impeccable檢查通過。
QA-v11.md列出雙指、放手、模態暫停與兩輪截圖。產品資料流：觸控／鍵盤→rules→render；quest/save保持既有。

## 局部決策與限制
任務完成後只留偵察按鈕；正常存檔不提示；危險才警示。96px搖桿、12%死區、類比速度、回中120ms。實體手機長時間測試未做。無CI；正式站與更新流程見下方。本機／ZIP仍可玩。

## 下一步
依使用者試玩回饋調整；不自行新增雲端帳號或付費服務。


## 2026-10-19 公開部署
使用者明確選擇「公開，有連結就能玩」。GitHub維持私有。
正式網址：https://nccu-pangolin-game.speedyswan.chatgpt.site
Sites project_id：appgprj_6ad63ae8b8108191b5278566f73523ca
版本：appgprj_6ad63ae8b8108191b5278566f73523ca~appgver_e453efb1ac448191b538307d40e7adcf
部署：appgdep_6ad63b5021348191a96aee1751a3eab8，succeeded。
遊戲來源：GitHub main a0c1578fb58b01d82f336d99922b3164d12dd3cc。
託管來源提交：ba1d315d3637d3788b48c6014ed9fc52418dc6ba。
託管工作區：../../work/sites/nccu-pangolin-game；身分已存在 .openai/hosting.json，不要再建立網站。
更新方式：同步已測試的 index.html、style.css、src/、已追蹤 assets/ 至 dist/；使用 Sites source helper推送封裝，save_site_version後deploy_site_version。GitHub push本身不自動發布。回復可重新部署既有已儲存版本；此次未演練回復。

### 驗證與限制
Node全套52/52通過。初次沙盒執行launcher失敗，允許本機連接埠後全套通過，未修改程式。
公開站以未登入的Playwright瀏覽器驗收：開場可載入，375×812搖桿移動、放手停止、雙指躲藏與獨立釋放、開關全校地圖通過，並擷取1280×800與375×812畫面。console 0 errors / 0 warnings。
QA角度：首次玩家載入與操控；手機互動可靠性；發布檔案邊界。靜態審查：程式無外部API請求或innerHTML，存檔驗證測試涵蓋錯誤／過大／外來資料。dist僅遊戲HTML/CSS/模組/圖片，未包含Git、憑證、測試、文件或原始生成素材。未對第三方託管平台進行主動攻擊測試。
無新增登入、交易或雲端資料庫。進度只存當前瀏覽器與網域，localhost進度不會遷移。正式站此次未重走完整動物任務鏈，沿用既有任務測試；實體手機長時間測試尚未做。未啟用付費操作；平台方案上限未另行查核。
