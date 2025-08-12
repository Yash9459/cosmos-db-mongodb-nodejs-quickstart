import express from 'express';
const app = express();
app.get('/', (_,res)=>res.send('OK'));
app.get('/health', (_,res)=>res.json({status:'healthy'}));
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => console.log(`API listening on ${port}`));
