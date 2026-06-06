# Student Grievance & Complaint Management System

A secured, cloud-integrated Student Grievance and Complaint Management System designed for colleges and universities. The application features distinct portals for **Students**, **Department Representatives**, and **Administrators**, and integrates directly with AWS services for file storage (S3), email alerts (SNS), and application monitoring (CloudWatch).

---

## 1. System Architecture

The project is structured around a **Three-Tier Architecture**:
1. **Presentation Tier (React.js)**: A responsive Single Page Application (SPA) styled using Bootstrap and custom glassmorphism components. It uses Axios for API requests, automatically appending JWT tokens to headers via interceptors.
2. **Application Tier (Node.js & Express.js)**: A secured REST API which coordinates user registrations, files validation, JWT token operations, database SQL queries, and directs interactions to Amazon S3, SNS, and CloudWatch.
3. **Data Tier (MySQL on Amazon RDS)**: Stably manages relational data including user authentication details, departmental roles, ticket history logs, and notifications.

```
                               ┌─────────────────┐
                               │    React SPA    │
                               └────────┬────────┘
                                        │
                                   HTTP REST
                                        │
                               ┌────────▼────────┐
                               │   Express API   │
                               └────────┬────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │                          │                          │
      SQL Connection Pool         AWS SDK (v3) S3            AWS SDK (v3) SNS
             │                          │                          │
   ┌─────────▼─────────┐      ┌─────────▼─────────┐      ┌─────────▼─────────┐
   │ Amazon RDS (MySQL)│      │  Amazon S3 Bucket │      │  Amazon SNS Topic │
   └───────────────────┘      └───────────────────┘      └───────────────────┘
```

---

## 2. Project Folder Structure

```
Complaint-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.config.js          # MySQL pool
│   │   │   └── aws.config.js         # AWS S3, SNS, CloudWatch SDK v3
│   │   ├── controllers/
│   │   │   ├── auth.controller.js    # Sign-up, Sign-in
│   │   │   ├── complaint.controller.js # Student ticket creations & history
│   │   │   ├── department.controller.js # Rep investigation & resolution updates
│   │   │   └── admin.controller.js   # Admin assignments, escalations & users
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT & role authorization
│   │   │   └── upload.middleware.js  # Multer size/type validation filters
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── complaint.routes.js
│   │   │   ├── department.routes.js
│   │   │   └── admin.routes.js
│   │   ├── services/
│   │   │   ├── s3.service.js         # Upload buffers to AWS S3
│   │   │   ├── sns.service.js        # Publish status messages to SNS ARN
│   │   │   └── cloudwatch.service.js # Centralized logger to CloudWatch stream
│   │   ├── app.js                    # Express app declarations
│   │   └── server.js                 # Entry listener
│   ├── .env.example                  # Environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Shared navbar & responsive sidebars
│   │   │   └── ProtectedRoute.jsx    # Guard wrapper checking token roles
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # State provider for login/logout hook
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Landing entry
│   │   │   ├── Login.jsx             # Combined portal sign-in
│   │   │   ├── Register.jsx          # Student registration
│   │   │   ├── StudentDashboard.jsx  # Student list & KPI cards
│   │   │   ├── SubmitComplaint.jsx   # Form selector mapping departments
│   │   │   ├── ComplaintHistory.jsx  # Grievances tracking & filter tables
│   │   │   ├── ComplaintDetails.jsx  # Audit timeline log & update actions
│   │   │   ├── DepartmentDashboard.jsx # Rep workload list & edits
│   │   │   ├── AdminDashboard.jsx    # Admin console managing users & tickets
│   │   │   └── AnalyticsDashboard.jsx # Graphic metrics charts using CSS bars
│   │   ├── services/
│   │   │   └── api.js                # Axios instance with interceptors
│   │   ├── App.css                   # Custom global CSS variables
│   │   ├── App.jsx                   # Central route mapping
│   │   └── main.jsx                  # React entry
│   ├── index.html                    # SEO optimized viewport template
│   └── package.json
└── db/
    └── schema.sql                    # Initial MySQL setup & seeding scripts
```

---

## 3. Database Design & Seeding

The database relies on five primary relational tables. Execute the queries inside [schema.sql](file:///c:/Users/arunk/OneDrive/Desktop/CloudPbl/Complaint-Management-System/db/schema.sql) in your MySQL console or RDS workbench to build the structures and seed defaults.

* **Departments**: Sets up Academic, Infrastructure, Hostel, Library, and Placement departments.
* **Users**: Stores registration accounts (Passwords hashed with `bcrypt`). Seeds a default Admin (`admin@college.edu`) and five Department Representative accounts (`rep123` passwords).
* **Complaints**: Tracks grievance titles, descriptions, categories, priorities, file attachment S3 links, and current status.
* **ComplaintUpdates**: Logs chronology status updates (`status_from` to `status_to`) alongside resolution remarks.
* **Notifications**: Internal database table logging in-app updates for users.

---

## 4. Environment Variables Setup

Create a `.env` file inside the `backend/` folder. Use the following key-value pairs:

```ini
PORT=5000
JWT_SECRET=super_secret_jwt_key_123456789

# Database Configuration (Amazon RDS / Local MySQL)
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_grievance
DB_PORT=3306

# AWS Configuration
# Note: If deploying to an EC2 instance with an attached IAM Role, 
# you can leave AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY empty.
# The AWS SDK will automatically retrieve temporary credentials.
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# AWS Provisioned Resources (Configure to match your manual setup)
AWS_S3_BUCKET_NAME=student-grievance-evidence-bucket
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:student-grievance-notifications
AWS_CLOUDWATCH_LOG_GROUP=student-grievance-app-logs
```

---

## 5. Required IAM Permissions List

Configure the IAM Policy attached to the IAM User or EC2 Instance Profile using the policy statement blocks below:

### Amazon S3 Policy Statement
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject"
            ],
            "Resource": "arn:aws:s3:::student-grievance-evidence-bucket/*"
        }
    ]
}
```

### Amazon SNS Policy Statement
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sns:Publish"
            ],
            "Resource": "arn:aws:sns:us-east-1:123456789012:student-grievance-notifications"
        }
    ]
}
```

### Amazon CloudWatch Logs Policy Statement
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogStreams"
            ],
            "Resource": "arn:aws:logs:us-east-1:123456789012:log-group:student-grievance-app-logs:*"
        }
    ]
}
```

---

## 6. Setup & Execution Instructions

### Database Provisioning
1. Open your MySQL workbench/CLI.
2. Run the SQL statements inside `db/schema.sql`.

### Express Backend Startup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`.
4. Run in development mode (launches hot-reload via nodemon):
   ```bash
   npm run dev
   ```

### React Frontend Startup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the portal in your browser at `http://localhost:5173`.

---

## 7. API Endpoints Documentation

All requests except public authentications require an `Authorization: Bearer <jwt_token>` header.

### 1. Authentication Paths
* **`POST /api/auth/register`**
  - **Body**: `{ "name": "...", "email": "...", "password": "...", "phone": "..." }`
  - **Description**: Registers a student account. Hashes passwords via `bcrypt`.
* **`POST /api/auth/login`**
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Description**: Authenticates users. Returns token and user session detail (role: Student / Department Representative / Admin).

### 2. Student Paths
* **`POST /api/complaints`**
  - **Headers**: `Content-Type: multipart/form-data`
  - **Body (Form Data)**: `title`, `description`, `category` (specific subcategory like "Water Problems"), `priority` (Low/Medium/High/Critical), `evidence` (File upload: JPG, PNG, PDF, DOCX up to 5MB).
  - **Description**: Registers complaint, uploads file to S3, updates audit updates log, registers an app notification, and alerts topic via SNS.
* **`GET /api/complaints`**
  - **Description**: Lists all grievances submitted by the logged-in student.
* **`GET /api/complaints/:id`**
  - **Description**: Detailed status check and audit timeline logs for a specific grievance.

### 3. Department Representative Paths
* **`GET /api/department/complaints`**
  - **Description**: Lists all complaints assigned to the representative's department sphere.
* **`PUT /api/department/complaints/:id/status`**
  - **Body**: `{ "status": "In Progress" / "Resolved", "remarks": "..." }`
  - **Description**: Transitions complaint status, appends remarks to updates database, and sends email status notification to student via SNS.

### 4. Administrator Paths
* **`GET /api/admin/complaints`**
  - **Query Params**: `status`, `priority`, `department_id`, `category`
  - **Description**: Fetches all complaints across departments matching filters.
* **`POST /api/admin/assign`**
  - **Body**: `{ "complaint_id": "...", "department_id": "...", "priority": "..." }`
  - **Description**: Routes a complaint to a department and transitions status to `Assigned`. Alerts students and reps via SNS.
* **`PUT /api/admin/escalate`**
  - **Body**: `{ "complaint_id": "...", "priority": "...", "remarks": "..." }`
  - **Description**: Increases severity of ticket, logging remarks.
* **`PUT /api/admin/close`**
  - **Body**: `{ "complaint_id": "...", "remarks": "..." }`
  - **Description**: Closes the ticket officially, logging comments.
* **`GET /api/admin/analytics`**
  - **Description**: Compiles status numbers, categories, priorities and department load data for interactive charts.
* **`GET /api/admin/users`** / **`POST /api/admin/users`** / **`DELETE /api/admin/users/:id`**
  - **Description**: Handles department representative registration and deleting student/representative profiles.

---

## 8. Portal Credentials for Testing

To check features out-of-the-box, the database seeds include the following test logins (Password: `rep123` for reps, `admin123` for administrators):

* **System Administrator**: `admin@college.edu` (Password: `admin123`)
* **Academic Representative**: `academic.rep@college.edu` (Password: `rep123`)
* **Infrastructure Representative**: `infra.rep@college.edu` (Password: `rep123`)
* **Placement Representative**: `placement.rep@college.edu` (Password: `rep123`)
