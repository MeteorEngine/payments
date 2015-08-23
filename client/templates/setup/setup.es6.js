Template.mePaymentsSetup.onCreated(function () {
  const _this = this;

  this.stripe = new ME.Payments.Stripe();

  ME.lmao = this.stripe;

  this.secret = new ReactiveVar(null);
  this.publishable = new ReactiveVar(null);

  this.stripe.getKeys((e, r) => {
    if (r) {
      _this.secret.set(r.secret);
      _this.publishable.set(r.publishable);
    } else {
      console.error(e.message);
    }
  });
});

Template.mePaymentsSetup.events({
  'input [data-form=stripeKeyPublishable]' (e, t) {
    var key = t.$(e.currentTarget).val();

    t.stripe.save(key, undefined);
  },
  'input [data-form=stripeKeySecret]' (e, t) {
    var key = t.$(e.currentTarget).val();

    t.stripe.save(undefined, key);
  }
});

Template.mePaymentsSetup.helpers({
  stripeKeySecret () {
    const tpl = Template.instance();
    // tpl.stripe.stripeDeps.depend();
    return tpl.secret.get();
  },
  stripeKeyPublishable () {
    const tpl = Template.instance();
    // tpl.stripe.stripeDeps.depend();
    return tpl.publishable.get();
  }
});
