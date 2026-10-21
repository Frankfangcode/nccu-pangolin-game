## 本輪狀態 — 派派頭部與步行修正（2026-10-21）
目標：使用者回饋走路時身體應穩定、頭會動，飛行目前不錯應保留。從同步的 main b83604d 建立 `paipai-ground-motion`，開工無未提交修改。
修改：以現有地面臺灣藍鵲圖片在 Canvas 上分出固定身體／尾巴、可轉動頭部與橘色雙腳；走路時只依實際步距改變頭角度和腳姿，停住恢復安定。地面移除整隻鳥的上下浮動及傾斜；飛行素材、拍翅節奏與起降仍沿用原邏輯。模組快取版本 v20；無新圖片、套件、存檔欄位或外部服務。
驗證：新行為測試紅→綠，`node --test test/paipai.test.mjs` 10/10 通過；完整 `node --test test/*.test.mjs` 103/103 通過，封裝 95 個 runtime 檔，Impeccable 偵測 `[]`。本機 1280×800、375×812 兩輪截圖 `../../work/paipai-ground-motion/round{1,2}-{desktop,mobile}.png`，目視身體穩定、頭腳動作可見且版面無新增缺陷。瀏覽器重測起飛高度 1、拍翅相位增加、降落高度 0、減少動態設定生效、console 0 errors / 0 warnings。完整 QA 見 `QA-paipai.md`。
局部決定：以畫布遮罩現有圖片分層，不新增美術素材；腳部色彩遮罩依目前橘色素材，未來換圖時應複查。實體手機長時間效能未測。
發布：完成全測、合併、push 與原 Pages 網址驗收後回填。

## 本輪狀態 — 派派步行與飛行動作（2026-10-21）
目標：只改善派派走路、飛行與起降的姿勢和節奏，保留校園版、控制方式、建築與探索流程。工作分支 `paipai-motion` 自同步的 `origin/main` 490962d 開始；開工時無未提交修改。
修改：加入走路跨步與飛行下拍兩張臺灣藍鵲原圖及 WebP；依實際移動距離推進步伐，停止或撞牆時回到站姿；空中拍翅時鐘只在遊戲狀態更新時推進，起降連續混合姿勢。減少動態偏好維持靜態姿勢。新增素材列入 manifest、Git 白名單與快取版本 v18。無新套件、存檔欄位或外部服務。
驗證：TDD 紅綠循環 3 個新行為；`node --test test/*.test.mjs` 102/102 通過，`scripts/package-site.mjs` 封裝 95 個 runtime 檔，Impeccable 偵測 0 項。瀏覽器在 1280×800、375×812 各做兩輪截圖，見 `../../work/paipai-motion/round{1,2}-{desktop,mobile}.png`；手機搖桿移動、起飛、拍翅、降落、減少動態均驗收，console 0 errors / 0 warnings。詳見 `QA-paipai.md`。
局部決定：使用原有畫風生成兩張補間姿勢，用 Canvas 依步距與拍翅相位合成，不修改地圖或 UI。限制：只用兩張姿勢圖組合，尚未有完整逐格骨骼動畫；實體手機長時間效能未測。
發布：提交 `fc9f4f6fe6742db8585ea1e18f93b479b2dcd5f0` 已快轉合併 main，main 全測 102/102；遠端 main 與提交相同。既有 Pages run 39557815827 成功，最新 Pages build 指向本提交且 `built`、error null。正式網址 https://frankfangcode.github.io/nccu-pangolin-game/ 真實瀏覽器載入 `paipai.mjs?v=18` 與兩張 v18 WebP，按起飛高度到 1、落地高度回 0，console 0 errors / 0 warnings。文件狀態以後續 `[skip ci]` 提交回補，遊戲檔不再變動。

## 本輪狀態 — 派派校園入口（2026-10-21）
目標與授權：使用者要求原校園版回到首頁，新增臺灣藍鵲派派可飛行並認識校舍；原 GitHub Pages 網址自動發布。參考政大記憶網校園建物與既有校園相對位置。
工作區：`paipai-integration` 由 `origin/main` 32e252a 建立；較早本機原型 971ab8e 在 local main，未強推至遠端。整合時保留 v16 溪邊篇至 `meadow.html`，v16 全校穿山甲於 `classic.html`；派派取代 `index.html`。其餘 v15/v16 模組保持。
修改：新增派派移動、飛行、鏡頭、探索、地圖、獨立存檔；新增臺灣藍鵲飛行圖和第八教室／校友服務中心獨立外觀；兩張原圖轉為 WebP 並列入既有封裝。來源及尚未核實的建築見 `BUILDINGS-paipai.md`，測試及手動驗收見 `QA-paipai.md`。README 與 DESIGN 更新。
驗證：`node --test test/*.test.mjs` 在允許本機 127.0.0.1 的環境 99/99 通過；封裝追蹤檢查通過。真實瀏覽器 1280×800、375×812 載入派派，實玩起飛、移動、地圖搜尋四維堂；`meadow.html` 和 `classic.html` 均載入、無 pageerror。Impeccable 偵測 0。整合後截圖在 `../../work/paipai-integration-{desktop,mobile,map}.png`。
限制：39 棟建築中部分仍共用概念插畫；30 棟有文字史料線索，9 棟缺可核實外觀資料，不能宣稱全部已像實景。道路與比例是遊戲化示意。實體手機長測未做。
發布：整合提交 `29a4466f3ee28b5c2876a5c5e4b3f7b7b8a41441` 已推送 `main`；main 重跑 99/99 通過。GitHub Pages `pages-build-deployment` run 39551402966 建置與部署皆成功，來源 main:/，沿用原網址 https://frankfangcode.github.io/nccu-pangolin-game/ 。公開瀏覽器驗證派派首頁可載入、起飛、搜尋並開啟四維堂史料卡；`meadow.html`、`classic.html` 都回 HTTP 200 且可載入。正式頁無 pageerror。
下一步：逐棟收集可用的外觀照片並重畫共用建築插畫；道路尺寸與入口朝向核對。此部分尚未完成，不可宣稱每棟外觀已還原。


## v16 溪邊篇：取代正式遊戲（2026-10-20）
使用者決定不再照實際校園建模，改做像 Sneaky Sasquatch 的純玩法遊戲，一塊一塊集中做；第一塊「溪邊野餐草地」，取代正式遊戲。舊的全校版移到 classic.html（程式與存檔不動）。
新程式在 src/meadow/：world.mjs（2400×1500 場景：溪與碼頭、兩塊野餐墊、帳篷、烤架、冷藏箱、魚桶、垃圾桶、牌子、7 個花叢、10 棵樹、3 個蟻丘、洞穴、黑貓、5 個路人與作息）、play.mjs（偷東西：有人看著就立刻被追；背包 6 格；吃東西回體力；翻垃圾桶會吵到 280 內的人、40 秒冷卻；黑貓三個委託 香腸→魚→養樂多；被抓沒收食物留瓶蓋；坐著的人每次抬頭換方向看；存檔 pangolin-meadow-v1）、draw.mjs（原本畫風：草地／步道／水紋理、原本的樹、花叢、告示牌、黑貓、換色路人、程式畫的 3/4 小物與食物圖示）、main.mjs（主迴圈；洞穴是安全區，逃進去追的人就放棄）。沿用 rules／forage／touch／input。介面：左上體力＋委託、左下背包、右下互動／躲藏、第一次移動後收起拖曳提示。test/meadow.test.mjs 9 項；deploy、launcher 測試改檢查新首頁與 classic.html。驗證：844×390 觸控實玩 拖曳移動、偷雞排、背包吃掉、當面偷被追、逃回洞穴解除、三個委託通關顯示完成卡，console 乾淨。
限制：坐著的人沿用站姿圖；鴨子只是裝飾；宿舍區等下一塊尚未開始。

## v16 吃螞蟻覓食（2026-10-20，直接做在正式遊戲）
依規劃 3a。src/forage.mjs：體力（走路每秒 1/150，低於 0.2 走路 ×0.6）、蟻丘判定、分數換體力（×0.07，上限 1）、蟻丘 60 秒（場景時間）後重生、點螞蟻小遊戲（15 秒，三條蟻道，約五分之一是紅色兵蟻，點到扣 2）。小遊戲是右下面板不是對話框，世界照常運作：被追或拖曳離開 40 單位就中斷。world.mjs：校門內兩個教學蟻丘＋每六棵樹旁一個，共 21 個。左下體力圓餅，低體力變紅脈動。覓食時隱藏互動／躲藏鈕以免與面板重疊。體力與蟻丘狀態只存在這次遊玩，未寫入存檔（存檔格式不變）。全域關閉點擊高亮。test/forage.test.mjs 6 項。驗證：844×390 觸控吃完一局體力回滿、蟻丘變空、路人看到時中斷，console 乾淨。

## v15 手機優先操作（2026-10-20）
使用者要完全為手機打造，正式遊戲地圖與內容不動，只換操作與呈現。touch.mjs：按住畫布任何位置即出現浮動搖桿（半徑48），互動／躲藏鈕仍在右下可多指同時用；鍵盤保留。style.css：取消 .game-shell 最小高度 480（原本在橫向手機把下方按鈕推出畫面）、短螢幕精簡 HUD（隱藏標題與任務面板、小地圖 84px、危險提示移到下方）、對話與特寫在橫向時靠右下且不超高、直向觸控顯示「轉成橫向更好玩」。render.mjs：觸控鏡頭依螢幕高度縮放（height/430，0.78～1.15）。特寫提示在觸控裝置不再寫「或按 E」。模組版本 v15。驗證：844×390 觸控拖曳往北移動 200 單位、黑貓對話、四維堂特寫完成、直向轉向提示，console 乾淨；75/75 測試。

## v15 區域一 第二版：原本畫風＋nccu100 配置（2026-10-20）
使用者要求：圖像設計沿用原本穿山甲遊戲，位置與建築照 nccu100；要修整體質感與建築造型。改為原遊戲的 3/4 立體插畫畫法（正面＋東側面＋頂面、細深描線、頂亮側暗），重畫紅磚門房＋屋簷、校名碑（gate-1 配色，加「國立政治大學」直書牌）、英文矮牆、花台、綠籬、安全島、柵欄機、導覽圖、短柱、噴水池；直接沿用原素材：gatehouse-v12（警衛亭）、tree、pack-1（花叢）、pack-2（布告欄）、grass 紋理、quest-cat（黑貓在校門內等候）。地面改用原 landscape.mjs 的車道灰／石磚／路緣色。

## v15 區域一：正門到噴水池（2026-10-20）
使用者要求參考 wenzhotw/nccu100（準確校園）並一塊一塊做。區域一範圍 x −46～46、z −47～39 公尺：指南路（斑馬線、慢慢、公車站、機車）、兩棟紅磚門房＋混凝土屋簷、中央警衛亭／安全島／柵欄機、校名碑、英文矮牆、花台、綠籬、校內廣場與停車格、校門大道（旗桿、短柱、導覽圖）、八德道路口、椰子樹、噴水池。資料在 src/regions/main-gate.mjs（座標照抄 nccu100 並註明檔案來源），繪製引擎 src/art/region.mjs（正俯視，高度往上投影；28 單位/公尺；角色 72）。sample.html 改為區域一檢視器，有碰撞。test/region.test.mjs 檢查地標位置與每種物件都有繪製函式。下一塊區域另開資料檔，不要一次全做。

## v15 風格樣張 第二版（2026-10-20）
使用者回饋第一版造型醜、與原本不一致。改為：角色沿用原遊戲切面風格的穿山甲與路人圖（換色做出警衛／慢跑者／看書學生），環境樹木／樹叢／石頭改為低多邊形切面加亮暗面，草地加草葉紋理，手機橫向鏡頭拉近。圓頭新造型 person()/pangolin() 不再使用。

## v15 風格樣張（2026-10-20）
依 docs/sasquatch-direction-plan.md 階段1第一步，新增獨立頁 sample.html：正門前廣場與林蔭步道，全部由程式產生 SVG（src/art/palette.mjs 色盤、src/art/sprites.mjs 物件、src/art/sample.mjs 場景）。正俯視、無描邊、同色系陰影；新造型路人（滑手機學生、慢跑者、看書學生、打瞌睡警衛）、鴿子被靠近會飛走、可走動與蜷縮；手機直向提示轉橫向。test/art.test.mjs 強制所有顏色出自色盤。現行遊戲未改動。待使用者確認方向後才推廣到正式場景。新目錄要記得加入 .gitignore 白名單。

## v14.2 修正：新檔被 .gitignore 白名單擋下（2026-10-20）
v14 起正式站卡在「素材載入中…」：.gitignore 預設忽略全部，src/closeup.mjs 與所有 .webp 未被提交，main.mjs 匯入 404 導致整個模組失敗。已在白名單加入 src/*.mjs、assets/**/*.webp、test/*.mjs 等，並新增 deploy 測試：封裝出的每個執行檔都必須被 git 追蹤。驗證改用「從提交 clone 的乾淨副本」在瀏覽器實跑。新增檔案時務必確認 git status 有出現。

## v14.1 素材瘦身（2026-10-20）
使用者回報正式站卡在「素材載入中…」很久。原因：開場前要下載54張PNG共17.4MB。新增 scripts/optimize-assets.py 產生 .webp（場景圖最長邊1024、任務小圖縮到實際顯示尺寸，故事插畫保留1536），manifest、故事、封裝改讀 .webp；PNG 保留為原始檔。啟動下載 17.4MB→約1.5MB；模擬快速4G 2.0秒進入故事。按鈕顯示載入百分比。70/70測試，畫面目視無明顯失真，console乾淨。新增或替換 PNG 後要重跑 optimize-assets.py。

## v14 人類習慣與特寫搞怪（2026-10-20）
使用者看過 Sneaky Sasquatch 截圖後，要求做「人類狀態畫在頭上」與「手入鏡特寫」兩項並直接更新 GitHub。
修改：rules.mjs 新增 ACTIVITIES／advanceActivities／visionOf／isWaking／nearbyPrank；world.mjs 五位巡邏者各有排程；render.mjs 依習慣畫視線錐、手機與泡泡（最上層）；新增 closeup.mjs 與 #closeup 對話框；main 在搞怪處開特寫、完成後才計分；說明加習慣圖示解說；版本號 v=14。無新存檔欄位、套件或外部服務。
驗證：70/70 測試；Playwright 桌機與手機實玩特寫與排程，console 乾淨。詳見 QA-v14.md。
發布：推送 main 即由 GitHub Pages（main:/）部署。


## v13 正式站發布驗證（2026-10-20）
遊戲提交 d95735157efab87135864dd65acb2cee3c4defdf 已推送main，main全測61/61。GitHub Pages最新build同提交、built、error:null。正式網址 https://frankfangcode.github.io/nccu-pangolin-game/ 實際載入main.mjs?v=13；全新瀏覽器以手機搖桿入校、鍵盤走完全部五階段、開啟偵察、重載保持complete，console無錯誤／警告。來源維持API當前main:/；舊gh-pages分支未使用，Sites未更新。後續直接main推送會觸發此部署，不需重複觸發。

# 本輪狀態 — v13 小段冒險

使用者授權：先將正門→林蔭步道→黑貓→藍鵲做到願意重玩的品質。計畫 docs/small-adventure-v13.md；證據 QA-v13.md。
修改：黑貓在入口等候、樹蔭框景、攜帶與交還收藏的場景結果、短暫拾取／交友回饋、動物朝向與微動、對話收起路線／標籤、手機提示避開角色。沒有新存檔欄位或外部服務。
驗證：61/61 Node測試；真實鍵盤五階段任務、實際警戒／被捕／重試、手機搖桿／停止、對話暫停、重載、結尾偵察，兩輪雙尺寸截圖。詳細見QA。
局部決定：黑貓仍叫半山腰的黑貓，對話交代下山散步；場景物件由既有stage推導。減少動態取消裝飾位移。既有未提交內容為空，本輪main上實作。
限制：無新角色表情素材或音效，校園尺度維持既有藝術化示意，實體手機長測未做。
部署查證：GitHub Pages已恢復；API當前source是main:/、build_type legacy（與先前記錄gh-pages不同）。沿用當前設定，不重新切換或另建站。發布後回填提交與網址驗證。

## 2026-10-20 緊急發布更新
- 使用者要求盡速上線。GitHub 官方同時通報 Actions 與 Pages 降級；原 workflow run 39282052791 持續 queued，已提出取消並停用該 workflow，避免兩套發布流程競爭。
- Node 24 完整測試 58/58 通過（允許本機回環連接埠的環境）；`scripts/package-site.mjs` 封裝 77 個 runtime 檔與 `.nojekyll`。封裝從獨立暫存庫推至公開 `gh-pages` 分支提交 `85a88982877a9615611b1418cee378633e2670f1`。Pages 設定改為 `legacy`，來源 `gh-pages:/`，沿用原網址 `https://frankfangcode.github.io/nccu-pangolin-game/`。
- GitHub Pages API 已接收手動建置，最新建置指向上述提交但仍 `building`；公開網址實測 HTTP 404，**GitHub Pages 尚未上線**。恢復後要檢查建置結果並在原網址走正門、地圖與手機操作。後續正式更新若維持分支來源，需重新封裝、推送 `gh-pages`，並驗證；舊 workflow 已停用。
- 為讓玩家立即玩到 v12，沿用既有公開 Sites 專案與原網址 `https://nccu-pangolin-game.speedyswan.chatgpt.site/`。來源提交 `d131a460daa2c5ee49107654f55c190e302047d3`，保存版本 `appgprj_6ad63ae8b8108191b5278566f73523ca~appgver_77afc0dfc2c08191bbe51e893e19cdc4`，部署 `appgdep_6ad64456530c8191b9e947029d8588ff` 成功。公開網址 HTTP 200；真實瀏覽器驗證入校、探索揭露、進度保存、桌機與手機畫面，console 0 errors / 0 warnings。此網址不是 GitHub Pages。
- 本輪未修改遊戲程式；本交接文件與 README／QA 的狀態更新以 `[skip ci]` 提交至 main。

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
