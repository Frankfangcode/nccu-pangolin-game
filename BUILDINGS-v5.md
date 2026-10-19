# v5 建築外觀校正

## 目的與範圍
依 nccu100 專案的實景照片修正山下校區辨識特徵，保留平面卡通、俯視三分之四視角。位置、碰撞、路徑、任務與巡邏規則沿用 v4。沒有改動 nccu100 專案。

照片來源：[wenzhotw/nccu100](https://github.com/wenzhotw/nccu100)，`src/world/buildings/`。以下路徑相對於該目錄。原始照片不打包進遊戲。

| 遊戲地標／素材 | 參考照片 | 本輪辨識特徵 |
| --- | --- | --- |
| 羅馬廣場 roman | roman-plaza/photos/moon-gate-frames.jpg；overview-from-west-end.jpg | 灰色半圓迴廊、完整圓洞、平頂花架與藤蔓，去除古典拱廊和紅瓦 |
| 法學院 law | law-school/photos/aerial-northwest.jpg | 長條樓身、橘色直格柵、灰色端牆、兩個橘色凸盒、白色挑簷 |
| 資訊大樓 computer（含相連電算中心塔樓） | computer-center/photos/tower-and-info-building.jpg | 左高右低、塔樓冠頂與圓角柱、低樓連接翼、屋頂水塔 |
| 集英樓 jiying | jiying-hall/photos/front-north.jpg | 平頂、白色實牆、褐色水平帶窗、綠色與深藍店面、退縮騎樓 |
| 體育館 gym | track/photos/gym-and-track.jpg | 斜邊梯形正面、深色退縮入口、兩側黃綠面板，去除圓拱屋頂 |
| 行政大樓 admin | command-stand/photos/side-with-admin-building.jpg | 後方行政樓的灰色厚實量體、深窗洞、上層窄長窗；不把前景司令台誤畫為行政樓 |
| 綜合院館 zonghe | track/photos/gym-and-track.jpg | 淺灰粉色高樓、細密方窗、中間退縮水平連接翼，去除藍色圓筒 |

## 產品理解檢查點
- 能力／體驗：靠建築輪廓和色塊辨識地標，而不只靠名稱；集英樓改用專屬圖片。
- 結構／資料流：照片 → 模型生成卡通圖 → 去背 PNG → 地標資料選圖 → 主畫面及校園地圖共用。
- 設計理由：圖片保持比例，原有可行走範圍不變，降低換圖卡路的風險。
- 替代方案：直接使用照片可更精確，但與已核可畫風不合；逐棟三維建模會增加工時且改變現有技術方向。本輪採照片導引的卡通重畫。
- 安全／成本：沒有新增外部服務、登入、追蹤或執行時生成 API；圖像生成只在製作階段進行。沒有另外購買素材或新增付費相依。
- 驗證：對照照片辨識特徵、去背結果、遊戲載入、全套既有測試與兩輪雙尺寸視覺檢查；結果見 QA-v5.md。
- 限制：藝術化簡化，不是建築測繪；照片遮住的部分與背面為推定。其他建築尚未逐棟依外觀照片校正，部分來源僅有室內照，不能據此聲稱全校精確還原。
