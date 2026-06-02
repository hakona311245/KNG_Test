# Authentication Feature Spec

This feature belongs to the User service.

Related source-of-truth docs:

- API contract: `docs/01_API_CONTRACT.md`
- Data model: `docs/02_DATA_MODEL.md`
- Feature overview: `docs/03_FEATURE_SPEC_OVERVIEW.md`

## Feature Goal

Provide secure authentication and session management for KNG Fashion using email/password login, JWT access tokens, refresh-token rotation, HttpOnly cookies, and role-based authorization.

The MVP must not store tokens in `localStorage`. Authentication should be production-minded enough for an interview demo, while keeping the implementation scoped to local Docker development.

## User Roles

### Customer

Customers can:

- Register an account.
- Log in.
- Log out.
- Refresh their authenticated session.
- View their current profile.
- Access customer-only features when account status is `ACTIVE`.

### Admin

Admins can:

- Log in.
- Log out.
- Refresh their authenticated session.
- View their current profile.
- Access admin-only routes.
- View customers.
- Update customer account status.

Admin accounts are created manually through direct database insertion for the MVP.

## User Actions

### Register

A customer submits:

- Email
- Full name
- Password
- Phone number

System creates a `CUSTOMER` user with `ACTIVE` status.

### Login

A user submits:

- Email
- Password

System validates credentials, validates account status, creates a refresh session, and sets auth cookies.

### Refresh Session

An authenticated browser sends the refresh cookie to refresh the session. System validates the refresh token, validates account status, rotates the refresh token, and returns new cookies.

### Logout

The user logs out. System revokes the active refresh session and clears auth cookies.

### View Current User

The frontend calls the current-user endpoint to hydrate authenticated app state after page reload.

### Manage Customer Status

Admin can set customer status to:

- `ACTIVE`
- `BLOCKED`
- `INACTIVE`

Blocked or inactive customers cannot log in or place orders.

## Business Rules

- Tokens must not be stored in `localStorage`.
- Access token and refresh token are stored in HttpOnly cookies.
- Refresh-token rotation is required.
- Refresh tokens or refresh sessions must be stored hashed in the database.
- Passwords must be stored hashed, never as plain text.
- Email must be unique.
- Customer registration always creates `role = CUSTOMER`.
- Customer registration always creates `status = ACTIVE`.
- Admin users are not created through public registration.
- Admin accounts are created manually through direct database insertion.
- Login must fail for `BLOCKED` and `INACTIVE` users.
- Refresh must fail for `BLOCKED` and `INACTIVE` users.
- Logout should clear cookies even if the refresh session is already invalid.
- Authenticated user responses must not include `passwordHash` or `refreshTokenHash`.
- Admin-only APIs require `ADMIN` role.
- Customer-only APIs require `CUSTOMER` role unless the API contract explicitly allows admin access.

## Related API Endpoints

Reference only. Full request/response details are defined in `docs/01_API_CONTRACT.md`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/admin/customers`
- `GET /api/admin/customers/:id`
- `PATCH /api/admin/customers/:id/status`

## Backend Services/Modules

Recommended NestJS modules for this feature:

- `AuthModule`
- `UsersModule`
- `PrismaModule`

Recommended backend responsibilities:

- `AuthController`: register, login, refresh, logout, current user.
- `AuthService`: credential validation, token issuing, refresh rotation, logout handling.
- `UsersController`: admin customer list/detail/status endpoints.
- `UsersService`: user lookup, customer creation, customer status updates.
- `JwtAuthGuard`: access-token cookie validation.
- `AuthService`: refresh session creation, hashing, rotation, and revocation.
- `RolesGuard`: role-based route protection.
- `CurrentUser` decorator: access authenticated user in controllers.

Data models used:

- User
- RefreshSession

## Edge Cases

- Register with an email that already exists.
- Register with invalid email, weak password, or missing phone number.
- Login with unknown email.
- Login with wrong password.
- Login with `BLOCKED` user.
- Login with `INACTIVE` user.
- Refresh request missing refresh cookie.
- Refresh request with expired refresh token.
- Refresh request with revoked refresh session.
- Refresh request after token reuse or stale rotation.
- Refresh request for a blocked or inactive user.
- Logout when no valid session exists.
- Authenticated request with missing access cookie.
- Authenticated request with expired access token.
- Customer tries to access admin endpoint.
- Admin tries to update a customer to an unsupported status.
- Admin tries to update a user that does not exist.
- Current-user endpoint must not leak sensitive fields.

## Implementation Tasks

### Data Model

- [x] Add `UserRole` enum with `CUSTOMER` and `ADMIN`.
- [x] Add `UserStatus` enum with `ACTIVE`, `BLOCKED`, and `INACTIVE`.
- [x] Add `User` model fields from `docs/02_DATA_MODEL.md`.
- [x] Add unique constraint on `User.email`.
- [x] Add `RefreshSession` model fields from `docs/02_DATA_MODEL.md`.
- [x] Add relation from `User` to `RefreshSession`.
- [x] Add Prisma migration for auth models.

### Backend Auth

- [x] Install and configure password hashing library.
- [x] Implement customer registration.
- [x] Hash passwords before storing users.
- [x] Implement login credential validation.
- [x] Prevent blocked or inactive users from logging in.
- [x] Generate JWT access token.
- [x] Generate refresh token.
- [x] Hash refresh token before database storage.
- [x] Set `access_token` HttpOnly cookie.
- [x] Set `refresh_token` HttpOnly cookie.
- [x] Implement refresh-token validation.
- [x] Implement refresh-token rotation.
- [x] Revoke old refresh session during rotation.
- [x] Implement logout session revocation.
- [x] Clear auth cookies on logout.
- [x] Implement current-user endpoint.

### Backend Authorization

- [x] Implement JWT access-token guard.
- [x] Implement role metadata decorator.
- [x] Implement role guard.
- [x] Protect admin endpoints with `ADMIN` role.
- [ ] Protect customer endpoints with `CUSTOMER` role where needed.
- [x] Ensure blocked or inactive users cannot continue privileged actions after refresh fails.

### Admin Customer Management

- [x] Implement customer list endpoint.
- [x] Implement customer detail endpoint.
- [x] Implement update customer status endpoint.
- [x] Validate status input against `ACTIVE`, `BLOCKED`, and `INACTIVE`.
- [x] Ensure customer status update does not permanently delete accounts.

### Frontend

- [ ] Configure Axios to send cookies with requests.
- [ ] Implement register page.
- [ ] Implement login page.
- [ ] Implement logout action.
- [ ] Implement current-user bootstrap on app load.
- [ ] Implement route guard for authenticated customer routes.
- [ ] Implement route guard for admin routes.
- [ ] Avoid token storage in `localStorage`.
- [ ] Add admin customer status UI.

### Documentation and Testing

- [x] Add Swagger decorators for all auth endpoints.
- [x] Add Swagger decorators for admin customer endpoints.
- [x] Add validation DTOs for register, login, and customer status update.
- [x] Test register success.
- [x] Test duplicate email registration.
- [x] Test login success.
- [x] Test login failure with wrong password.
- [x] Test blocked/inactive login rejection.
- [x] Test refresh-token rotation.
- [x] Test logout clears cookies and revokes session.
- [x] Test admin-only endpoint rejects customer role.
- [x] Test current-user response excludes sensitive fields.
