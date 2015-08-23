// Get stripe info
(() => {
  const s = Meteor.settings;

  if (s && s.public && s.public.stripe) {
    ME.Payments.stripePublishableKey = s.public.stripe.publishable;
  } else {
    // Grab from file on the server
    Meteor.call('mePayments-getStripeKeys', (e, r) => {
      if (r) {
        ME.Payments.stripePublishableKey = r.publishable;
      }
    });
  }
})();

Meteor.startup(() => {
  if (!ME.Payments.stripePublishableKey) {
    console.error('Stripe publishable key not found!');
  }

  const Payments = ME.Payments;

  // console.log(ME.Payments.mode);
  Payments.A = new Payments.Products(Payments.mode);
});

// ME.Payments.products = [];
ME.Payments.Products = function (mode) {
  check(mode, String);

  this.products = [];
  this.itemSchema = {
    storeId: String,
    productId: String,
    quantity: Number,
    name: String,
    description: String,
    amount: Number
  };
  
  // Cart mode
  this.productDeps = new Tracker.Dependency;

  return this;
};

ME.Payments.Products.prototype.getItems = function () {
  this.productDeps.depend();

  return this.products;
};

ME.Payments.Products.prototype.addItem = function (item) {
  if (!item.productId) {
    _.extend(item, {productId: Random.id()});
  }

  if (!item.quantity) {
    _.extend(item, {quantity: 1});
  }

  // Increment quantity if item already exist in array
  // if () {

  // }

  if (this.mode === 'default' && this.products.length >= 1) {
    return;
  }

  check(item, this.itemSchema);

  let index = 0;

  const containsDuplicateId = !!_.find(this.products, (p) => {
    if (p.productId === item.productId) {
      index = i;
      return true;
    }
  })

  // Just increment the quantity
  if (containsDuplicateId) {
    this.products[index].quantity++;
    return this;
  }

  this.products.push(item);

  this.productDeps.changed();

  return this;
};

/**
* Gets the sum of products
* @param {Object|Array} products
* @return {Number} total
*/
ME.Payments.Products.prototype.getTotal = function () {
  const p = this.products;
  check(p, Match.OneOf(Object, Array));

  let total = 0;

  // A collection
  if (_.isArray(p)) {
    _.each(p, (value, index) => {
      if (value.amount) {
        total += value.amount;
      }
    });
  } else {
    total = p.amount;
  }

  return total;
};

ME.Payments.Products.prototype.receipt = {
  paymentId: null,
  subHandle: null,
  hasReceipt: new ReactiveVar(false),
  checking: new ReactiveVar(false)
};

ME.Payments.Products.prototype.reset = function () {
  this.products = [];
  this.receipt.paymentId = null;
  this.receipt.subHandle = null;
  this.receipt.hasReceipt.set(false);
  this.receipt.checking.set(false);
};

/**
* @constructor
*/
ME.Payments.Stripe = function () {
  this.stripeDeps = new Tracker.Dependency;
  this.secretKey = null;
  this.publishable = null;

  return this;
};

/**
* Writes to settings.json
* @param {String} key
*/
ME.Payments.Stripe.prototype.save = function (publishable, secret) {
  check(publishable, Match.OneOf(String, undefined));
  check(secret, Match.OneOf(String, undefined));

  if (!publishable) {
    publishable = '';
  }

  if (!secret) {
    secret = '';
  }

  console.log(publishable);
  console.log(secret);

  // TODO: CB updates helpers
  Meteor.call('mePayments-saveStripeKey', {publishable, secret});

  return this;
};


/**
* Gets the Stripe secret key from the server if you are the master admin
*/
ME.Payments.Stripe.prototype.getKeys = function (cb) {
  check(cb, Function);

  Meteor.call('mePayments-getStripeKeys', (e, r) => {
    console.log(e || r);
    cb(e, r);
  });

  return;
};