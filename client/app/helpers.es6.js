Template.registerHelper('mePaymentsHasStripeKey', () => {
  const s = Meteor.settings;

  return !!(s && s.public.stripe);
});

Template.registerHelper('mePaymentsHasCartPackage', () => {
  return ME.Payments.mode === 'cart';
});