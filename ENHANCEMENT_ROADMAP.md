# 🎯 Current Project Enhancement Roadmap

## Current State Analysis

Your project already has:
- ✅ Next.js 14+ with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ MongoDB connection
- ✅ Authentication (signup/login)
- ✅ User management
- ✅ Cards system (documents)
- ✅ Dashboard with filters
- ✅ AI generation (mock)
- ✅ React Context (Auth & Cards)
- ✅ Axios configuration

## Enhancement Strategy

### Step 1: Add NestJS Backend (Week 1)

#### 1.1 Setup NestJS Project

```bash
# In project root
mkdir backend
cd backend

# Initialize NestJS
npx @nestjs/cli new . --package-manager pnpm

# Install dependencies
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport
pnpm add @prisma/client bcryptjs class-validator
pnpm add passport passport-jwt
pnpm add -D prisma @types/bcryptjs @types/passport-jwt
```

#### 1.2 Setup Prisma

```bash
# Initialize Prisma
npx prisma init

# Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/ai_workspace"
JWT_SECRET="your-super-secret-key"
```

#### 1.3 Create Prisma Schema

```prisma
// backend/prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  avatar    String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workspaces WorkspaceMember[]
  cards      Card[]

  @@map("users")
}

model Workspace {
  id          String   @id @default(uuid())
  name        String
  description String?
  slug        String   @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members WorkspaceMember[]
  cards   Card[]

  @@map("workspaces")
}

model WorkspaceMember {
  id          String   @id @default(uuid())
  role        String   @default("member")
  joinedAt    DateTime @default(now())

  userId      String
  user        User      @relation(fields: [userId], references: [id])
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([userId, workspaceId])
  @@map("workspace_members")
}

model Card {
  id          String   @id @default(uuid())
  title       String
  content     String
  category    String
  tags        String[]
  likes       Int      @default(0)
  bookmarks   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  workspaceId String?
  workspace   Workspace? @relation(fields: [workspaceId], references: [id])

  @@map("cards")
}
```

#### 1.4 Migrate Database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### Step 2: Implement Auth Module (Week 1)

#### 2.1 Create Auth Module

```bash
cd backend/src
nest g module auth
nest g service auth
nest g controller auth
```

#### 2.2 Auth Service Implementation

```typescript
// backend/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

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

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

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
}
```

#### 2.3 Auth Controller

```typescript
// backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(
      body.email,
      body.password,
      body.name,
    );
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}
```

### Step 3: Update Frontend to Use NestJS API (Week 1)

#### 3.1 Update Axios Config

```typescript
// frontend/lib/axios.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

#### 3.2 Update Environment Variables

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 3.3 Start Both Servers

```bash
# Terminal 1: Backend
cd backend
pnpm run start:dev  # Runs on port 3001

# Terminal 2: Frontend
cd frontend
npm run dev  # Runs on port 3000
```

### Step 4: Add Workspaces Module (Week 2)

#### 4.1 Create Workspaces Module

```bash
cd backend/src
nest g module workspaces
nest g service workspaces
nest g controller workspaces
```

#### 4.2 Workspaces Service

```typescript
// backend/src/workspaces/workspaces.service.ts
@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string, description?: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        description,
        slug,
        members: {
          create: {
            userId,
            role: 'owner',
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    return workspace;
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
```

#### 4.3 Frontend Workspace Page

```typescript
// frontend/app/workspaces/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/workspaces', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">My Workspaces</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {workspaces.map((workspace: any) => (
            <div
              key={workspace.id}
              className="bg-black p-6 rounded-lg border border-[#00B4D8] hover:border-[#00B4D8]/80 transition-colors cursor-pointer"
            >
              <h3 className="text-xl font-semibold mb-2">{workspace.name}</h3>
              <p className="text-gray-400">{workspace.description}</p>
              <div className="mt-4 text-sm text-gray-500">
                {workspace.members.length} members
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 5: Add AI Integration (Week 3)

#### 5.1 Install OpenAI

```bash
cd backend
pnpm add openai
```

#### 5.2 Create AI Service

```typescript
// backend/src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateContent(prompt: string, category: string) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that creates knowledge cards about ${category}.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return {
      content: completion.choices[0].message.content,
      title: this.extractTitle(completion.choices[0].message.content),
    };
  }

  async generateEmbeddings(text: string) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  }

  private extractTitle(content: string): string {
    const lines = content.split('\n');
    return lines[0].replace(/^#+\s*/, '').trim();
  }
}
```

## Implementation Timeline

### Week 1: Backend Foundation
- [x] Setup NestJS
- [x] Configure Prisma
- [x] Implement Auth API
- [x] Connect frontend to backend

### Week 2: Core Features
- [ ] Workspaces CRUD
- [ ] Workspace members
- [ ] Documents upload
- [ ] Notes system

### Week 3: AI Features
- [ ] OpenAI integration
- [ ] Content generation
- [ ] Embeddings
- [ ] Vector search

### Week 4: Polish & Deploy
- [ ] Real-time updates
- [ ] Queue processing
- [ ] Testing
- [ ] Deployment

## Testing Strategy

### Backend Tests
```bash
cd backend
pnpm test
pnpm test:e2e
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

## Deployment

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ai_workspace
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## Next Steps

1. **Today:** Setup NestJS backend
2. **This Week:** Implement Auth API
3. **Next Week:** Add Workspaces
4. **Week 3:** AI Integration
5. **Week 4:** Deploy

---

**Ready to enhance your project? Start with Step 1!** 🚀
