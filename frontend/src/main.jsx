import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from '@/store/store'
import './styles/index.css'
import App from './App.jsx'

console.log('🎓 CampusFlow Frontend Initializing...')
const rootElement = document.getElementById('root')
console.log('Root element found:', rootElement)

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <Provider store={store}>
          <App />
        </Provider>
      </StrictMode>,
    )
    console.log('✅ React rendered successfully')
  } catch (error) {
    console.error('❌ React render error:', error)
  }
} else {
  console.error('❌ Root element not found!')
}
