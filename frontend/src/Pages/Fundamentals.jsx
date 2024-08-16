const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');

router.get('/search', async (req, res) => {
  try {
    const { ticker } = req.query;
    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    console.log(`Searching for ticker: ${ticker}`);

    const url = `https://finance.yahoo.com/quote/${encodeURIComponent(ticker)}`;
    console.log(`Company URL: ${url}`);

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Check if the page contains an error message
    const errorMessage = $('[data-test="error-message"]').text();
    if (errorMessage) {
      console.log(`No data found for ticker: ${ticker}`);
      return res.status(404).json({ error: 'Ticker symbol not found' });
    }

    const companyData = {
      name: $('h1').text(),
      ticker: ticker.toUpperCase(),
      price: $('[data-test="qsp-price"]').text(),
      priceChange: $('[data-test="qsp-price-change"]').text(),
      date: new Date().toLocaleDateString(),
      website: $('a[title="Company Profile"]').attr('href'),
      bse: 'N/A',
      nse: 'N/A',
      about: $('[data-test="quote-summary"] p').text(),
      keyPoints: {
        marketCap: $(`[data-test="MARKET_CAP-value"]`).text(),
        currentPrice: $('[data-test="qsp-price"]').text(),
        highLow: $('[data-test="DAYS_RANGE-value"]').text(),
        stockPE: $('[data-test="PE_RATIO-value"]').text(),
        bookValue: $('[data-test="BOOK_VALUE-value"]').text(),
        dividendYield: $('[data-test="DIVIDEND_AND_YIELD-value"]').text().split(' ')[1] || 'N/A',
        roce: 'N/A',
        roe: 'N/A',
        faceValue: 'N/A',
      }
    };

    console.log('Company data scraped successfully');
    res.json(companyData);
  } catch (error) {
    console.error('Error fetching company data:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Failed to fetch company data', 
      details: error.message
    });
  }
});

module.exports = router;