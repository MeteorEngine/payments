Template.mePaymentsCheckout.helpers({
  items () {
    return Template.instance().products.getItems();
  },
  loading () {
    return Template.instance().products.receipt.checking.get();
  },
  hasOrder () {
    return Template.instance().products.receipt.hasReceipt.get();
  },
  // hasMultiple () {

  // }
});

Template.mePaymentsCheckout.onCreated(function () {
  this.payments = ME.Payments;
  this.products = this.payments.A;

  // If no products were passed then show an error
  // if (this.products.getItems().length === 0) Router.go('home');

  console.log(this.products.getItems());
});
