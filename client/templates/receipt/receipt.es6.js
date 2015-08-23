Template.mePaymentsReceipt.onCreated(function () {
  console.log('receipt created');
  this.products = ME.Payments.A;
  this.receipt = this.products.receipt;

  this.name = this.receipt.name;

  this.total = this.receipt.total;

  this.items = ME.Payments.A.getItems();
});

Template.mePaymentsReceipt.helpers({
  name () {
    return Template.instance().name;
  },
  items () {
    return Template.instance().items;
  },
  total () {
    return Template.instance().total;
  }
});

Template.mePaymentsReceipt.onDestroyed(function () {
  console.log('receipt destroyed');
  // Clean up variables
  this.products.reset();
});