Template.mePaymentsPurchase.onCreated(function () {
  this.products = ME.Payments.A;
  // console.log(this.products);
});

Template.mePaymentsPurchase.events({
  'click' (e, t) {
    //  Get info from template or a defined collection

    //  Single product
    const items = t.products.getItems();
    const {name, description} = items[0];
    let {amount} = items[0];
    let total = amount;
    console.log('Purchasing product');

    //  Multi-product
    if (t.products.getItems().length > 1) {
      total = t.products.getTotal(items);

      amount = total;
    }

    // Generate random id that will let us track if our payment succeeded
    t.products.receipt.paymentId = Random.id(30);

    const publishableKey = ME.Payments.stripePublishableKey;

    StripeCheckout.open({
      name,
      description,
      amount,
      key: publishableKey,
      panelLabel: 'Pay Now',
      token (_t) {
        //  TODO: Allow currency to be dynamic based on shop settings
        const currency = 'usd';

        let options = {
          info: {
            total,
            currency,
            products: items,
            paymentId: t.products.receipt.paymentId,
            storeId: items[0].storeId,
          },
          token: _t
        };

        console.log(_t);

        t.products.receipt.checking.set(true);
        Meteor.call('mePayments-chargeCard', options, (e, r) => {
          // This function will be called within a Meteor.call() context so I need to
          // reference this again
          const receipt = t.products.receipt;

          if (!receipt.paymentId) throw new Error('Payment id not found');

          if (r) {
            const selector = {
              _id: receipt.paymentId,
              userId: Meteor.userId()
            };

            Tracker.autorun(c => {
              receipt.subHandle = Meteor.subscribe('mePayments-checkForReciept', receipt.paymentId);

              if (!receipt.subHandle.ready()) return;

              // Display receipt if found
              if (ME._Payments.find(selector).count() > 0) {

                const info = ME._Payments.findOne(selector);
                receipt.name = info.paymentInfo.source.name;
                receipt.total = info.total;

                receipt.subHandle.stop();
                receipt.hasReceipt.set(true);
                c.stop();
              }

              receipt.checking.set(false);
            });
          }
        });
      }
    });
  }
});
