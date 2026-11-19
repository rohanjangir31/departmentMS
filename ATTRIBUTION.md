# Academic Project Attribution & Provenance

## Project Origin & Foundation
- **Project Base**: Department Management System (`departmentMS`)
- **Original Author**: Oyero Habibulah O.
- **Source Repository**: [https://github.com/oyerohabib/departmentMS](https://github.com/oyerohabib/departmentMS)
- **Original License**: MIT License (included in [`LICENSE`](./LICENSE))

## Ownership & Academic Context
- **Candidate / Developer**: Rohan Jangir (`rohanjangir31`)
- **Degree / Major**: B.Tech in Computer Science & Engineering
- **Final-Year Major Project**: **AcademiQ** — Enterprise-Grade AI-Powered Academic Department Management & Analytics System

## Scope of Work & Baseline vs. New Contributions

### Baseline System (Original Repository)
- Initial Next.js 15 frontend with App Router structure
- Initial Express.js + Mongoose REST API with basic role middleware (`student`, `lecturer`, `admin`)
- Basic course listing and local file upload via Multer

### New Engineering & Enhancements Implemented by Candidate
1. **AI & Machine Learning Layer**:
   - Automated syllabus and course document analysis with intelligent chunking
   - Retrieval-Augmented Generation (RAG) assistant for student course queries
   - Student academic risk and performance indicator model
2. **Security & Validation Architecture**:
   - Strict server-side role validation on registration (eliminating self-assigned admin privileges)
   - Zod/Joi schema validation on all API payloads
   - Security headers (Helmet.js), rate limiting (express-rate-limit), and CORS hardening
   - Secure token lifecycle handling and auto-logout on 401
3. **Database & Data Integrity**:
   - Normalization of course enrollments, removing duplicate state
   - Migration to cloud-resilient object storage for course materials
4. **Automated Testing Suite**:
   - Comprehensive unit and integration test coverage for auth, RBAC, courses, and materials
5. **Modern UI/UX & Responsive Redesign**:
   - Professional dashboard analytics, active sidebar navigation, accessible components, and error boundaries
