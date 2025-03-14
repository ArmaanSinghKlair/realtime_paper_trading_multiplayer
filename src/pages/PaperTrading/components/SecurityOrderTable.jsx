import React from "react";
import { Table } from "react-bootstrap";

const SecurityOrderTable = () => {
  return <Table hover className="app-table my-0">
  <thead>
    <tr>
      <th>Symbol</th>
      <th>Side</th>
      <th>Qty</th>
      <th>Fill Price</th>
      <th>Status</th>
      <th>Placing Time</th>
      <th>Order ID</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>COINBASE:ETHUSD</td>
      <td className="text-primary">Buy</td>
      <td>0.75</td>
      <td>2,220.21</td>
      <td className="text-success">Filled</td>
      <td>{new Date().toISOString()}</td>
      <td>{new Date().valueOf()}</td>
    </tr>
    <tr>
    <td>COINBASE:ETHUSD</td>
      <td className="text-danger">Sell</td>
      <td>0.75</td>
      <td>2,220.39</td>
      <td className="text-danger">Rejected</td>
      <td>{new Date().toISOString()}</td>
      <td>{new Date().valueOf()}</td>
    </tr>
  </tbody>
</Table>;
};

export default SecurityOrderTable;
