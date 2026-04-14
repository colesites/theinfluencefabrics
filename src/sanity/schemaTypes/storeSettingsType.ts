import { defineField, defineType } from 'sanity'

export const storeSettingsType = defineType({
  name: 'storeSettings',
  title: 'Store Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'shippingAdoEkiti',
      title: 'Shipping Cost (Ado-Ekiti)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
      initialValue: 2000,
    }),
    defineField({
      name: 'shippingEkitiState',
      title: 'Shipping Cost (Ekiti State)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
      initialValue: 4000,
    }),
    defineField({
      name: 'shippingOutsideEkiti',
      title: 'Shipping Cost (Outside Ekiti)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
      initialValue: 8000,
    }),
    defineField({
      name: 'bankName',
      title: 'Bank Name',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'accountName',
      title: 'Account Name',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'accountNumber',
      title: 'Account Number',
      type: 'string',
      initialValue: '',
    }),
  ],
})
