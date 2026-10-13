# PROMPT — Sinh BE Spring Boot (Package by Feature) từ FE `Comics_FE`

> **Cách dùng:** Copy khối "PROMPT" bên dưới vào Claude Code / Cursor / Copilot Agent, giao cho nó build thẳng dự án Spring Boot.
> File này được sinh từ việc đọc toàn bộ `src/services`, `src/features`, `src/routes`, `src/providers` của FE.

---

# PROMPT

## 0. Bối cảnh & mục tiêu

Tôi có một dự án frontend React (CRA, `react-app-rewired`, MUI + SCSS module) tên **Comics / Manga platform** — nền tảng đọc truyện tranh online tiếng Việt, kiểu tương tự Otruyen. Tôi cần bạn xây dựng **backend Spring Boot** tương ứng 100% với các API mà frontend đang gọi.

**Nguồn đích (contract bắt buộc):** toàn bộ endpoint dưới đây được trích trực tiếp từ `src/services/*.js` của FE, giữ nguyên path, method, query param, body field, và tên field trong response mà FE đọc. **Không được tự ý đổi tên path/param/field** — nếu thấy contract có vẻ sai, hãy implement đúng như FE cần rồi ghi chú vào cuối.

**Ngôn ngữ:** Java 21, Spring Boot 3.4.x, Gradle (kèm `pom.xml` nếu tôi yêu cầu). Tiếng Anh cho code, **tiếng Việt cho message lỗi trả về client**.

---

## 1. Yêu cầu kiến trúc: **PACKAGE BY FEATURE** (bắt buộc)

Tuyệt đối **KHÔNG** dùng package-by-layer (`controller/`, `service/`, `repository/`, `entity/`, `dto/` rải rác). Mỗi nghiệp vụ là **một feature package độc lập**, tự chứa đủ tầng.

### 1.1. Cấu trúc chuẩn cho MỘT feature

```
com.comics.<module>.<feature>/
├── api/                        # HTTP layer (REST)
│   ├── <Feature>Controller.java
│   └── <Feature>Mapper.java    # <Feature>Dto <-> domain model (MapStruct)
├── domain/                     # JPA + domain service
│   ├── model/                  # Entity, Aggregate
│   └── repository/             # Spring Data JPA (CHỈ của feature này)
├── application/                # Use case / orchestration
│   └── <Feature>Service.java   # @Service, @Transactional
└── infrastructure/             # adapter ra ngoài: storage, message broker, 3rd-party API
    └── <Xxx>Adapter.java
```

### 1.2. Quy tắc bắt buộc

| # | Quy tắc |
|---|---|
| R1 | Một feature = một package top-level. Ví dụ: `com.comics.manga`, `com.comics.manga.comment`, `com.comics.manga.bookmark` — KHÔNG gộp comment vào `comics.manga`, vì đó là bounded context riêng trong FE. |
| R2 | Feature **không được import entity/repository của feature khác**. Muốn dùng dữ liệu feature khác → gọi qua interface trong `application` của feature đó (public API của feature), hoặc qua event. |
| R3 | Entity nằm ở `domain/model`. Nếu muốn domain sạch tuyệt đối, dùng **Spring Data JDBC**; nếu dùng JPA thì document rõ entity được annotate trong `domain/model`. |
| R4 | **Không có** package `common/dto`, `common/entity`, `common/util` chứa model nghiệp vụ. `common` chỉ chứa hạ tầng thật sự dùng chung (xem §1.4). |
| R5 | Mỗi feature có **file `package-info.java`** mô tả bounded context, ownership của bảng, và dependency ra ngoài. |
| R6 | Naming: Controller = `<Feature>Controller`, Service = `<Feature>Service`, Mapper = `<Feature>Mapper`, Event = `<Feature><Event>` trong sub-package `event/`. |
| R7 | Cấu hình chạy (`@Configuration`, security, cache) **không** đặt trong feature package; đặt ở `config/`, `security/`, `infrastructure/`. |



### 1.3. Cây package cụ thể cho dự án này

```
com.comics
├── MangaReaderApplication.java
├── shared/                          # HẠ TẦNG (được phép)
│   ├── api/                         # ApiResponse, ApiError, PageResponse, GlobalExceptionHandler
│   ├── security/                    # JwtTokenProvider, JwtAuthenticationFilter, UserPrincipal, CurrentUser
│   ├── persistence/                 # BaseEntity, AuditableEntity, JpaConfig, FlywayConfig
│   ├── realtime/                    # STOMP config + event publisher
│   └── util/                        # SlugUtils, EncryptionUtils
├── identity/                        # ⬅ FE: authService + userService
│   ├── api/          AuthController, UserController, ProfileSettingController
│   ├── domain/       model/{User,UserProfileSetting,RefreshToken,UserSession}, repository/
│   └── application/  AuthService, UserService, ProfileSettingService
├── catalog/                         # ⬅ FE: mangaService + comicService + category
│   ├── api/          MangaController, ChapterController, CategoryController, ComicCrudController
│   ├── domain/       model/{Manga,Chapter,Category,MangaCategory}, repository/
│   └── application/  MangaService, ChapterService, CategoryService
├── interaction/                     # ⬅ FE: comment/follow/history/rating/bookmark/collection
│   ├── comment/  ├ bookmark/  ├ follow/  ├ history/  ├ rating/  ├ collection/  ├ userfollow/
├── community/                       # ⬅ FE: communityService
│   ├── topic/  ├ post/  ├ postcomment/  ├ reaction/
├── notification/                    # ⬅ FE: notificationService
├── gamification/                    # ⬅ FE: xp/achievement/challenge/readingGoal/readingAnalytics
├── monetization/                    # ⬅ FE: membership, coin, contentAccess (paywall do server quyết)
├── discovery/                       # ⬅ FE: recommendation/discovery/smartRecommendation
├── creator/                         # ⬅ FE: teamService
├── moderation/                      # ⬅ FE: reportService
├── advertising/                     # ⬅ ad serving cho reader
├── media/                           # ⬅ FE: fileService
└── administration/                  # ⬅ FE: adminService (toàn bộ /admin/**)
    ├── dashboard/  ├ userops/  ├ badge/  ├ adops/  ├ mangaops/  ├ teamops/
    ├ topicops/  ├ postops/  ├ reportops/  ├ recommendationops/  ├ rbac/
    ├ securityops/  ├ collectionaudit/  ├ ops/  ├ stats/
```

### 1.4. `shared/` được chứa gì (whitelist)

`ApiResponse<T>`, `ApiError`, `PageResponse<T>`, `GlobalExceptionHandler`, `BusinessException` + subclass, `BaseEntity`, `AuditableEntity`, JWT filter & provider, `CurrentUser` resolver annotation, STOMP/WebSocket config, `SlugUtils`, `DateUtils`, `AppProperties` (config binding). **Hết.**

---

## 2. Yêu cầu kỹ thuật

### 2.1. Stack

- **Java 21** (records, sealed, pattern matching)
- **Spring Boot 3.4.x** — `spring-boot-starter-web`, `-data-jpa`, `-validation`, `-security`, `-websocket`, `-actuator`, `-cache`, `-oauth2-resource-server`, `-mail`
- **Spring Security 6** + **JWT (RS256)** trong `shared/security/`
- **PostgreSQL** + **Flyway** (`src/main/resources/db/migration/`)
- **Redis** — cache + `@Cacheable` cho home feed, category, recommendation
- **MapStruct** (DTO mapping) + **Lombok**
- **Micrometer + Prometheus** → `/actuator/prometheus` (phục vụ module `administration/ops`)
- **springdoc-openapi 2.x** → `/swagger-ui.html` (FE team đối chiếu contract)
- **Resilience4j** cho gọi ngoài (chapter CDN, storage)
- **Test:** JUnit 5, Testcontainers (Postgres + Redis), slice test cho từng feature

### 2.2. CORS

```
allowedOrigins: http://localhost:2003
allowedHeaders: Authorization, Content-Type, X-Requested-With
exposedHeaders: Authorization
allowCredentials: true
```

---

## 3. Contract API bắt buộc (trích từ FE)

> Base URL: `http://localhost:2004/api/` · WebSocket/SockJS: `http://localhost:2004/ws`
> FE đọc dữ liệu từ `response.data` → **mọi response phải bọc trong `ApiResponse` có field `result`**. 62 chỗ trong FE dùng `res?.result`, 8 chỗ dùng `res?.data`. **Hợp nhất về `result`.**

### 3.1. `ApiResponse<T>` — canonical envelope

```json
{
  "success": true,
  "code": "OK",
  "message": "Thành công",
  "result": {},
  "errors": null,
  "timestamp": "2026-10-02T10:15:30",
  "path": "/api/mangas/latest"
}
```

Lỗi:
```json
{
  "success": false,
  "code": "MANGA_NOT_FOUND",
  "message": "Không tìm thấy truyện",
  "result": null,
  "errors": [{ "field": "password", "message": "Mật khẩu phải có ít nhất 8 ký tự" }],
  "timestamp": "2026-10-02T10:15:30",
  "path": "/api/mangas/detail"
}
```

**Bắt buộc:**
- Mọi endpoint trả `ApiResponse<T>` — kể cả `DELETE`, kể cả lỗi.
- HTTP status đúng ngữ nghĩa: `200` OK, `201` Created, `400` validation, `401` chưa xác thực, `403` không đủ quyền, `404` không tìm thấy, `409` xung đột, `422` lỗi nghiệp vụ.
- **Không bao giờ** trả `null` cho `result` khi FE gọi `.map()` — với list thì trả `[]`, với object thì trả object hoặc `404`.
- Message tiếng Việt. `code` là hằng string để QA test (vd `MANGA_NOT_FOUND`, `INVALID_CREDENTIALS`, `FORBIDDEN_RESOURCE`).

### 3.2. Phân quyền

FE `ProtectedRoute` + `UserContext` dùng **`userData.username.toUpperCase()` làm role**: `roles: ['ADMIN']` cho toàn bộ 21 route admin. Vậy cần:

- Bảng `roles` động (vì FE có module `/admin/rbac/**`).
- Role mặc định: `ADMIN`, `MODERATOR`, `AUTHOR`/`TRANSLATOR`, `USER`.
- JWT claim: `sub` (userId), `username`, `roles[]`.
- Method security: `@PreAuthorize("hasRole('ADMIN')")` hoặc `hasAuthority('perm:admin:manga:write')` cho RBAC động.
- `GET /users/myInfo` trả user + `status` (`0` = active, `1` = banned — FE check `status === 0` để force logout).

---

## 4. Danh sách endpoint đầy đủ (theo feature package)

### 4.1. `identity` — Auth (`/api/auth`)

| Method | Path | Query/Body | Trả về `result` |
|---|---|---|---|
| POST | `/auth/token` | body `{username, password}` | `{ id, username, urlImage, token, refreshToken, roles[], status }` |
| GET | `/auth/introspect` | `?token=` | `{ valid, userId, username, roles[] }` |
| GET | `/auth/refresh` | `?token=` | `{ token, refreshToken, expiresIn }` |
| GET | `/auth/logout` | header Bearer | `true` |

- Password: BCrypt. Access token TTL 30 phút, refresh 7 ngày.
- Rate-limit login: 5 lần / 10 phút / IP+username.
- Refresh token lưu DB (bảng `refresh_token`), **rotate mỗi lần refresh**, revoke khi logout.

### 4.2. `identity` — User (`/api/users`)

| Method | Path | Query/Body |
|---|---|---|
| GET | `/users/myInfo` | — (từ JWT) |
| GET | `/users/user` | `?userId=` |
| GET | `/users` | `?page=&size=&keyword=&status=&roleName=` |
| POST | `/users` | `{name, username, email, password, confirmPassword}` — dùng cho cả **register** lẫn admin-create |
| PUT | `/users` | `?userId=` + body profile fields |
| DELETE | `/users` | `?userId=` |
| POST | `/users/change-password` | `{oldPassword, newPassword}` |
| PUT | `/users/reset-password` | `{userId/email, newPassword}` (admin) |
| PUT | `/users/status` | `?id=&status=` |
| GET/POST/PUT | `/users/profile-setting` | `?userId=` — `{displayName, bio, avatarUrl, ...}` |

> **Tương thích:** FE `ChangePassword.js:37` và `Report.js:30` đọc `res?.data?.success`. Thiết kế chuẩn là `result`. Hãy **ưu tiên contract sạch (`result`) và liệt kê việc sửa FE** vào `docs/FRONTEND-FIXES.md`.

### 4.3. `identity` — User follow (`/api/users/follow`)

| Method | Path | Query/Body |
|---|---|---|
| GET | `/users/follow/check` | `?followerId=&followingId=` |
| GET | `/users/follow/count` | `?userId=` |
| GET | `/users/follow/followers` | `?userId=&page=&limit=` |
| GET | `/users/follow/followings` | `?userId=&page=&limit=` |
| POST | `/users/follow` | body `{followerId, followingId}` |
| DELETE | `/users/follow` | `?followerId=&followingId=` |



### 4.4. `identity` — Role (`/api/roles`)

`GET /roles` (paged: `page/size/name`) · `GET /roles` (all) · `GET /roles/role?name=` · `POST /roles` `{name, description}` · `PUT /roles?name=` · `DELETE /roles?name=`



### 4.5. `catalog` — Manga (`/api/mangas`) ⚠️ prefix chung, sub-resource khác nhau

| Method | Path | Query | `result` shape |
|---|---|---|---|
| GET | `/mangas/latest` | — | `MangaSummary[]` |
| GET | `/mangas/home` | `?userId=` | `{ trendingMangas[], latestMangas[], topRatedMangas[] }` |
| GET | `/mangas/categories` | — | `Category[]` = `{id, name, slug}` |
| GET | `/mangas/category` | `?path=&page=` | `MangaSummary[]` — `path` nhận cả slug lẫn special: `tat-ca`, `latest`, `trending`, `manhwa`, `adult` |
| GET | `/mangas/list` | `?page=&size=&sort=` | `MangaSummary[]` (FE chưa dùng — **thiết kế contract chuẩn, ghi chú**) |
| GET | `/mangas/detail` | `?path=&slug=` | `MangaDetail` (§4.5.2) |
| GET | `/mangas/search` | `?keyword=&page=&limit=&category=&status=` | `MangaSummary[]` |
| GET | `/mangas/stats` | `?mangaPath=&userId=` | `{ viewCount, followCount, commentCount, ratingCount, averageRating, lastReadChapter, ... }` |
| GET | `/mangas/dashboard` | `?userId=` | `{ totalRatings, totalComments, totalFollows, readingStreak, totalChaptersRead, totalPagesRead }` |

#### 4.5.1. `MangaSummary` (FE đọc `name`, `slug`/`mangaPath`, `thumb_url`, `status`, `averageRating`/`score`, `chapters`)

```json
{
  "id": 1, "name": "One Piece", "slug": "one-piece", "mangaPath": "one-piece",
  "thumb_url": "uploads/comics/one-piece.jpg", "thumbnailUrl": "https://img.otruyenapi.com/uploads/comics/one-piece.jpg",
  "status": "ongoing", "averageRating": 9.2, "viewCount": 1200000,
  "author": ["Eiichiro Oda"], "categories": ["action","adventure"],
  "totalChapters": 1120, "isPremium": false
}
```

> FE ghép ảnh bằng string concat: `${REACT_APP_IMAGE_BASE_URL}${manga.thumb_url}`. Vì vậy **`thumb_url` phải là path tương đối**, còn `thumbnailUrl` là URL tuyệt đối. **Trả cả hai** để tương thích mọi màn.

#### 4.5.2. `MangaDetail` — đúng nested shape mà FE yêu cầu

```json
{
  "id": 1, "name": "One Piece", "slug": "one-piece", "mangaPath": "one-piece",
  "description": "...", "status": "ongoing", "thumb_url": "uploads/comics/op.jpg",
  "author": ["Eiichiro Oda"], "categories": [...], "rating": 9.2,
  "chapters": [
    {
      "server": "sv1.otruyencdn.com",
      "server_data": [
        { "chapter_name": "1", "chapter_title": "Romance Dawn", "accessType": "FREE", "price": 0, "canRead": true,
          "chapter_api_data": "aHR0cHM6Ly9zdjEub3RydXllbmNkbi5jb20vdjEvYXBpL2NoYXB0ZXIvY2hhcHRlci0x" }
      ]
    }
  ]
}
```

> ⚠️ `chapters` là **mảng lồng nhau** (FE đọc `mangas.chapters[0].server_data`). Giữ nguyên cấu trúc này.
> `chapter_api_data` = **Base64 của URL tuyệt đối** tới chapter CDN (FE decode bằng `atob` rồi cắt prefix `https://sv1.otruyencdn.com/v1/api/chapter/`). **Trả đã encode sẵn.**

### 4.6. `catalog` — Chapter (`/api/chapter/{chapterId}`)

FE gọi **bằng axios thuần tới external**: `axios.get(`${REACT_APP_SUB_URL}chapter/${param}`)` → đọc `res.data.item`.

- BE expose: `GET /api/chapter/{chapterId}` → `result: { data: { item: { chapter_name, chapter_title, chapter_image: string[], comic_name, chapter_path, chapter_num } } }`
- Nếu chưa có nguồn thật: implement **adapter `ChapterContentSource`** + fallback seeder tạo `chapter_image` từ CDN pattern. Ghi chú đây là điểm duy nhất chưa có nguồn.
- **Bắt buộc:** endpoint này phải **kiểm tra paywall server-side** (§4.23) và trả `403 { code: "PAYWALL_LOCKED", result: { accessType, price, chapterName, mangaPath } }` nếu user không đủ quyền.

### 4.7. `catalog` — Comic CRUD cho tác giả (`/api/comics`)

| Method | Path | Body / Query |
|---|---|---|
| POST | `/comics` | `{title, slug, description, cover, genre}` |
| PUT | `/comics/{comicId}` | như trên |
| GET | `/comics` | `?page=&limit=&genre=&status=` |
| GET | `/comics/{comicId}` | — |
| GET | `/comics/my-comics` | `?userId=` |
| DELETE | `/comics/{comicId}` | — |
| POST | `/comics/{comicId}/chapters` | `{title, chapterNumber, content, published}` |
| PUT | `/comics/{comicId}/chapters/{chapterId}` | như trên |
| GET | `/comics/{comicId}/chapters` | `?page=&limit=` |
| GET | `/comics/{comicId}/chapters/{chapterId}` | — |
| DELETE | `/comics/{comicId}/chapters/{chapterId}` | — |

Phân quyền: chỉ owner (tác giả/nhóm dịch) hoặc `ADMIN` được sửa. Slug unique, tự sinh khi thiếu.


| Method | Path | Query/Body |
|---|---|---|
| GET | `/users/follow/check` | `?followerId=&followingId=` |
| GET | `/users/follow/count` | `?userId=` |
| GET | `/users/follow/followers` | `?userId=&page=&limit=` |
| GET | `/users/follow/followings` | `?userId=&page=&limit=` |
| POST | `/users/follow` | body `{followerId, followingId}` |
| DELETE | `/users/follow` | `?followerId=&followingId=` |

### 4.8. `interaction.comment` — Comment chương (`/api/mangas/comments`)

| Method | Path | Query/Body |
|---|---|---|
| GET | `/mangas/comments` | `?mangaPath=&chapterName=&currentUserId=` |
| GET | `/mangas/comments/replies` | `?parentCommentId=&currentUserId=` |
| POST | `/mangas/comments` | `{userId, mangaPath, mangaName, chapterName?, content, parentCommentId?}` |
| PUT | `/mangas/comments` | `{commentId, content}` |
| POST | `/mangas/comments/like` | `{commentId, userId}` |
| POST | `/mangas/comments/unlike` | `{commentId, userId}` |
| DELETE | `/mangas/comments` | `?commentId=&userId=` |

**`CommentResponse`** (đúng field FE đọc):
```json
{ "id": 1, "userId": 5, "userAvatar": "https://...", "username": "abc",
  "userDisplayName": "Nguyễn Văn A", "content": "Hay quá", "createdAt": "...",
  "totalLikes": 12, "likedByCurrentUser": false, "parentCommentId": null,
  "mangaPath": "one-piece", "chapterName": "110", "isEdited": false }
```

### 4.9. `interaction.bookmark` (`/api/mangas/bookmarks`)

`POST` (create) · `GET ?userId=` · `GET /status?userId=&mangaPath=&chapterName=` → boolean · `GET /count?userId=` · `DELETE ?userId=&mangaPath=&chapterName=`

Unique constraint `(user_id, manga_id, chapter_id)`. Trùng → trả `200` idempotent (FE toggle liên tục).

### 4.10. `interaction.follow` — Follow truyện (`/api/mangas/follows`)

`POST {userId, mangaPath, mangaName, thumbnailUrl}` · `GET ?userId=` · `GET /status?userId=&mangaPath=` · `PUT /progress {userId, mangaPath, lastReadChapter, currentPage}` · `DELETE ?userId=&mangaPath=`

**`FollowResponse` phải chứa `lastReadChapter` + `latestChapter` + `updatedAt`** — đây là **contract quan trọng nhất**: `newChapterService.js` và `Library.js` suy ra "chương mới" bằng `latestChapter > lastReadChapter`. Thiếu 2 field này là mất tính năng.

```json
{ "id": 1, "userId": 5, "mangaPath": "one-piece", "mangaName": "One Piece",
  "thumbnailUrl": "https://...", "lastReadChapter": "1095", "latestChapter": "1098",
  "updatedAt": "2026-10-01T10:00:00", "createdAt": "..." }
```

### 4.11. `interaction.history` (`/api/mangas/history`)

`POST {userId, mangaPath, chapterName, currentPage, totalPages}` · `GET ?userId=` · `GET /continue?userId=&limit=` · `GET /count?userId=` · `DELETE ?userId=&mangaPath=`

`/continue` trả list sort `readAt DESC`, giữ `chapterName` để FE deep-link `?page=`.

### 4.12. `interaction.rating` (`/api/mangas/ratings`)

`POST {userId, mangaPath, mangaName, thumbnailUrl, score(1-5), review}` · `GET /summary?mangaPath=&userId=` · `GET /my?userId=&mangaPath=` · `GET /reviews?mangaPath=` · `DELETE ?userId=&mangaPath=`

- Unique `(user_id, manga_id)` — submit lại = **upsert**.
- `/summary`: `{ averageRating, totalRatings, distribution: {"1":n,...} }`
- `/reviews`: FE đọc `r.urlImage`, `r.userDisplayName || r.name`, `r.score`, `r.review` → trả đủ.

### 4.13. `interaction.collection` (`/api/mangas/collections`)

`POST` · `PUT ?collectionId=` · `GET ?userId=` · `GET /detail?userId=&collectionId=` · `DELETE ?userId=&collectionId=` · `GET /count?userId=`
`/items`: `POST` · `PUT /note` · `DELETE ?userId=&collectionId=&mangaPath=`

**`/detail` trả** `{ id, name, userId, description, isPublic, items: [{ mangaPath, mangaName, thumbnailUrl, note, addedAt }] }`



### 4.14. `community` (`/api/community`)

| Method | Path | Notes |
|---|---|---|
| GET | `/community/topics` | `Topic[]` |
| GET | `/community/topics/{topicId}` | `{ id, name, slug, description, posts: Post[] }` — FE đọc `res?.result?.posts` |
| GET | `/community/posts/{postId}` | `Post` |
| GET | `/community/posts/{postId}/comments` | `{ post, comments: PostComment[] }` — FE đọc `res?.result?.post` + `res?.result?.comments` |
| POST | `/community/posts` | `?id=userId` + body `{title, content, topicId}` |
| PUT | `/community/posts/{postId}` | body |
| DELETE | `/community/posts/{postId}` | — |
| GET | `/community/post/{userId}` | list post của user (phân trang) |
| POST | `/community/comments` | `?id=userId` + body `{postId, content, parentCommentId?}` |
| POST | `/community/reactions` | `?id=userId` + body `{type, postId}` |

**Reaction types (đúng enum FE):** `LIKE`, `LOVE`, `HAHA`, `WOW`, `SAD`, `ANGRY`.
`reactPost` trả `result` = reaction vừa upsert `{ id, postId, userId, type }` (FE tự merge vào list).
Unique `(post_id, user_id)` — reaction mới **ghi đè** reaction cũ.

### 4.15. `notification` (`/api/notifications`)

`GET ?userId=&isRead=&pageNumber=&pageSize=` · `GET /unread-count?userId=` (số) · `PUT /read?userId=&notificationId=` · `PUT /read-all?userId=` · `DELETE ?userId=&notificationId=` · `DELETE /all?userId=`

**`NotificationResponse`:** `{ id, userId, type, title, content, isRead(0|1), createdAt, relatedId, linkUrl }`
Types FE dùng: `FOLLOW_MANGA`, `COMMENT_REPLY`, `LIKE`.
Publish STOMP `/topic/notifications/{userId}` khi có noti mới; `PUT /read-all` publish `{ type: "READ-ALL", count: 0 }` (FE xử lý `msg.type === 'READ-ALL'`).

### 4.16. `discovery` — Recommendation (`/api/recommendations`)

`GET /recommendations/mangas?userId=&limit=` → `MangaSummary[]`
`GET /recommendations/posts?userId=&limit=` → `Post[]`

> ⚠️ **Bug FE cần sửa:** `Recommendations.js:22` đọc `res?.data` trong khi mọi nơi khác đọc `res?.result`. Vì ta chuẩn hóa envelope `result`, endpoint này sẽ làm FE đó đọc `undefined`. **In ra như TODO bắt buộc**: sửa `setList(res?.data || [])` → `setList(res?.result || [])`.

### 4.17. `creator` — Team / nhóm dịch (`/api/teams`)

`GET /teams` · `GET /teams/team?id=` · `POST /teams/create {name, description, logoUrl}`

`Team`: `{ id, name, slug, description, logoUrl, memberCount, comicCount, createdAt }`
Phân quyền: tạo team cần `AUTHOR` trở lên; member có `roleInTeam` (`OWNER`/`EDITOR`/`TRANSLATOR`).

### 4.18. `moderation` — Report (`/api/report`)

`POST /report {type, content, targetId?, userId?, evidenceUrl?}` → `result: {success: true}`
Types: `COPYRIGHT`, `OFFENSIVE`, `SPAM`, `BROKEN_CHAPTER`, `WRONG_INFO`, `OTHER`.

### 4.19. `media` — File upload (`/api/files`)

`POST /files/upload-single` — multipart `file`, `folderName` → `result: "https://cdn.../xxx.jpg"` (chuỗi URL, **không** phải object)
`POST /files/upload-multiple` — multipart `files`[], `folderName` → `result: ["url1","url2"]`

- Validate: chỉ `image/jpeg|png|webp|gif`, ≤ 5MB (avatar) / ≤ 15MB (chapter page).
- Sanitize filename, chống path traversal.
- Lưu S3/MinIO-compatible, trả CDN URL khớp `REACT_APP_IMAGE_BASE_URL`.
- Nếu dùng local disk: trả `/api/files/{folder}/{uuid}.{ext}` và serve qua resource handler.

### 4.20. `advertising` — Ad serving (reader-facing)

`GET /admin/ads?targetUrl=&endAt=` (dùng bởi `ChapterReader.loadAds()` và `AdSlot.js`) — xem §4.21.
`Ad`: `{ id, targetUrl, imageUrl, linkUrl, slot, startAt, endAt, isActive, priority }`
Target dạng `/manga/{slug}`. Chỉ trả ad đang active & trong khung thời gian.



### 4.21. `administration` — Admin (`/api/admin/**`), toàn bộ `@PreAuthorize("hasRole('ADMIN')")`

**Dashboard**
- `GET /admin/dashboard/overview?keyword=` → `{ totals: {users, comics, teams, posts, activeAds, onlineSessions}, quickSearch: {users[], comics[], posts[]}, teams[] }`

**Users** — `GET /admin/users?page=&size=&keyword=&status=&roleName=` · `PUT /admin/users/{userId}/ban` · `PUT /admin/users/{userId}/unban` · `PUT /admin/users/{userId}/role?roleName=`

**Badges** — `GET /admin/badges?page=&size=` · `GET /admin/badges/{id}` · `POST` · `PUT /{id}` · `DELETE /{id}` · `POST /{id}/assign?userId=&mangaId?` · `DELETE /{id}/assign?...`

**Ads** — `GET /admin/ads?targetUrl=&endAt=&page=` · `GET /{id}` · `POST` · `PUT /{id}` · `PUT /{id}/toggle` · `DELETE /{id}`

**Manga ops** — `GET /admin/mangas/comics` · `GET /admin/mangas/comments?status=` · `GET /admin/mangas/reviews?status=` · `PUT /admin/mangas/comments/{commentId}?action=` · `PUT /admin/mangas/reviews/{reviewId}?action=` · `GET /admin/manga-ops/pipeline?status=` · `POST /admin/manga-ops/pipeline/action`

**Teams** — `GET|POST /admin/teams` · `GET|PUT|DELETE /admin/teams/{id}` · `GET /admin/teams/{id}/members` · `POST|DELETE /admin/teams/{id}/members/{userId}` · `PUT /admin/teams/{id}/members/{userId}`

**Topics & Posts** — `GET|POST /admin/topics` · `GET|PUT|DELETE /admin/topics/{id}` · `GET /admin/posts?topicId=&status=` · `PUT /admin/posts/{id}?action=`

**Reports** — `GET /admin/reports?status=` · `PUT /admin/reports/{id}?action=`

**Recommendation control** — `GET /admin/recommendations/controls?targetType=` · `PUT /admin/recommendations/controls`

**RBAC** — `GET /admin/rbac/matrix` → `{ roles: [{name, permissions[]}], resources: [{resource, actions[]}] }` · `PUT /admin/rbac/roles/{roleName}/permissions` body `{permissions: string[]}`

**Security / Ops / Stats** — `GET /admin/security/sessions?userId=` · `PUT /admin/security/sessions/{sessionId}/terminate` · `GET /admin/security/follow-flags?threshold=` · `GET|POST /admin/security/audit-logs` · `GET /admin/stats/charts` · `GET /admin/ops/metrics` · `GET|POST /admin/ops/incidents` · `PUT /admin/ops/incidents/{id}` · `GET|POST /admin/collections/audit-cases` · `PUT /admin/collections/audit-cases/{id}`

Moderation actions enum: `APPROVE`, `REJECT`, `HIDE`, `RESTORE`, `DELETE`, `BAN`, `WARN`, `RESOLVED`, `DISMISS`.
Workflow trạng thái (theo backlog FE): `NEW → IN_REVIEW → RESOLVED → ARCHIVED`.

### 4.22. `gamification` — server-side authority

FE đang chạy XP / achievement / daily challenge / reading goal / reading analytics / coin wallet / membership **100% trên localStorage** (mỗi service đều ghi chú `DATA SOURCE SWAP (future)`). **Ta implement server-side trước** để FE chỉ cần đổi nguồn:

- `GET /api/mangas/reading-analytics/goal?userId=` · `PUT /goal` · `GET /goal/progress?userId=` · `POST /session` · `GET /streak?userId=` · `GET /calendar?userId=&days=30`
- `GET /api/mangas/dashboard?userId=` phải trả đủ counter: `totalRatings`, `totalComments`, `totalFollows`, `readingStreak`, `totalChaptersRead`, `totalPagesRead`
- `GET /api/wallet/me` · `POST /api/wallet/topup` · `POST /api/wallet/spend` (transaction + ledger append-only)
- `GET /api/membership/me` · `POST /api/membership/subscribe` · `POST /api/membership/cancel` (trả `demo: false` — đây là thật)

**Bảng XP/achievement:** `xp_event` (idempotent bằng `event_id` unique — chống farm), `user_xp`, `achievement_catalog` (seed 17 achievement từ `ACHIEVEMENT_CATALOG`), `daily_challenge` (rotate deterministic 3/ngày, hash theo `dayKey`).

### 4.23. `monetization` — Paywall (chuyển source of truth từ FE sang BE)

FE `contentAccessService.js` hiện **tự tính** `FREE / PREMIUM / EARLY_ACCESS` từ vị trí chapter — và chính file đó ghi rõ *"The backend must become the authority"*.

1. Thêm cột `access_type` + `price_coins` vào bảng `chapter`. **Seed tương ứng logic FE** để không đổi hành vi:
   - 3 chương mới nhất của truyện đang cập nhật → `PREMIUM`, price 50 coins
   - truyện `completed` → tất cả `FREE`
   - `EARLY_ACCESS` theo hash `mangaPath::early` (giữ nguyên tinh thần, hoặc bỏ hẳn cho gọn — chọn 1 và ghi chú)
2. **`ChapterResponse` BẮT BUỘC có `accessType` + `price` + `canRead`** → FE đổi `resolveChapterAccess()` thành đọc thẳng field.
3. `GET /api/chapter/{id}` **kiểm tra quyền server-side**, trả `403 { code: "PAYWALL_LOCKED", result: { accessType, price, chapterName, mangaPath } }` — frontend dùng `result` này mở `PremiumGate`.
4. Premium member bypass; user đã unlock bằng coin bypass.



---

## 5. WebSocket / STOMP realtime

FE dùng **SockJS + STOMP** (`@stomp/stompjs` + `sockjs-client`), kết nối tới `REACT_APP_WS_URL = http://localhost:2004/ws`.

Cấu hình server:
```yaml
spring:
  messaging:
    stomp:
      endpoint: "/ws"            # SockJS endpoint
```
- `@EnableWebSocketMessageBroker`, `configureMessageBroker` với `/topic` và `/queue`.
- `setAllowedOrigins("http://localhost:2003")`.
- Cho phép kết nối **không cần token** (FE connect trước khi có token ở một số case) → validate token nếu có, cho phép anonymous. Phân quyền topic notification tại tầng **publish** (chỉ server publish tới `/topic/notifications/{userId}`), không nhận message từ client.

**Bắt buộc publish đúng 5 topic FE đang subscribe (`src/lib/realtime.js`):**

| Topic | Trigger |
|---|---|
| `/topic/comments/{mangaPath}` | tạo / sửa / xoá comment chương |
| `/topic/comments/reaction/{commentId}` | like / unlike / delete comment |
| `/topic/comments/post/{postId}` | comment bài viết community |
| `/topic/notifications/{userId}` | notification mới, đọc hết |
| `/topic/login`, `/topic/updateStt` | broadcast sự kiện hệ thống / đổi trạng thái user |

---

## 6. Database schema (PostgreSQL + Flyway)

> Migration đặt tên đúng convention `V{n}__{mô_tả}.sql`, chạy sạch từ DB trống.

**Core**
- `users` (id, name, username UQ, email UQ, password_hash, urlImage, status, bio, created_at, updated_at, deleted_at)
  - ⚠️ FE check `status === 0` nghĩa là active → **0 = active, 1 = banned**
- `roles` (name UQ, description), `user_roles` (user_id, role_name)
- `permissions` (code UQ), `role_permissions` (role_name, permission_code)
- `refresh_tokens` (token_hash, user_id, expires_at, revoked)
- `user_sessions` (user_id, user_agent, ip, login_at, last_seen_at, is_active)
- `user_profile_settings` (user_id UQ, display_name, bio, theme, notify_*)

**Catalog**
- `manga` (id, name, slug UQ, description, status, thumb_url, author, view_count, average_rating, rating_count, created_by, created_at, updated_at)
- `category` (id, name, slug UQ, kind: `GENRE`|`SPECIAL`) — SPECIAL chứa `tat-ca`, `latest`, `trending`, `manhwa`, `adult`
- `manga_category` (manga_id, category_id)
- `chapter` (id, manga_id, chapter_name, chapter_title, chapter_api_data, chapter_num, access_type, price_coins, published_at, status)

**Interaction**
- `comments` (id, user_id, manga_id, chapter_id, parent_id, content, total_likes, is_deleted, created_at, updated_at)
- `comment_likes` (comment_id, user_id) UQ
- `bookmarks` (id, user_id, manga_id, chapter_id) UQ(user_id, manga_id, chapter_id)
- `manga_follows` (id, user_id, manga_id, last_read_chapter, latest_chapter) UQ(user_id, manga_id)
- `reading_history` (id, user_id, manga_id, chapter_id, current_page, total_pages, read_at) UQ(user_id, manga_id)
- `ratings` (id, user_id, manga_id, score, review, created_at) UQ(user_id, manga_id)
- `collections` (id, user_id, name, description, is_public)
- `collection_items` (id, collection_id, manga_id, note) UQ(collection_id, manga_id)

**Community**
- `topics` (id, name, slug UQ, description, is_active)
- `posts` (id, user_id, topic_id, title, content, status, view_count, created_at)
- `post_comments` (id, post_id, user_id, parent_id, content, created_at)
- `post_reactions` (id, post_id, user_id, type) UQ(post_id, user_id)



**Notification / Ops / Ads**
- `notifications` (id, user_id, type, title, content, is_read, related_id, link_url, created_at)
- `reports` (id, reporter_id, type, target_type, target_id, content, status, action_taken)
- `admin_audit_logs` (id, actor_id, action, entity_type, entity_id, before_data jsonb, after_data jsonb, reason, created_at)
- `security_audit_logs` (id, user_id, event, ip, user_agent, metadata jsonb, created_at)
- `incidents` (id, severity, status, title, detail, created_at, resolved_at)
- `collection_audit_cases` (id, user_id, status, reason, action)
- `ad` (id, target_url, image_url, link_url, slot, start_at, end_at, is_active, priority)
- `badges` (id, name, description, icon, type), `user_badges` (user_id, badge_id) UQ

**Gamification / Monetization**
- `user_xp` (user_id UQ, total_xp), `xp_events` (user_id, event_id) UQ — idempotent
- `achievement_catalog` (code, name, description, icon, metric, target, xp)
- `daily_challenges` (day_key, challenge_id) UQ(day_key, challenge_id)
- `wallets` (user_id UQ, balance, lifetime_earned, lifetime_spent), `wallet_ledger` (id, user_id, type EARN/SPEND, amount, label, ref, created_at)
- `memberships` (id, user_id, plan, status, started_at, renews_at, cancelled_at, price, currency)
- `reading_goals` (user_id UQ, target_chapters, target_minutes, period), `reading_sessions` (id, user_id, manga_id, chapter_id, started_at, ended_at, seconds, pages)
- `preferences` (user_id UQ, favorite_categories jsonb, reader_settings jsonb)

**Index bắt buộc:** `manga(slug)` · `chapter(manga_id, chapter_num DESC)` · `comments(manga_id, chapter_id, created_at DESC)` · `manga_follows(user_id)` · `reading_history(user_id, read_at DESC)` · `notifications(user_id, is_read, created_at DESC)` · `posts(topic_id, created_at DESC)` · full-text cho `manga(name)` + `chapter(chapter_title)` (dùng `pg_trgm` hoặc tsvector `unaccent`).

---

## 7. Chất lượng code bắt buộc

1. **Không dùng Lombok `@Data` cho Entity có quan hệ** — dùng `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder` + `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` chỉ trên `id`.
2. **Entity không bao giờ trả về cho client.** Luôn map qua `<Feature>Mapper` (MapStruct) → DTO.
3. **DTO dùng `record`** (Java 21) cho response; `class` + `jakarta.validation` cho request.
4. **Mọi endpoint xác thực phải lấy user từ JWT**, không tin `userId` từ request. FE (contract cũ) vẫn gửi `userId` ở body/param → **kiểm tra khớp với JWT, lệch thì trả 403**. Anonymous read được phép qua header `X-User-Id`. *(Ghi chú đây là hợp đồng lạ, cần nêu rõ trong báo cáo.)*
5. **Phân trang:** `@RequestParam int page = 0, int size = 20`, `Pageable`, cap `size <= 100`. Trả `PageResponse<T>` = `{ content, page, size, totalElements, totalPages, hasNext }`.
   > ⚠️ **Giữ nguyên tên param của từng endpoint**: `notificationService` dùng `pageNumber`/`pageSize` (1-based), `collectionService` + `userFollowService` dùng `page`/`limit` (0-based), `comicService` dùng `page`/`limit`, `roleService` dùng `page`/`size`. **Đừng chuẩn hóa tên param — sẽ phá FE.**
6. **Validation** ở tầng API (`@Valid`), business rule ở tầng application.
7. **Exception:** `BusinessException(ErrorCode, message)` + `@RestControllerAdvice` map sang `ApiResponse`. Không để lỗi 500 lộ stack trace ra client — nhưng **luôn log đầy đủ server-side**.
8. **Transaction** ở tầng application (`@Transactional`), **không** ở controller.
9. **Chống N+1:** `@EntityGraph` / `join fetch` / projection. Bắt buộc với `MangaDetail` (chapters + categories), `Library` (follows + history), `CollectionDetail`.
10. **Cache** (`@Cacheable`): `homeFeed`, `categoryList`, `mangaDetail:{slug}`, `trending`. **Evict khi write.**
11. **Không hardcode URL/domain** — dùng `@ConfigurationProperties`.
12. **Test:** mỗi feature có ít nhất 1 `*ServiceTest` + 1 `*ApiTest` cho happy path, validation fail, unauthorized, forbidden, not-found.
13. **Tiếng Việt** cho `message` trong `ApiResponse` và exception. Code/identifier viết tiếng Anh.
14. **Flyway** phải chạy sạch từ DB trống, kèm **seed data**: 1 admin, ~10 category, ~20 manga, ~5 chapter/manga, vài topic community.
15. **Security config:** anonymous đọc `/mangas/**`, `/categories`, `/home`, `/teams`; authenticated cho phần user; `ADMIN` cho `/admin/**`.



---

## 8. Cấu hình môi trường

`application.yml` + profile `local` / `dev` / `prod`:
- `server.port: 2004`
- `spring.datasource` → Postgres · `spring.data.redis` → Redis
- `app.jwt.secret` / `access-ttl` / `refresh-ttl`
- `app.cors.allowed-origins: http://localhost:2003`
- `app.storage` (endpoint, bucket, public-base-url) — public-base-url = `https://img.otruyenapi.com/uploads/comics/` để khớp FE
- `app.chapter.source-url: https://sv1.otruyencdn.com/v1/api/`
- `app.mail` (verify email, reset password)
- `app.frontend.base-url: http://localhost:2003` (tạo link trong email/notification)

Sinh `.env.example` liệt kê mọi biến cần thiết.

---

## 9. Output mong muốn (bàn giao)

1. **Toàn bộ source** dựng được bằng `./gradlew bootRun` / `mvn spring-boot:run`, không lỗi compile.
2. **`README.md`**: chạy Postgres + Redis bằng Docker Compose, chạy app, đăng nhập tài khoản seed, xem Swagger.
3. **`docs/API-CONTRACT.md`** — bảng mapping **từng endpoint FE gọi → endpoint BE**, ghi rõ field nào FE đọc, đánh dấu ✅ khớp / ⚠️ lệch. Đây là tài liệu để team FE đối chiếu.
4. **`docs/FRONTEND-FIXES.md`** — danh sách chỗ FE **cần sửa** để khớp contract chuẩn:
   - `src/features/Recommendations/Recommendations.js:22` — `res?.data` → `res?.result`
   - `src/features/ChangePassword/ChangePassword.js:37` và `src/features/Report/Report.js:30` — `res?.data?.success` → `res?.result?.success`
   - `src/features/CreateStory/CreateStory.js:41` — bỏ fallback `res?.result || res?.data || res` → chỉ `res?.result`
   - `src/features/Admin/UserManagement/UserSecurityPanel.js:19-20` — bỏ fallback `|| res?.data || res || []`
   - Bỏ `mangaPath`/`userId` khỏi request body (lấy từ JWT) — hoặc giữ nhưng BE validate
5. **`docker-compose.yml`** cho Postgres + Redis + (tuỳ chọn) MinIO.
6. **Báo cáo cuối**: feature nào implement đầy đủ, cái nào còn stub/TODO (ví dụ chapter content source, payment gateway thật), các giả định đã phải tự quyết.
7. **Postman collection** (JSON) export từ OpenAPI để FE team test nhanh.

---

## 10. Thứ tự ưu tiên implement

| Phase | Nội dung |
|---|---|
| **P0** | Hạ tầng: Gradle/Maven, `Application`, `shared/` (ApiResponse, error handling, security+JWT, CORS, Flyway, BaseEntity), `identity` (auth + user + role + user-follow) |
| **P1** | `catalog` (manga, chapter, category, search) + `media` (upload) — đủ để FE xem truyện & đọc chương |
| **P2** | `interaction` (comment + bookmark + follow + history + rating + collection) + STOMP realtime |
| **P3** | `community`, `notification`, `discovery`, `creator` |
| **P4** | `monetization` + `gamification` (thay thế localStorage) |
| **P5** | `administration` (21 màn admin) + `moderation` + `advertising` + metrics |

---

## 11. Ràng buộc cuối

- **Không** dùng package-by-layer. Đây là điều kiện bắt buộc để coi là đạt.
- **Không** tự đổi path/param/field mà FE đang dùng.
- **Không** bỏ endpoint nào trong danh sách — kể cả khi bạn nghĩ FE không dùng. Đánh dấu `@Deprecated` nếu thấy thừa.
- **Không** trả entity JPA thẳng ra ngoài.
- **Không** hardcode secret, URL, hay credential.
- Nếu chỗ nào không chắc contract → **implement theo cách an toàn nhất cho FE hiện tại** (giữ backward-compat bằng cách trả thêm field alias) và ghi vào `docs/API-CONTRACT.md` phần "Quyết định & giả định".
- **Bắt đầu bằng việc in ra bảng mapping endpoint FE → BE để tôi review trước khi bạn viết code.**


