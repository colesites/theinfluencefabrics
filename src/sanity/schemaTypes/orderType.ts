import { Rule } from 'sanity'

export const orderType = {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (Rule: Rule) => Rule.required(),
    },
    {
      name: 'customer',
      title: 'Customer Details',
      type: 'object',
      fields: [
        { name: 'name', type: 'string' },
        { name: 'email', type: 'string' },
        { name: 'phone', type: 'string' },
        { name: 'address', type: 'text' },
      ],
    },
    {
      name: 'customerUserId',
      title: 'Authenticated Customer User ID',
      type: 'string',
      description: 'Present only when the checkout was done by a signed-in user.',
    },
    {
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productId', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'price', type: 'number' },
            { name: 'quantity', type: 'number' },
            { name: 'size', type: 'string' },
            { name: 'color', type: 'string' },
          ],
        },
      ],
    },
    {
      name: 'totalPrice',
      title: 'Total Price',
      type: 'number',
    },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      initialValue: 'pending',
    },
    {
      name: 'paymentReference',
      title: 'Payment Reference',
      type: 'string',
    },
    {
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          { title: 'Paystack Secure', value: 'paystack' },
          { title: 'Bank Transfer', value: 'transfer' },
        ],
      },
      initialValue: 'paystack',
    },
    {
      name: 'receiptImage',
      title: 'Transfer Receipt Image',
      type: 'image',
      options: { hotspot: true },
    },
  ],
}
