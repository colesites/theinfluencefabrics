import { Rule } from 'sanity'

export const testimonialType = {
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    {
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'product' }],
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'userName',
      title: 'User Name',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule: Rule) => Rule.required().min(1).max(5),
    },
    {
      name: 'comment',
      title: 'Comment',
      type: 'text',
      validation: (Rule: Rule) => Rule.required().min(3).max(800),
    },
  ],
}
