'use strict';

module.exports = function (app, Thread, Reply) {
  
  app.route('/api/threads/:board')
    .post(async(req, res) => {
      const { board } = req.params
      const { text, delete_password } = req.body

      const thread = new Thread({
        board,
        text,
        delete_password
      })

      const newThread = await thread.save()
      res.json(newThread)
    })

    .get(async(req, res) => {
      const { board } = req.params

      const threads = await Thread
                        .find({ board }).limit(10)
                        .populate({
                          path: 'replies',
                          options: {
                            sort: {
                              created_on: -1
                            }
                          }
                        })
                        .sort({ bumped_on: -1 })
                        .slice('replies', 3)

      res.json(threads)
    })

    .delete(async(req, res) => {
      const { board } = req.params
      const { thread_id, delete_password } = req.body

      const result = await Thread.deleteOne({ _id: thread_id, delete_password, board })

      res.send(result.deletedCount ? 'success' : 'incorrect password')
    })

    .put(async(req, res) => {
      const { board } = req.params
      const { thread_id } = req.body

      await Thread.updateOne({ _id: thread_id, board }, { reported: true, bumped_on: new Date() })

      res.send('success')
    });
    
  app.route('/api/replies/:board')
    .post(async(req, res) => {
      const { board } = req.params
      const { thread_id, text, delete_password } = req.body

      const reply = new Reply({
        thread_id,
        text,
        delete_password
      })

      await Thread.updateOne({ _id: thread_id, board }, {
        bumped_on: new Date(),
        $push: { replies: reply }
      })

      const newReply = await reply.save()
      res.json(newReply)
    })

    .get(async(req, res) => {
      const { board } = req.params
      const { thread_id } = req.query

      const thread = await Thread.findOne({ _id: thread_id, board }).populate({
        path: 'replies',
        options: {
          sort: {
            created_on: -1
          }
        }
      })
      res.json(thread)
    })

    .delete(async(req, res) => {
      const { board } = req.params
      const { thread_id, reply_id, delete_password } = req.body

      const result = await Reply.updateOne({ _id: reply_id, thread_id, delete_password }, { text: '[deleted]' })

      await Thread.updateOne({ _id: thread_id, board }, { bumped_on: new Date() })

      res.send(result.n ? 'success' : 'incorrect password')
    })

    .put(async(req, res) => {
      const { board } = req.params
      const { thread_id, reply_id } = req.body

      await Reply.updateOne({ _id: reply_id, thread_id }, { reported: true })

      await Thread.updateOne({ _id: thread_id, board }, { bumped_on: new Date() })

      res.send('success')
    })

};
