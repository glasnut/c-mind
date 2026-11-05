import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ListsProvider } from './context/ListsContext.jsx'
import { productsService } from './services/products/index.js'
import './styles/base.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ListsProvider getProduct={productsService.getById}>
          <App />
        </ListsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
