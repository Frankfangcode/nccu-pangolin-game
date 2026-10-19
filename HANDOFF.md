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
