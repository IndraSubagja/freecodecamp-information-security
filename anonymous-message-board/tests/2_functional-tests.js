const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let thread_id
  let reply_id

  test('Creating a new thread: POST request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .post('/api/threads/test')
      .send({
        text: 'test thread',
        delete_password: '1234'
      })
      .end((err, res) => {
        const actual = JSON.parse(res.text)
        thread_id = actual._id

        assert.equal(res.status, 200)
        assert.equal(actual.text, 'test thread')
        assert.equal(actual.delete_password, '1234')
        assert.isNotTrue(actual.reported)
        assert.isArray(actual.replies)
        done()
      })
  })
  
  test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .get('/api/threads/test')
      .end((err, res) => {
        const actual = JSON.parse(res.text)

        assert.equal(res.status, 200)
        assert.isArray(actual)
        done()
      })
  })
  
  test('Reporting a thread: PUT request to /api/threads/{board}', (done) => {
    chai
      .request(server)
      .put('/api/threads/test')
      .send({
        thread_id,
      })
      .end((err, res) => {
        const actual = res.text

        assert.equal(res.status, 200)
        assert.equal(actual, 'success')
        done()
      })
  })
  
  test('Creating a new reply: POST request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .post('/api/replies/test')
      .send({
        thread_id,
        text: 'test reply',
        delete_password: '1234'
      })
      .end((err, res) => {
        const actual = JSON.parse(res.text)
        reply_id = actual._id

        assert.equal(res.status, 200)
        assert.equal(actual.text, 'test reply')
        assert.equal(actual.delete_password, '1234')
        assert.equal(actual.thread_id, thread_id)
        assert.isNotTrue(actual.reported)
        done()
      })
  })
  
  test('Viewing a single thread with all replies: GET request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .get('/api/replies/test')
      .query({
        thread_id,
      })
      .end((err, res) => {
        const actual = JSON.parse(res.text)

        assert.equal(res.status, 200)
        assert.equal(actual.text, 'test thread')
        assert.equal(actual.delete_password, '1234')
        assert.equal(actual.replies[0].thread_id, thread_id)
        assert.equal(actual.replies[0].text, 'test reply')
        assert.equal(actual.replies[0].delete_password, '1234')
        done()
      })
  })

  test('Reporting a reply: PUT request to /api/replies/{board}', (done) => {
    chai
      .request(server)
      .put('/api/replies/test')
      .send({
        thread_id,
        reply_id
      })
      .end((err, res) => {
        const actual = res.text

        assert.equal(res.status, 200)
        assert.equal(actual, 'success')
        done()
      })
  })
  
  test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/replies/test')
      .send({
        thread_id,
        reply_id,
        delete_password: 'wrong'
      })
      .end((err, res) => {
        const actual = res.text

        assert.equal(res.status, 200)
        assert.equal(actual, 'incorrect password')
        done()
      })
  })

  test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/replies/test')
      .send({
        thread_id,
        reply_id,
        delete_password: '1234'
      })
      .end((err, res) => {
        const actual = res.text

        assert.equal(res.status, 200)
        assert.equal(actual, 'success')
        done()
      })
  })

  test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/threads/test')
      .send({
        thread_id,
        delete_password: 'wrong'
      })
      .end((err, res) => {
        const actual = res.text

        assert.equal(res.status, 200)
        assert.equal(actual, 'incorrect password')
        done()
      })
  })
  
  test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', (done) => {
    chai
      .request(server)
      .delete('/api/threads/test')
      .send({
        thread_id,
        delete_password: '1234'
      })
      .end((err, res) => {
        const actual = res.text

        assert.equal(res.status, 200)
        assert.equal(actual, 'success')
        done()
      })
  })
});
