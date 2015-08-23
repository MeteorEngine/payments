Meteor.publish('mePayments-checkForReciept', (paymentId) => {
  check(paymentId, String);

  const userId = this.userId;

  return ME._Payments.find({
    userId,
    _id: paymentId
  });
});