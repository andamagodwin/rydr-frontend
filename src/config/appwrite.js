import { Client, Account, Databases } from 'appwrite'

// Appwrite configuration
const client = new Client()

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1') // Your Appwrite Endpoint
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID) // Your project ID

// Initialize services
export const account = new Account(client)
export const databases = new Databases(client)

export { client }

// Database and Collection IDs (to be configured later)
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID
export const RIDES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_RIDES_COLLECTION_ID
