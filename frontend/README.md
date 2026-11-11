# Frontend – ReactJS (Vite)

Code chia theo feature trong `src/features`. Mỗi feature gói đủ api, component, hook và page của mình.

## Bố cục chung

| Thư mục | Nội dung |
|---|---|
| `app/` | `App`, các provider |
| `routes/` | khai báo route, `PrivateRoute`, `RoleRoute` (USER / STAFF / ADMIN) |
| `layouts/` | CustomerLayout (Tailwind), AdminLayout (Ant Design), StaffLayout |
| `components/ui/` | Button, Input, Modal… |
| `components/common/` | MovieCard, AgeBadge, PriceTag, CountdownTimer… |
| `features/` | auth, movies, booking, payment, account, promotions, staff, admin |
| `services/` | axios client, interceptor gắn JWT, socket client |
| `context/` | AuthContext |
| `hooks/`, `types/`, `utils/` | dùng chung toàn app |

## Bố cục một feature

```text
features/<ten-feature>/
├── api/
├── components/
├── hooks/
└── pages/
```
