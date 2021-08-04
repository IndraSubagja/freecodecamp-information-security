const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function (req, res) {
        const actual = JSON.parse(res.text)
        const expected = { stockData: {
          stock: "GOOG",
          price: 2725.57,
          likes: 1
        }}
        assert.equal(res.status, 200)
        assert.deepEqual(actual, expected)
        done()
      })
  })

  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function (req, res) {
        const actual = JSON.parse(res.text)
        const expected = { stockData: {
          stock: "GOOG",
          price: 2725.57,
          likes: 2,
          like: true
        }}
        assert.equal(res.status, 200)
        assert.deepEqual(actual, expected)
        done()
      })
  })

  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function (req, res) {
        const actual = JSON.parse(res.text)
        const expected = { stockData: {
          stock: "GOOG",
          price: 2725.57,
          likes: 2,
        }}
        assert.equal(res.status, 200)
        assert.deepEqual(actual, expected)
        done()
      })
  })

  test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=AAPL&stock=MSFT')
      .end(function (req, res) {
        const actual = JSON.parse(res.text)
        const expected = { stockData: [
          {
            stock: "AAPL",
            price: 146.85,
            rel_likes: 0
          },
          {
            stock: "MSFT",
            price: 286.93,
            rel_likes: 0
          }
        ]}
        assert.equal(res.status, 200)
        assert.deepEqual(actual, expected)
        done()
      })
  })

  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices?stock=AAPL&stock=MSFT&like=true')
      .end(function (req, res) {
        const actual = JSON.parse(res.text)
        const expected = { stockData: [
          {
            stock: "AAPL",
            price: 146.85,
            rel_likes: 0,
            like: true
          },
          {
            stock: "MSFT",
            price: 286.93,
            rel_likes: 0,
            like: true
            
          }
        ]}
        assert.equal(res.status, 200)
        assert.deepEqual(actual, expected)
        done()
      })
  })
});
