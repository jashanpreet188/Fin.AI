const express = require('express');
const router = express.Router();
const axios = require('axios');

const ALPHA_VANTAGE_API_KEY = 'LLJX3BUAFZ5VRYU8';

router.get('/search', async (req, res) => {
  try {
    const { ticker } = req.query;
    if (!ticker) {
      return res.status(400).json({ error: 'Ticker symbol is required' });
    }

    console.log(`Searching for ticker: ${ticker}`);

    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    const response = await axios.get(url);
    const data = response.data;

    if (data['Error Message']) {
      console.log(`No data found for ticker: ${ticker}`);
      return res.status(404).json({ error: 'Ticker symbol not found' });
    }

    const companyData = {
      name: data.Name,
      ticker: data.Symbol,
      price: 'N/A', // You'd need to make a separate API call for real-time price
      priceChange: 'N/A',
      date: new Date().toLocaleDateString(),
      website: 'N/A',
      bse: 'N/A',
      nse: 'N/A',
      about: data.Description,
      keyPoints: {
        marketCap: data.MarketCapitalization,
        currentPrice: 'N/A',
        highLow: 'N/A',
        stockPE: data.PERatio,
        bookValue: data.BookValue,
        dividendYield: data.DividendYield,
        roce: 'N/A',
        roe: data.ReturnOnEquityTTM,
        faceValue: 'N/A',
      }
    };

    console.log('Company data fetched successfully:', companyData);
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