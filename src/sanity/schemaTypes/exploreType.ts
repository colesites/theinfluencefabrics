import { Rule } from 'sanity'

export const exploreType = {
  name: 'explore',
  title: 'Explore',
  type: 'document',
  fields: [
    { 
      name: 'title', 
      title: 'Title', 
      type: 'string', 
      validation: (Rule: Rule) => Rule.required() 
    },
    { 
      name: 'content', 
      title: 'Writeup / Story', 
      type: 'text', 
      validation: (Rule: Rule) => Rule.required() 
    },
    { 
      name: 'image', 
      title: 'Image', 
      type: 'image', 
      options: { hotspot: true },
      validation: (Rule: Rule) => Rule.required() 
    },
  ],
}
