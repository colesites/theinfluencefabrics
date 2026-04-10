export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '82w9eczu'

// See the 'Use API version' documentation for more info:
// https://www.sanity.io/docs/api-versioning
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-04-10'

export const token = process.env.SANITY_API_WRITE_TOKEN
