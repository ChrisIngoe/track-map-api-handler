const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const chai = require('chai');
const expect = chai.expect;

const location = {
  timestamp: 1590489797000,
  coords: {
    altitude: 130.3000030517578,
    heading: 255.95541381835938,
    longitude: -0.3262344,
    latitude: 50.3947595,
    speed: 5.421376705169678,
    accuracy: 8.595999717712402,
  },
  deviceId: 'NHD184JH',
};

describe('when inserting a new location into DynamoDB', function () {
  let AWS;
  let putFunc;
  let scriptToTest;

  beforeEach(function () {
    putFunc = sinon.stub();

    AWS = {
      DynamoDB: {
        DocumentClient: sinon.stub().returns({
          put: putFunc,
        }),
      },
    };

    scriptToTest = proxyquire('../index', {
      'aws-sdk': AWS,
    });
  });

  it('ensure tableName is passed to the database', async () => {
    putFunc.withArgs(sinon.match.any).returns({
      promise: () => {},
    });

    await scriptToTest.handler({}, {});
    expect(putFunc.calledOnce).to.be.true;
    expect(putFunc.firstCall.args.length).to.equal(1);
    expect(putFunc.firstCall.args[0].TableName).to.equal('track-map');
  });

  it('ensure location is passed to the database', async () => {
    putFunc.withArgs(sinon.match.any).returns({
      promise: () => {},
    });

    await scriptToTest.handler(location, {});
    expect(putFunc.calledOnce).to.be.true;
    expect(putFunc.firstCall.args.length).to.equal(1);
    expect(putFunc.firstCall.args[0].Item).exist;
    expect(putFunc.firstCall.args[0].Item.timestamp).equals(location.timestamp);
    expect(putFunc.firstCall.args[0].Item.deviceId).equals(location.deviceId);
    expect(putFunc.firstCall.args[0].Item.coords).exist;
    expect(putFunc.firstCall.args[0].Item.coords.altitude).equals(location.coords.altitude);
    expect(putFunc.firstCall.args[0].Item.coords.heading).equals(location.coords.heading);
    expect(putFunc.firstCall.args[0].Item.coords.longitude).equals(location.coords.longitude);
    expect(putFunc.firstCall.args[0].Item.coords.latitude).equals(location.coords.latitude);
    expect(putFunc.firstCall.args[0].Item.coords.speed).equals(location.coords.speed);
    expect(putFunc.firstCall.args[0].Item.coords.accuracy).equals(location.coords.accuracy);
  });

  it('should have a recent locationId', async () => {
    putFunc.withArgs(sinon.match.any).returns({
      promise: () => {},
    });

    await scriptToTest.handler({}, {});
    expect(putFunc.calledOnce).to.be.true;
    expect(putFunc.firstCall.args.length).to.equal(1);
    expect(putFunc.firstCall.args[0].Item).exist;
    expect(putFunc.firstCall.args[0].Item.locationId).is.greaterThan(Date.now() - 1000);
    expect(putFunc.firstCall.args[0].Item.locationId).is.lessThan(Date.now() + 1);
  });
});