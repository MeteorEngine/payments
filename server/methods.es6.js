ME.Payments.configFile = {
  name: 'config.json',
  path: null
};

// Get project root
function getProjectRoot () {
  if (!ME.Payments.projectRoot) {
    const path = Npm.require('path');

    let root = process.cwd().split(path.sep);

    // console.log(root);
    let pathLength = root.length - 5;

    // We got our project root - May need to tweak for windows
    root = _.first(root, pathLength);

    // Convert array of directories back into a string
    root = root.join(path.sep);

    // console.log(root);
    ME.Payments.projectRoot = root;
  }

  return ME.Payments.projectRoot;
}

function getFilePath () {
  const configFile = ME.Payments.configFile;
  let filePath = configFile.path;

  if (!filePath) {
    const path = Npm.require('path');
    const root = getProjectRoot();
    filePath = path.join(root, configFile.name);
    configFile.path = filePath;
  }

  return filePath;
}

function getConfigFile () {
  const shelljs = Npm.require('shelljs');
  const filePath = getFilePath();

  if (!shelljs.test('-f', filePath)) throw new Meteor.Error('File doesn\'t exist');

  return shelljs.cat(filePath);
}

/**
* @returns {Object} publishable & secret keys
*/
function getStripeKeys () {
  let keys;

  // Attempt to get keys via Meteor.settings
  const s = Meteor.settings;
  console.log(s);
  const publishable = s && s.public && s.public.stripe && s.public.stripe.publishable;
  const secret = s && s.stripe && s.stripe && s.stripe.secret;

  keys = {
    publishable,
    secret
  };

  // console.log(keys);

  // Get keys via file
  if (!keys.publishable && !keys.secret) {
    let file = getConfigFile();

    file = JSON.parse(file);
    let publishable = file && file.public && file.public.stripe && file.public.stripe.publishable;
    let secret = file && file.stripe && file.stripe.secret;

    keys = {
      publishable,
      secret
    };
  }

  return keys;
}

function isMaster (userId = Meteor.userId()) {
  check(userId, String);

  return Roles.userIsInRole(userId, 'MasterShopAdmin');
}

Meteor.methods({
  'mePayments-chargeCard' (options) {
    check(options, {
      info: {
        total: Number,
        currency: String,
        storeId: String,
        paymentId: String,
        products: Match.OneOf(Object, Array, undefined) // We don't need the product info, but just in case we do, it's here
      },
      token: {
        card: Object,
        client_ip: String,
        created: Number,
        email: String,
        id: String,
        livemode: Boolean,
        object: String,
        type: String,
        used: Boolean,
        verification_allowed: Boolean
      }
    });

    // TODO: Change how we get the Stripe Secret Key - ideally from Meteor.settings
    const userId = Meteor.userId();

    const secretKey = getStripeKeys().secret;

    const Stripe = StripeAPI(secretKey);

    const charge = function (c) {
      console.log(c);
      // Save payment info to package scoped collection
      ME._Payments.insert({
        userId,
        _id: options.info.paymentId,
        storeId: options.info.storeId,
        total: options.info.total,
        amount: c.amount,
        paymentInfo: c
      });
    };

    const paymentError = function (e) {
      console.log(e.message);
      _.extend(e, {paymentId: options.info.paymentId});

      //  To allow users to know if there is something wrong with their payments
      ME._PaymentErrors.insert(e);
    };

    Stripe.charges.create({
      amount: options.info.total,
      currency: options.info.currency,
      source: options.token.id,
      description: options.token.card.name
    })
      .then(Meteor.bindEnvironment(charge))
      .catch(Meteor.bindEnvironment(paymentError));

    // We passed all synchronous code, so let user know to subscribe to receipt publication to see if payment was successful
    return true;
  },
  'mePayments-saveStripeKey' (keys) {
    check(keys, {
      publishable: String,
      secret: String
    });

    if (!isMaster()) {
      throw new Meteor.Error('not-authorized');
    }

    // console.log(keys.publishable);
    // console.log(keys.secret);

    const shelljs = Npm.require('shelljs');
    const cat = shelljs.cat;
    const test = shelljs.test;
    const sed = shelljs.sed;

    // const payments = ME.Payments;
    const filePath = getFilePath();

    // -- Write to config.json - Figure out how to write to specific line instead of writing a whole new file each time --

    // Check if it exists first - create if it doesn't
    if (!test('-f', filePath)) {
      const newConfig = {
        public: {
          stripe: {
            publishable: keys.publishable
          }
        },
        stripe: {
          secret: keys.secret
        }
      };

      JSON.stringify(newConfig).to(filePath);
    } else {
      // Write over keys
      const file = getConfigFile();

      const regex = {
        publishable: /"[\s\w]*"(?=}},"stripe)/,
        secret: /"[\s\w]*"(?=}}$)/ // Selects quotation marks at the end of file
      };

      // Only write to key that has been sent as param
      if (keys.publishable) {
        // Just overwrite key
        const a = sed('-i', regex.publishable, '\"' + keys.publishable + '\"', filePath);
        return console.log(a);
      }

      if (keys.secret) {
        // Just overwrite key
        const a = sed('-i', regex.secret, '\"' + keys.secret + '\"', filePath);
        return console.log(a);
      }
    }
  },
  'mePayments-getStripeKeys' () {
    // TODO: Add security
    if (!isMaster()) {
      throw new Meteor.Error('not-authorized');
    }

    return getStripeKeys();
  }
})