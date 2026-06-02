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
- `JwtStrategy`: access-token validation.
- `RefreshTokenService`: refresh session creation, hashing, rotation, and revocation.
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

- [ ] Add `UserRole` enum with `CUSTOMER` and `ADMIN`.
- [ ] Add `UserStatus` enum with `ACTIVE`, `BLOCKED`, and `INACTIVE`.
- [ ] Add `User` model fields from `docs/02_DATA_MODEL.md`.
- [ ] Add unique constraint on `User.email`.
- [ ] Add `RefreshSession` model fields from `docs/02_DATA_MODEL.md`.
- [ ] Add relation from `User` to `RefreshSession`.
- [ ] Add Prisma migration for auth models.

### Backend Auth

- [ ] Install and configure password hashing library.
- [ ] Implement customer registration.
- [ ] Hash passwords before storing users.
- [ ] Implement login credential validation.
- [ ] Prevent blocked or inactive users from logging in.
- [ ] Generate JWT access token.
- [ ] Generate refresh token.
- [ ] Hash refresh token before database storage.
- [ ] Set `access_token` HttpOnly cookie.
- [ ] Set `refresh_token` HttpOnly cookie.
- [ ] Implement refresh-token validation.
- [ ] Implement refresh-token rotation.
- [ ] Revoke old refresh session during rotation.
- [ ] Implement logout session revocation.
- [ ] Clear auth cookies on logout.
- [ ] Implement current-user endpoint.

### Backend Authorization

- [ ] Implement JWT access-token strategy.
- [ ] Implement role metadata decorator.
- [ ] Implement role guard.
- [ ] Protect admin endpoints with `ADMIN` role.
- [ ] Protect customer endpoints with `CUSTOMER` role where needed.
- [ ] Ensure blocked or inactive users cannot continue privileged actions after refresh fails.

### Admin Customer Management

- [ ] Implement customer list endpoint.
- [ ] Implement customer detail endpoint.
- [ ] Implement update customer status endpoint.
- [ ] Validate status input against `ACTIVE`, `BLOCKED`, and `INACTIVE`.
- [ ] Ensure customer status update does not permanently delete accounts.

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

- [ ] Add Swagger decorators for all auth endpoints.
- [ ] Add Swagger decorators for admin customer endpoints.
- [ ] Add validation DTOs for register, login, and customer status update.
- [ ] Test register success.
- [ ] Test duplicate email registration.
- [ ] Test login success.
- [ ] Test login failure with wrong password.
- [ ] Test blocked/inactive login rejection.
- [ ] Test refresh-token rotation.
- [ ] Test logout clears cookies and revokes session.
- [ ] Test admin-only endpoint rejects customer role.
- [ ] Test current-user response excludes sensitive fields.
