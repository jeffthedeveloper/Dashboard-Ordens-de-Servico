# Service Orders Dashboard - Monorepo

A comprehensive service orders management system built with Flask backend and React frontend, optimized for Render free tier deployment.

## 🏗️ Architecture

This is a monorepo containing:
- **Backend**: Flask API with SQLAlchemy ORM
- **Frontend**: React with TypeScript and Vite
- **Database**: SQLite for development and production
- **Deployment**: Render.com with automated CI/CD

## 🚀 Technologies

### Backend
- **Flask** - Web framework
- **SQLAlchemy** - ORM for database operations
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Migrate** - Database migrations
- **Gunicorn** - WSGI HTTP Server
- **WeasyPrint** - PDF generation
- **Pandas** - Data processing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **React Router** - Client-side routing

### DevOps
- **Render.com** - Cloud deployment platform
- **GitHub Actions** - CI/CD pipeline
- **SQLite** - Lightweight database

## 📁 Project Structure

```
/
├── backend/                 # Flask API
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Business logic
│   ├── src/assets/         # JSON data files
│   ├── main.py            # Application entry point
│   ├── seed.py            # Database seeding
│   └── requirements.txt   # Python dependencies
│
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   └── utils/         # Utility functions
│   └── package.json       # Node dependencies
│
├── database/              # SQLite database files
├── render.yaml           # Render deployment config
└── README.md            # This file
```

## 🛠️ Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

5. **Initialize database:**
   ```bash
   flask seed-db
   ```

6. **Run development server:**
   ```bash
   python main.py
   ```

The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Create .env file in the frontend directory
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## 🚀 Deployment

This project is configured for deployment on Render (backend) and GitHub Pages/Vercel (frontend).

### Backend Deployment (Render.com)

This project is configured for automatic deployment on Render using the `render.yaml` file.

#### Prerequisites
1. Fork this repository
2. Create a Render account
3. Connect your GitHub repository to Render

#### Environment Variables (Render Secrets)
Configure these as secrets in your Render dashboard:

```
ADMIN_USER=your_admin_username
ADMIN_PASS=your_secure_password
AUTH_TOKEN=your_jwt_token
```

#### Deployment Steps
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy backend to Render"
   git push origin main
   ```

2. **Render will automatically:**
   - Build the backend service
   - Deploy the service

#### Production URL
- **API**: https://dashboard-os-api.onrender.com

### Frontend Deployment (GitHub Pages)

This project is configured for deployment to GitHub Pages via GitHub Actions.

#### Prerequisites
1. Ensure your repository is public.
2. Enable GitHub Pages for your repository (Settings -> Pages -> Deploy from a branch -> GitHub Actions).

#### Deployment Steps
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy frontend to GitHub Pages"
   git push origin main
   ```

2. **GitHub Actions will automatically:**
   - Build the frontend application.
   - Deploy the `dist` folder to GitHub Pages.

#### Production URL
- **Frontend**: `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`
  (e.g., `https://jeffthedeveloper.github.io/Dashboard-Ordens-de-Servico/`)

### Frontend Deployment (Vercel Alternative)

As an alternative to GitHub Pages, you can deploy the frontend to Vercel.

#### Deployment Steps
1. **Import the repository** into your Vercel account at [vercel.com](https://vercel.com).
2. **Configure Environment Variables** in Vercel settings for your project:
   - `VITE_API_URL`: `https://dashboard-os-api.onrender.com`
3. **Vercel will automatically** deploy your frontend on every push to your connected branch.

## 🔐 Security of Credentials

**IMPORTANT:** Never expose sensitive credentials like `ADMIN_USER`, `ADMIN_PASS`, and `AUTH_TOKEN` directly in your `README.md` or commit them to your public repository.

For local development, these variables are loaded from `.env` files. For production deployments (e.g., Render), they should be configured as **secrets** directly in the platform's dashboard.

To provide instructions for setting up these variables locally without exposing them publicly, refer to the `env-instructions.txt` file.

```
For local development, configure the environment variables listed in `env-instructions.txt`.
```

This ensures that only you have access to the actual credentials, while providing clear guidance for others to set up their local environments.

## 🔐 Authentication

The API uses a simple token-based authentication system:

1. **Login endpoint:** `POST /api/login`
   ```json
   {
     "username": "admin",
     "password": "your_password"
   }
   ```

2. **Response:**
   ```json
   {
     "token": "your_auth_token"
   }
   ```

3. **Protected routes:** Include token in Authorization header:
   ```
   Authorization: Bearer your_auth_token
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User authentication

### Cities
- `GET /api/cidades` - List all cities
- `POST /api/cidades` - Create new city
- `GET /api/cidades/{id}` - Get city details
- `PUT /api/cidades/{id}` - Update city
- `DELETE /api/cidades/{id}` - Delete city

### Clients
- `GET /api/clientes` - List all clients
- `POST /api/clientes` - Create new client
- `GET /api/clientes/{id}` - Get client details
- `PUT /api/clientes/{id}` - Update client
- `DELETE /api/clientes/{id}` - Delete client

### Service Orders
- `GET /api/ordens` - List all service orders
- `POST /api/ordens` - Create new service order
- `GET /api/ordens/{id}` - Get service order details
- `PUT /api/ordens/{id}` - Update service order
- `DELETE /api/ordens/{id}` - Delete service order

### Technicians
- `GET /api/tecnicos` - List all technicians
- `POST /api/tecnicos` - Create new technician
- `GET /api/tecnicos/{id}` - Get technician details
- `PUT /api/tecnicos/{id}` - Update technician
- `DELETE /api/tecnicos/{id}` - Delete technician

### Reports
- `GET /api/relatorios` - Generate reports

## 🎯 Features

### Dashboard
- Real-time service orders overview
- Performance metrics and charts
- Quick access to recent activities

### Service Orders Management
- Create, read, update, delete operations
- Status tracking and updates
- Client and technician assignment
- Geographic location mapping

### Client Management
- Complete client database
- Contact information management
- Service history tracking

### Technician Management
- Technician profiles and specializations
- Workload distribution
- Performance tracking

### Reporting
- Comprehensive analytics
- Export capabilities (PDF, Excel)
- Custom date ranges and filters

## 🔧 Performance Optimizations

### Backend (Render Free Tier)
- **Memory Usage**: Optimized for 512MB RAM limit
- **CPU Usage**: Single worker configuration for 0.1 CPU
- **Database**: SQLite for minimal resource usage
- **Caching**: Efficient query optimization

### Frontend
- **Code Splitting**: React.lazy() for route-based splitting
- **Virtualization**: Large lists with react-virtualized
- **Bundle Size**: Tree-shaking and compression
- **Mobile Optimization**: Responsive design for older devices

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Modern smartphones and tablets
- Older Android devices (Android 6+)
- iOS devices (iOS 12+)
- Touch-friendly interface
- Offline capabilities (PWA ready)

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [DEPLOY_FIXES.md](DEPLOY_FIXES.md) for common deployment issues

## 🎖️ Portfolio Demo

This project serves as a comprehensive demonstration of:
- **Full-stack development** with modern technologies
- **Cloud deployment** and DevOps practices
- **Responsive design** and mobile optimization
- **API design** and database management
- **Performance optimization** for resource-constrained environments

Perfect for showcasing skills to potential employers and clients in:
- Web development
- System architecture
- Cloud deployment
- Database design
- User experience design

---

**Service ID**: srv-d2t0hu15pdvs73934od0  
**Live Demo**: `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`  
**API Documentation**: https://dashboard-os-api.onrender.com/api

The API uses a simple token-based authentication system:

1. **Login endpoint:** `POST /api/login`
   ```json
   {
     "username": "admin",
     "password": "your_password"
   }
   ```

2. **Response:**
   ```json
   {
     "token": "your_auth_token"
   }
   ```

3. **Protected routes:** Include token in Authorization header:
   ```
   Authorization: Bearer your_auth_token
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User authentication

### Cities
- `GET /api/cidades` - List all cities
- `POST /api/cidades` - Create new city
- `GET /api/cidades/{id}` - Get city details
- `PUT /api/cidades/{id}` - Update city
- `DELETE /api/cidades/{id}` - Delete city

### Clients
- `GET /api/clientes` - List all clients
- `POST /api/clientes` - Create new client
- `GET /api/clientes/{id}` - Get client details
- `PUT /api/clientes/{id}` - Update client
- `DELETE /api/clientes/{id}` - Delete client

### Service Orders
- `GET /api/ordens` - List all service orders
- `POST /api/ordens` - Create new service order
- `GET /api/ordens/{id}` - Get service order details
- `PUT /api/ordens/{id}` - Update service order
- `DELETE /api/ordens/{id}` - Delete service order

### Technicians
- `GET /api/tecnicos` - List all technicians
- `POST /api/tecnicos` - Create new technician
- `GET /api/tecnicos/{id}` - Get technician details
- `PUT /api/tecnicos/{id}` - Update technician
- `DELETE /api/tecnicos/{id}` - Delete technician

### Reports
- `GET /api/relatorios` - Generate reports

## 🎯 Features

### Dashboard
- Real-time service orders overview
- Performance metrics and charts
- Quick access to recent activities

### Service Orders Management
- Create, read, update, delete operations
- Status tracking and updates
- Client and technician assignment
- Geographic location mapping

### Client Management
- Complete client database
- Contact information management
- Service history tracking

### Technician Management
- Technician profiles and specializations
- Workload distribution
- Performance tracking

### Reporting
- Comprehensive analytics
- Export capabilities (PDF, Excel)
- Custom date ranges and filters

## 🔧 Performance Optimizations

### Backend (Render Free Tier)
- **Memory Usage**: Optimized for 512MB RAM limit
- **CPU Usage**: Single worker configuration for 0.1 CPU
- **Database**: SQLite for minimal resource usage
- **Caching**: Efficient query optimization

### Frontend
- **Code Splitting**: React.lazy() for route-based splitting
- **Virtualization**: Large lists with react-virtualized
- **Bundle Size**: Tree-shaking and compression
- **Mobile Optimization**: Responsive design for older devices

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
npm run test:integration
```

## 📱 Mobile Support

The application is fully responsive and optimized for:
- Modern smartphones and tablets
- Older Android devices (Android 6+)
- iOS devices (iOS 12+)
- Touch-friendly interface
- Offline capabilities (PWA ready)

## 🌐 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the [DEPLOY_FIXES.md](DEPLOY_FIXES.md) for common deployment issues

## 🎖️ Portfolio Demo

This project serves as a comprehensive demonstration of:
- **Full-stack development** with modern technologies
- **Cloud deployment** and DevOps practices
- **Responsive design** and mobile optimization
- **API design** and database management
- **Performance optimization** for resource-constrained environments

Perfect for showcasing skills to potential employers and clients in:
- Web development
- System architecture
- Cloud deployment
- Database design
- User experience design

---

**Service ID**: srv-d2t0hu15pdvs73934od0  
**Live Demo**: https://dashboard-os-frontend.onrender.com  
**API Documentation**: https://dashboard-os-api.onrender.com/api

