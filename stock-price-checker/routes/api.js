'use strict';

const fetch = require('node-fetch')

module.exports = function (app) {
  const generalLikes = {
    GOOG: false,
    MSFT: false,
    AAPL: false
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const { stock, like } = req.query

      if (typeof stock === 'string') {
        const data = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`).then(result => result.json())

        const stockData = {
          stock: data.symbol,
          price: data.iexRealtimePrice,
          likes: data.iexRealtimeSize
        }

        if (like === 'true') {
          if (!generalLikes[stock]) {
            generalLikes[stock] = true
            stockData.like = true
          }

          stockData.likes += 1
        }

        res.json({ stockData })
      } else if (typeof stock === 'object') {
        let likes = []
        const stockData = await Promise.all(stock.map(async (item, index) => {
          const data = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${item}/quote`).then(result => result.json())

          const result = {
            stock: data.symbol,
            price: data.iexRealtimePrice,
          }
          likes[index] = data.iexRealtimeSize

          if (like === 'true') {
            if (!generalLikes[item]) {
              generalLikes[item] = true
              result.like = true
            }

            likes[index] += 1
          }
          return result
        }))

        stockData[0].rel_likes = likes[0] - likes[1]
        stockData[1].rel_likes = likes[1] - likes[0]

        res.json({ stockData })
      }
    });
    
};
