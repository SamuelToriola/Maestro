# TMaestro - Intelligent Task Management Platform

TMaestro is a modern task management platform that combines the power of LLM (IBM Granite) with intuitive workflow management capabilities. It features an automated workflow builder and intelligent planning machine for optimized resource management.

## Key Features

1. **Automated Workflow Builder**
   - Drag-and-drop interface for workflow design
   - Spreadsheet input support
   - Export functionality
   - Milestone planning and tracking

2. **Intelligent Planning Machine**
   - Timeline planning
   - Supply quantity management
   - Resource allocation
   - Delivery unit prediction
   - IBM Granite LLM integration for RAG functionalities

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB
- IBM Granite API access

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/yourusername/tmaestro.git
cd tmaestro
```

2. Install dependencies
```bash
npm run install-all
```

3. Set up environment variables
Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_uri
IBM_GRANITE_API_KEY=your_api_key
JWT_SECRET=your_jwt_secret
```

4. Start the development server
```bash
npm run dev
```

## Project Structure

```
tmaestro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
├── server/                # Node.js backend
│   ├── controllers/      # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── services/        # Business logic
└── package.json         # Project configuration
```

## Technologies Used

- Frontend: React, TypeScript, Material-UI
- Backend: Node.js, Express
- Database: MongoDB
- LLM Integration: IBM Granite
- Authentication: JWT
- File Processing: xlsx 