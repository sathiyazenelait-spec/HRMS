# Zenelait HRMS Spring Boot Backend

This is the high-concurrency Spring Boot backend for the Zenelait HRMS platform. It is engineered with modern tech stacks:
- **Spring Boot 3.3.2 & Java 21**
- **Virtual Threads Execution**: Enabling zero-block task mapping for high speed and zero load latency.
- **MySQL Database**: Serving as primary storage for organizations, plans, and users.
- **Redis Cache**: Speeding up database queries and lookups.
- **Kafka Streams**: Emitting and logging organization creation and authentication events.

---

## Requirements
- Java 21 SDK
- MySQL Database running at port 3306
- Redis instance running at port 6379 (optional, fallback can be configured)
- Kafka Broker running at port 9092 (optional, fallback can be configured)

## Setup and Running

1. **MySQL Configuration**
   - Create a database named `zenelait_hrms` or let Spring Boot automatically create it.
   - Configure your credentials in `src/main/resources/application.yml` (default is root / password).
   - The schema script and sample seeds can be referenced in `db/schema.sql`.

2. **Build the Application**
   ```bash
   mvn clean install
   ```

3. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```
   The API endpoints will be accessible at: `http://localhost:8080/api/`

---

## API Endpoints

### 1. Authentication
- `POST /api/auth/login`
  - Body: `{ "username": "...", "password": "..." }`
- `POST /api/auth/register`
  - Body: `{ "username": "...", "gmail": "...", "mobile": "...", "password": "...", "confirmPassword": "...", "orgName": "...", "orgCode": "...", "otp": "..." }`

### 2. Superadmin Portal
- `GET /api/superadmin/organizations` (Returns cached organization entries)
- `POST /api/superadmin/organization` (Creates organization, generates code & OTP, fires Kafka event, evicts cache)
  - Body: `{ "name": "...", "orgType": "...", "ownerGmail": "...", "ownerMobile": "...", "planType": "..." }`
