# Interview test app for handling crypto-statistics
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

API route can be accessed on (http://localhost:3000/api/crypto?from={}&to={}),
> where:
> > 'from' - required request parameter 'date from', formatted in 'YYYY-mm-dd';

> > 'to' - required request parameter 'date to', formatted in 'YYYY-mm-dd'.
full-formatted request be like:

(http://localhost:3000/api/crypto?from=2021-01-31&to=2021-12-12)

## Learn More

This API allows to set interested cryptoasset by providing three-letter asset's code (default is 'btc'), like 'asset={your three-letter cryptoasset code}', so full-formatted request be like:

(http://localhost:3000/api/crypto?from=2021-01-31&to=2021-12-12&asset=xrp)

Result JSON-object includes these fields:
1. maxDescDays - how many days is the longest bearish (downward) trend within a given date range;
2. maxVolumeInEur - the highest trading volume within provided date range in euros;
3. maxVolumeDate - which date within a given date range had the highest trading volume;
4. whenToBuy - the best day for buying bitcoin (taking into account that Scrooge may already have crypto assets on the request date);
5. whenToSell - the best day for selling the bought bitcoin to maximize profits.
