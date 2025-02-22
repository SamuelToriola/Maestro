# TMaestro Setup Guide

TMaestro is a comprehensive task management platform that combines the power of IBM Granite LLM with intuitive workflow management capabilities.

## Prerequisites

1. Node.js (v14 or higher)
2. MongoDB (v4.4 or higher)
3. IBM Granite API access
4. npm or yarn package manager

## Installation

1. Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd tmaestro
npm install
cd client
npm install
cd ..
```

2. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/tmaestro
JWT_SECRET=your_jwt_secret_key_here
IBM_GRANITE_API_KEY=your_ibm_granite_api_key_here
PORT=5000
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

3. Install required npm packages:
```bash
npm install -g typescript ts-node nodemon
npm install --save-dev @types/react @types/node @types/express @types/mongoose @types/cors @types/jsonwebtoken @types/bcryptjs @types/multer
```

## Development

1. Start the development server:
```bash
npm run dev
```
This will start both the backend server and the React development server.

2. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Features

### 1. Automated Workflow Builder
- Drag-and-drop interface for workflow design
- Import/export functionality with spreadsheets
- Real-time collaboration
- LLM-powered suggestions for workflow optimization

### 2. Intelligent Planning Machine
- Resource allocation optimization
- Supply chain management
- Timeline planning
- LLM-powered delivery optimization

## Project Structure

```
tmaestro/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
├── server/                # Node.js backend
│   ├── controllers/      # Request handlers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── services/        # Business logic
├── templates/            # Excel templates
└── package.json         # Project configuration
```

## API Documentation

### Workflow API Endpoints

- `POST /api/workflows` - Create new workflow
- `GET /api/workflows` - Get all workflows
- `GET /api/workflows/:id` - Get specific workflow
- `PUT /api/workflows/:id` - Update workflow
- `DELETE /api/workflows/:id` - Delete workflow
- `POST /api/workflows/import` - Import from spreadsheet
- `GET /api/workflows/:id/export` - Export to spreadsheet
- `GET /api/workflows/:id/suggestions` - Get LLM suggestions

### Planning API Endpoints

- `POST /api/projects/:projectId/planning` - Create planning
- `GET /api/projects/:projectId/planning` - Get all plannings
- `GET /api/projects/:projectId/planning/:id` - Get specific planning
- `PUT /api/projects/:projectId/planning/:id` - Update planning
- `DELETE /api/projects/:projectId/planning/:id` - Delete planning
- `POST /api/projects/:projectId/planning/import` - Import from spreadsheet
- `GET /api/projects/:projectId/planning/:id/export` - Export to spreadsheet
- `GET /api/projects/:projectId/planning/:id/optimize` - Get optimized schedule

## Spreadsheet Templates

The application uses specific formats for importing data:

1. Workflow Template
   - Task Name
   - Description
   - Duration
   - Dependencies
   - Resources
   - Status

2. Planning Template
   - Resources sheet (resource details)
   - Supplies sheet (supply chain information)
   - Timeline sheet (milestones and dates)

Templates are available in the `templates/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 