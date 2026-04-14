import { Rule } from 'sanity'

export const productType = {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    { name: 'name', title: 'Name', type: 'string', validation: (Rule: Rule) => Rule.required() },
    { name: 'subtitle', title: 'Subtitle', type: 'string', description: 'E.g., Premium 6-yard bundle' },
    { name: 'description', title: 'Description', type: 'text' },
    { name: 'originalPrice', title: 'Original Price', type: 'number', validation: (Rule: Rule) => Rule.required() },
    { name: 'price', title: 'Discount Price (Optional)', type: 'number', description: 'If set, this will be shown as the current selling price with the Original Price struck through.' },
    { name: 'collection', title: 'Collection', type: 'string', validation: (Rule: Rule) => Rule.required() },
    { name: 'image', title: 'Main Image', type: 'image', options: { hotspot: true } },
    { 
      name: 'gallery', 
      title: 'Gallery Images', 
      type: 'array', 
      of: [{ type: 'image' }] 
    },
    {
      name: 'variants',
      title: 'Variants',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', title: 'Size', type: 'string' },
            { name: 'color', title: 'Color Name', type: 'string' },
            { name: 'colorValue', title: 'Color Hex/Palette', type: 'string', description: 'E.g. #000000 or indigo' },
            { name: 'yards', title: 'Yards', type: 'string', description: 'E.g. 6-Yards, 10-Yards' },
            { name: 'quantity', title: 'Quantity in Stock', type: 'number', validation: (Rule: Rule) => Rule.min(0) },
            { name: 'image', title: 'Variant Image', type: 'image', options: { hotspot: true } }
          ]
        }
      ]
    },
  ],
}
