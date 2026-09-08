
````
# VentureForge AI

> AI-powered Startup Blueprint Generator built with IBM watsonx.ai, IBM Granite 4 H Small, and Retrieval-Augmented Generation (RAG).

VentureForge AI helps early-stage founders turn a raw startup idea into a structured startup blueprint. Users provide basic startup context and receive AI-assisted insights across business strategy, customers, competitors, funding, financial planning, go-to-market strategy, and risks.

##  Features

-  Startup Idea Analysis
-  Target Customer Analysis
-  Competitor Analysis
-  Business & Revenue Model
-  Funding & Government Schemes
-  Financial Planning
-  Go-To-Market Strategy
-  Risk Analysis
-  Consolidated Final Blueprint
-  Responsive Light/Dark UI

##  AI & IBM Technology

VentureForge AI uses:

- **IBM watsonx.ai**
- **IBM Granite 4 H Small**
- **Retrieval-Augmented Generation (RAG)**

The RAG pipeline retrieves relevant information from a curated local knowledge base before passing the contextual information to IBM Granite.

### Knowledge Sources

```text
src/knowledge/
├── startup-fundamentals.md
├── business-models.md
├── go-to-market.md
├── india-startup-funding.md
└── startup-schemes.md
````

## 🔄 How It Works

```
Startup Idea + Context
          ↓
     RAG Retrieval
          ↓
   IBM Granite 4 H Small
          ↓
 Structured AI Analysis
          ↓
 Interactive Dashboard
          ↓
    Final Blueprint
```

Financial planning uses deterministic application logic for calculations such as budget allocation, monthly burn, runway, and break-even estimates.

## 🛠️ Tech Stack

**Frontend**

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Zustand
* Lucide React

**AI**

* IBM watsonx.ai
* IBM Granite 4 H Small

**Retrieval**

* Local Markdown knowledge base
* In-process RAG
* Relevance-based retrieval

## 📁 Project Structure

```
ventureforge-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── dashboard/
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/
│   ├── knowledge/
│   ├── lib/
│   │   ├── rag/
│   │   └── watsonx/
│   └── store/
├── .env.example
├── components.json
├── package.json
├── pnpm-lock.yaml
└── README.md
```

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Ventureforge-ai.git
cd Ventureforge-ai
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file:

```env
WATSONX_API_KEY=your_ibm_cloud_api_key
WATSONX_PROJECT_ID=your_watsonx_project_id
WATSONX_GENERATION_MODEL=ibm/granite-4-h-small
WATSONX_URL=https://us-south.ml.cloud.ibm.com
```

> Never commit `.env.local` or expose your IBM Cloud API key.

### 4. Run the application

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## 🎓 AICTE Problem Statement

**Startup Blueprint Generator Agent**

VentureForge AI was developed to transform raw startup ideas into structured business blueprints using generative AI, retrieval-augmented knowledge, competitor analysis, funding insights, financial planning, and go-to-market strategy.

## 🔮 Future Scope

Potential future improvements include:

* PDF/DOCX blueprint export
* Live market research
* Real-time funding discovery
* Advanced competitor intelligence
* Persistent startup workspaces
* Industry-specific knowledge bases

## ⚠️ Disclaimer

VentureForge AI provides AI-assisted business planning and research support. Generated financial estimates, market insights, funding information, and strategic recommendations should be independently verified before real-world use.

## 📄 License

This project is licensed under the MIT License.

````
