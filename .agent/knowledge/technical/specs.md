# Technical Specifications: Marketing OS (v3.1)

## 1. Intelligence Layer (L1)
- **Models**: Gemini 1.5 Pro (Core), GPT-4o-mini (Audit).
- **Memory**: Pinecone (Vector DB), JSON Fallback.
- **Isolation**: Mandatory `product_id` metadata.

## 2. Infrastructure (L0)
- **Stack**: Next.js 14, Node.js 20, Prisma.
- **Audit**: Playwright for LP Auditor.
- **Messaging**: Unified Messaging Format (UMF) for FB/Zalo.

## 3. Deployment
- **Git Strategy**: Feature Branch Workflow.
- **Registry**: AI Agent Registry for model mapping.
