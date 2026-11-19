import { dataset } from '../server/dataset.js';

export default function handler(_req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json(dataset.tenants);
}
