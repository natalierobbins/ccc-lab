import React from 'react';
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import * as App from './App.js';
import './styles/main.css'

const root = createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  { path: '/', element: <App.Builder /> },
])

root.render(
  <RouterProvider router={router} />
);