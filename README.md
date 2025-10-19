# MoonTV

<div align="center">
  <img src="public/logo.png" alt="MoonTV Logo" width="120">
</div>

> 🎬 **MoonTV** 是一個開箱即用的、跨平臺的影視聚合播放器。它基於 **Next.js 14** + **Tailwind&nbsp;CSS** + **TypeScript** 構建，支持多資源搜索、在線播放、收藏同步、播放記錄、雲端存儲，讓你可以隨時隨地暢享海量免費影視內容。

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-000?logo=nextdotjs)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-3178c6?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Docker Ready](https://img.shields.io/badge/Docker-ready-blue?logo=docker)

</div>

---

## ✨ 功能特性

- 🔍 **多源聚合搜索**：一次搜索立刻返回全源結果。
- 📄 **豐富詳情頁**：支持劇集列表、演員、年份、簡介等完整信息展示。
- ▶️ **流暢在線播放**：集成 HLS.js & ArtPlayer。
- ❤️ **收藏 + 繼續觀看**：支持 Kvrocks/Redis/Upstash 存儲，多端同步進度。
- 📱 **PWA**：離線緩存、安裝到桌面/主屏，移動端原生體驗。
- 🌗 **響應式佈局**：桌面側邊欄 + 移動底部導航，自適應各種屏幕尺寸。
- 👿 **智能去廣告**：自動跳過視頻中的切片廣告（實驗性）。

### 注意：部署後項目爲空殼項目，無內置播放源和直播源，需要自行收集

<details>
  <summary>點擊查看項目截圖</summary>
  <img src="public/screenshot1.png" alt="項目截圖" style="max-width:600px">
  <img src="public/screenshot2.png" alt="項目截圖" style="max-width:600px">
  <img src="public/screenshot3.png" alt="項目截圖" style="max-width:600px">
</details>

### 請不要在 B站、小紅書、微信公衆號、抖音、今日頭條或其他中國大陸社交平臺發佈視頻或文章宣傳本項目，不授權任何“科技週刊/月刊”類項目或站點收錄本項目。

## 🗺 目錄

- [技術棧](#技術棧)
- [部署](#部署)
- [配置文件](#配置文件)
- [訂閱](#訂閱)
- [自動更新](#自動更新)
- [環境變量](#環境變量)
- [客戶端](#客戶端)
- [AndroidTV 使用](#AndroidTV-使用)
- [Roadmap](#roadmap)
- [安全與隱私提醒](#安全與隱私提醒)
- [License](#license)
- [致謝](#致謝)

## 技術棧

| 分類      | 主要依賴                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------------- |
| 前端框架  | [Next.js 14](https://nextjs.org/) · App Router                                                        |
| UI & 樣式 | [Tailwind&nbsp;CSS 3](https://tailwindcss.com/)                                                       |
| 語言      | TypeScript 4                                                                                          |
| 播放器    | [ArtPlayer](https://github.com/zhw2590582/ArtPlayer) · [HLS.js](https://github.com/video-dev/hls.js/) |
| 代碼質量  | ESLint · Prettier · Jest                                                                              |
| 部署      | Docker                                                                    |

## 部署

本項目**僅支持 Docker 或其他基於 Docker 的平臺** 部署。

### Kvrocks 存儲（推薦）

```yml
services:
  moontv-core:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
      - NEXT_PUBLIC_STORAGE_TYPE=kvrocks
      - KVROCKS_URL=redis://moontv-kvrocks:6666
    networks:
      - moontv-network
    depends_on:
      - moontv-kvrocks
  moontv-kvrocks:
    image: apache/kvrocks
    container_name: moontv-kvrocks
    restart: unless-stopped
    volumes:
      - kvrocks-data:/var/lib/kvrocks
    networks:
      - moontv-network
networks:
  moontv-network:
    driver: bridge
volumes:
  kvrocks-data:
```

### Redis 存儲（有一定的丟數據風險）

```yml
services:
  moontv-core:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
      - NEXT_PUBLIC_STORAGE_TYPE=redis
      - REDIS_URL=redis://moontv-redis:6379
    networks:
      - moontv-network
    depends_on:
      - moontv-redis
  moontv-redis:
    image: redis:alpine
    container_name: moontv-redis
    restart: unless-stopped
    networks:
      - moontv-network
    # 請開啓持久化，否則升級/重啓後數據丟失
    volumes:
      - ./data:/data
networks:
  moontv-network:
    driver: bridge
```

### Upstash 存儲

1. 在 [upstash](https://upstash.com/) 註冊賬號並新建一個 Redis 實例，名稱任意。
2. 複製新數據庫的 **HTTPS ENDPOINT 和 TOKEN**
3. 使用如下 docker compose
```yml
services:
  moontv-core:
    image: ghcr.io/moontechlab/lunatv:latest
    container_name: moontv-core
    restart: on-failure
    ports:
      - '3000:3000'
    environment:
      - USERNAME=admin
      - PASSWORD=admin_password
      - NEXT_PUBLIC_STORAGE_TYPE=upstash
      - UPSTASH_URL=上面 https 開頭的 HTTPS ENDPOINT
      - UPSTASH_TOKEN=上面的 TOKEN
```

## 配置文件

完成部署後爲空殼應用，無播放源，需要站長在管理後臺的配置文件設置中填寫配置文件（後續會支持訂閱）

配置文件示例如下：

```json
{
  "cache_time": 7200,
  "api_site": {
    "dyttzy": {
      "api": "http://xxx.com/api.php/provide/vod",
      "name": "示例資源",
      "detail": "http://xxx.com"
    }
    // ...更多站點
  },
  "custom_category": [
    {
      "name": "華語",
      "type": "movie",
      "query": "華語"
    }
  ]
}
```

- `cache_time`：接口緩存時間（秒）。
- `api_site`：你可以增刪或替換任何資源站，字段說明：
  - `key`：唯一標識，保持小寫字母/數字。
  - `api`：資源站提供的 `vod` JSON API 根地址。
  - `name`：在人機界面中展示的名稱。
  - `detail`：（可選）部分無法通過 API 獲取劇集詳情的站點，需要提供網頁詳情根 URL，用於爬取。
- `custom_category`：自定義分類配置，用於在導航中添加個性化的影視分類。以 type + query 作爲唯一標識。支持以下字段：
  - `name`：分類顯示名稱（可選，如不提供則使用 query 作爲顯示名）
  - `type`：分類類型，支持 `movie`（電影）或 `tv`（電視劇）
  - `query`：搜索關鍵詞，用於在豆瓣 API 中搜索相關內容

custom_category 支持的自定義分類已知如下：

- movie：熱門、最新、經典、豆瓣高分、冷門佳片、華語、歐美、韓國、日本、動作、喜劇、愛情、科幻、懸疑、恐怖、治癒
- tv：熱門、美劇、英劇、韓劇、日劇、國產劇、港劇、日本動畫、綜藝、紀錄片

也可輸入如 "哈利波特" 效果等同於豆瓣搜索

MoonTV 支持標準的蘋果 CMS V10 API 格式。

## 訂閱

將完整的配置文件 base58 編碼後提供 http 服務即爲訂閱鏈接，可在 MoonTV 後臺/Helios 中使用。

## 自動更新

可藉助 [watchtower](https://github.com/containrrr/watchtower) 自動更新鏡像容器

dockge/komodo 等 docker compose UI 也有自動更新功能

## 環境變量

| 變量                                | 說明                                         | 可選值                           | 默認值                                                                                                                     |
| ----------------------------------- | -------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| USERNAME                            | 站長賬號           | 任意字符串                       | 無默認，必填字段                                                                                                                     |
| PASSWORD                            | 站長密碼           | 任意字符串                       | 無默認，必填字段                                                                                                                     |
| SITE_BASE                           | 站點 url              |       形如 https://example.com                  | 空                                                                                                                     |
| NEXT_PUBLIC_SITE_NAME               | 站點名稱                                     | 任意字符串                       | MoonTV                                                                                                                     |
| ANNOUNCEMENT                        | 站點公告                                     | 任意字符串                       | 本網站僅提供影視信息搜索服務，所有內容均來自第三方網站。本站不存儲任何視頻資源，不對任何內容的準確性、合法性、完整性負責。 |
| NEXT_PUBLIC_STORAGE_TYPE            | 播放記錄/收藏的存儲方式                      | redis、kvrocks、upstash | 無默認，必填字段                                                                                                               |
| KVROCKS_URL                           | kvrocks 連接 url                               | 連接 url                         | 空                                                                                                                         |
| REDIS_URL                           | redis 連接 url                               | 連接 url                         | 空                                                                                                                         |
| UPSTASH_URL                         | upstash redis 連接 url                       | 連接 url                         | 空                                                                                                                         |
| UPSTASH_TOKEN                       | upstash redis 連接 token                     | 連接 token                       | 空                                                                                                                         |
| NEXT_PUBLIC_SEARCH_MAX_PAGE         | 搜索接口可拉取的最大頁數                     | 1-50                             | 5                                                                                                                          |
| NEXT_PUBLIC_DOUBAN_PROXY_TYPE       | 豆瓣數據源請求方式                           | 見下方                           | direct                                                                                                                     |
| NEXT_PUBLIC_DOUBAN_PROXY            | 自定義豆瓣數據代理 URL                       | url prefix                       | (空)                                                                                                                       |
| NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE | 豆瓣圖片代理類型                             | 見下方                           | direct                                                                                                                     |
| NEXT_PUBLIC_DOUBAN_IMAGE_PROXY      | 自定義豆瓣圖片代理 URL                       | url prefix                       | (空)                                                                                                                       |
| NEXT_PUBLIC_DISABLE_YELLOW_FILTER   | 關閉色情內容過濾                             | true/false                       | false                                                                                                                      |
| NEXT_PUBLIC_FLUID_SEARCH | 是否開啓搜索接口流式輸出 | true/ false | true |

NEXT_PUBLIC_DOUBAN_PROXY_TYPE 選項解釋：

- direct: 由服務器直接請求豆瓣源站
- cors-proxy-zwei: 瀏覽器向 cors proxy 請求豆瓣數據，該 cors proxy 由 [Zwei](https://github.com/bestzwei) 搭建
- cmliussss-cdn-tencent: 瀏覽器向豆瓣 CDN 請求數據，該 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，並由騰訊雲 cdn 提供加速
- cmliussss-cdn-ali: 瀏覽器向豆瓣 CDN 請求數據，該 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，並由阿里雲 cdn 提供加速
- custom: 用戶自定義 proxy，由 NEXT_PUBLIC_DOUBAN_PROXY 定義

NEXT_PUBLIC_DOUBAN_IMAGE_PROXY_TYPE 選項解釋：

- direct：由瀏覽器直接請求豆瓣分配的默認圖片域名
- server：由服務器代理請求豆瓣分配的默認圖片域名
- img3：由瀏覽器請求豆瓣官方的精品 cdn（阿里雲）
- cmliussss-cdn-tencent：由瀏覽器請求豆瓣 CDN，該 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，並由騰訊雲 cdn 提供加速
- cmliussss-cdn-ali：由瀏覽器請求豆瓣 CDN，該 CDN 由 [CMLiussss](https://github.com/cmliu) 搭建，並由阿里雲 cdn 提供加速
- custom: 用戶自定義 proxy，由 NEXT_PUBLIC_DOUBAN_IMAGE_PROXY 定義

## 客戶端

v100.0.0 以上版本可配合 [Selene](https://github.com/MoonTechLab/Selene) 使用，移動端體驗更加友好，數據完全同步

## AndroidTV 使用

目前該項目可以配合 [OrionTV](https://github.com/zimplexing/OrionTV) 在 Android TV 上使用，可以直接作爲 OrionTV 後端

已實現播放記錄和網頁端同步

## 安全與隱私提醒

### 請設置密碼保護並關閉公網註冊

爲了您的安全和避免潛在的法律風險，我們要求在部署時**強烈建議關閉公網註冊**：

### 部署要求

1. **設置環境變量 `PASSWORD`**：爲您的實例設置一個強密碼
2. **僅供個人使用**：請勿將您的實例鏈接公開分享或傳播
3. **遵守當地法律**：請確保您的使用行爲符合當地法律法規

### 重要聲明

- 本項目僅供學習和個人使用
- 請勿將部署的實例用於商業用途或公開服務
- 如因公開分享導致的任何法律問題，用戶需自行承擔責任
- 項目開發者不對用戶的使用行爲承擔任何法律責任
- 本項目不在中國大陸地區提供服務。如有該項目在向中國大陸地區提供服務，屬個人行爲。在該地區使用所產生的法律風險及責任，屬於用戶個人行爲，與本項目無關，須自行承擔全部責任。特此聲明

## License

[MIT](LICENSE) © 2025 MoonTV & Contributors

## 致謝

- [ts-nextjs-tailwind-starter](https://github.com/theodorusclarence/ts-nextjs-tailwind-starter) — 項目最初基於該腳手架。
- [LibreTV](https://github.com/LibreSpark/LibreTV) — 由此啓發，站在巨人的肩膀上。
- [ArtPlayer](https://github.com/zhw2590582/ArtPlayer) — 提供強大的網頁視頻播放器。
- [HLS.js](https://github.com/video-dev/hls.js) — 實現 HLS 流媒體在瀏覽器中的播放支持。
- [Zwei](https://github.com/bestzwei) — 提供獲取豆瓣數據的 cors proxy
- [CMLiussss](https://github.com/cmliu) — 提供豆瓣 CDN 服務
- 感謝所有提供免費影視接口的站點。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=MoonTechLab/LunaTV&type=Date)](https://www.star-history.com/#MoonTechLab/LunaTV&Date)
