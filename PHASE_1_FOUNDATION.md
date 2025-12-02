# Phase 1: Foundation Setup

## Task 1.1: Environment Setup

**Module:** Infrastructure
**Type:** Both (Backend + Frontend)
**Priority:** Critical
**Dependencies:** None

### Description
Set up the complete development environment with all required tools, databases, and services.

### Steps

#### 1.1.1 Install Core Tools
```bash
# Node.js 18+ LTS
node --version  # Should be 18+

# Package manager
npm install -g pnpm
pnpm --version

# NestJS CLI
pnpm add -g @nestjs/cli

# Prisma CLI
pnpm add -g prisma
```

#### 1.1.2 Setup PostgreSQL
```bash
# Using Docker
docker run --name postgres-ai-workspace \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=ai_workspace \
  -p 5432:5432 \
  -d postgres:15

# Verify connection
psql -h localhost -U postgres -d ai_workspace
```

#### 1.1.3 Setup Redis
```bash
# Using Docker
docker run --name redis-ai-workspace \
  -p 6379:6379 \
  -d redis:7-alpine

# Verify connection
redis-cli ping  # Should return PONG
```

#### 1.1.4 Initialize Backend
```bash
# Create NestJS project
nest new backend --package-manager pnpm
cd backend

# Install dependencies
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport
pnpm add @prisma/client bcryptjs class-validator class-transformer
pnpm add @nestjs/websockets @nestjs/platform-socket.io
pnpm add @nestjs/bull bull bullmq ioredis
pnpm add -D prisma @types/bcryptjs @types/node
```

#### 1.1.5 Initialize Frontend
```bash
# Create Next.js project
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend

# Install dependencies
pnpm add @tanstack/react-query axios zustand
pnpm add socket.io-client react-hook-form zod
pnpm add lucide-react clsx tailwind-merge
pnpm add -D @types/node
```

### Expected Output
- ✅ Node.js 18+ installed
- ✅ PostgreSQL running on port 5432
- ✅ Redis running on port 6379
- ✅ Backend project initialized
- ✅ Frontend project initialized
- ✅ All dependencies installed

---

## Task 1.2: Database Schema Design

**Module:** Database
**Type:** Backend
**Priority:** Critical
**Dependencies:** Task 1.1

### Description
Design and implement the complete database schema using Prisma ORM.

### Database Schema

#### File: `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  role          UserRole  @default(USER)
  isActive      Boolean   @default(true)
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  workspaces        WorkspaceMember[]
  documents         Document[]
  notes             Note[]
  chatMessages      ChatMessage[]
  createdWorkspaces Workspace[]       @relation("WorkspaceCreator")

  @@index([email])
  @@map("users")
}

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model Workspace {
  id          String   @id @default(uuid())
  name        String
  description String?
  slug        String   @unique
  settings    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  creatorId String
  creator   User              @relation("WorkspaceCreator", fields: [creatorId], references: [id])
  members   WorkspaceMember[]
  documents Document[]
  notes     Note[]
  chats     Chat[]

  @@index([slug])
  @@index([creatorId])
  @@map("workspaces")
}

model WorkspaceMember {
  id        String              @id @default(uuid())
  role      WorkspaceMemberRole @default(MEMBER)
  joinedAt  DateTime            @default(now())
  updatedAt DateTime            @updatedAt

  // Relations
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
  @@index([userId])
  @@index([workspaceId])
  @@map("workspace_members")
}

enum WorkspaceMemberRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Document {
  id          String         @id @default(uuid())
  title       String
  content     String?
  fileUrl     String?
  fileType    String?
  fileSize    Int?
  status      DocumentStatus @default(PROCESSING)
  metadata    Json?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // Relations
  workspaceId String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  uploadedBy  String
  uploader    User       @relation(fields: [uploadedBy], references: [id])
  embeddings  Embedding[]

  @@index([workspaceId])
  @@index([uploadedBy])
  @@index([status])
  @@map("documents")
}

enum DocumentStatus {
  PROCESSING
  COMPLETED
  FAILED
}

model Note {
  id        String   @id @default(uuid())
  title     String
  content   String
  tags      String[]
  isPinned  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  workspaceId String
  workspace   Workspace   @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  authorId    String
  author      User        @relation(fields: [authorId], references: [id])
  embeddings  Embedding[]

  @@index([workspaceId])
  @@index([authorId])
  @@fulltext([title, content])
  @@map("notes")
}

model Embedding {
  id         String   @id @default(uuid())
  vector     Float[]
  content    String
  metadata   Json?
  createdAt  DateTime @default(now())

  // Relations (polymorphic)
  documentId String?
  document   Document? @relation(fields: [documentId], references: [id], onDelete: Cascade)
  noteId     String?
  note       Note?     @relation(fields: [noteId], references: [id], onDelete: Cascade)

  @@index([documentId])
  @@index([noteId])
  @@map("embeddings")
}

model Chat {
  id        String   @id @default(uuid())
  title     String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  workspaceId String
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  messages    ChatMessage[]

  @@index([workspaceId])
  @@map("chats")
}

model ChatMessage {
  id        String          @id @default(uuid())
  content   String
  role      ChatMessageRole
  metadata  Json?
  createdAt DateTime        @default(now())

  // Relations
  chatId String
  chat   Chat   @relation(fields: [chatId], references: [id], onDelete: Cascade)
  userId String?
  user   User?  @relation(fields: [userId], references: [id])

  @@index([chatId])
  @@index([userId])
  @@map("chat_messages")
}

enum ChatMessageRole {
  USER
  ASSISTANT
  SYSTEM
}
```

### Migration Commands

```bash
# Initialize Prisma
cd backend
npx prisma init

# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Seed database (optional)
npx prisma db seed
```

### Expected Output
- ✅ Prisma schema created
- ✅ Database migrated
- ✅ Prisma Client generated
- ✅ All tables created in PostgreSQL

---

## Task 1.3: Authentication Module (Backend)

**Module:** Auth
**Type:** Backend
**Priority:** Critical
**Dependencies:** Task 1.2

### Description
Implement complete authentication system with JWT, password hashing, and guards.

### File Structure
```
backend/src/modules/auth/
├── dto/
│   ├── login.dto.ts
│   ├── register.dto.ts
│   └── forgot-password.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── roles.guard.ts
├── strategies/
│   └── jwt.strategy.ts
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

### Implementation

#### 1.3.1 DTOs

**File:** `backend/src/modules/auth/dto/register.dto.ts`
```typescript
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

**File:** `backend/src/modules/auth/dto/login.dto.ts`
```typescript
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

#### 1.3.2 Auth Service

**File:** `backend/src/modules/auth/auth.service.ts`
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  private generateToken(user: any): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
      },
    });
  }
}
```

### API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |

### Expected Output
- ✅ User registration working
- ✅ User login working
- ✅ JWT tokens generated
- ✅ Password hashing implemented
- ✅ Guards protecting routes

---

*Continue to PHASE_1_FOUNDATION_PART2.md for frontend implementation...*
