import React from 'react';
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import * as App from './App.js';
import './styles/main.css'

const root = createRoot(document.getElementById('root'));

const router = createBrowserRouter([
  { path: '/', element: <App.Nav />},
  { path: '/configuration', element: <App.Builder /> },
  { path: '/upload', element: <App.Upload /> },
  { path: '/admin', element: <App.Admin />},
  { path: '/combine', element: <App.Combine />},
  { path: '/e/:id/:ver', element: <App.Experiment />},
  { path: '/login', element: <App.LogIn />},
  { path: '/modify', element: <App.ExpSelect />},
  { path: '/modify/:id', element: <App.Builder />}
])

root.render(
  <RouterProvider router={router} />
);