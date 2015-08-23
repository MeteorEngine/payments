Template.mePaymentsBuyNow.onCreated(function () {
});

Template.mePaymentsBuyNow.events({
  'click' (e, t) {
    e.preventDefault();

    let product = Template.currentData();

    ME.Payments.A.addItem(product);

    if (ME.Payments.mode === 'cart') {
      console.log('Added ' + product.name + ' to your cart!');
    } else {
      Router.go('checkout');
    }
  }
});

Template.mePaymentsBuyNow.helpers({
  buttonText () {
    return ME.Payments.mode === 'cart' && 'Add to cart' || 'Buy now';
  }
});