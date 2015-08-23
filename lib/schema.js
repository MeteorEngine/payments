var paymentSchema = new SimpleSchema({
  storeId: {
    type: String,
    label: 'Store id',
    optional: false
  },
  userId: {
    type: String,
    label: 'User id',
    optional: false
  },
  quantity: {
    type: Number,
    label: 'Quantity',
    defaultValue: 1,
    optional: false
  },
  amount: {
    type: Number,
    label: 'Amount',
    optional: false
  },
  total: {
    type: Number,
    label: 'Total Amount',
    optional: false
  },
  productId: {
    type: String,
    label: 'Product id',
    optional: true
  },
  shopId: {
    type: String,
    label: 'Shop id',
    optional: true
  },
  paymentInfo: {
    type: Object,
    optional: false,
    blackbox: true
  }
});

ME._Payments.attachSchema(paymentSchema);