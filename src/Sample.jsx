import React from "react";
import { Tooltip } from "antd";
import { BarsOutlined } from "@ant-design/icons";

const SampleValues = ({ field }) => {
  const sampleValues = {
    qty: "10, 20, 30",
    price: "$10, $20, $30",
    color: "Yellow, Green, Orange",
    name: "Nikhil, Rutuja, Nishant",
    promo: "True, False",
    anyitem: "Pencil, Pen"
  };

  return (
    <Tooltip title={sampleValues[field]}>
      <span>
        Sample Values: <BarsOutlined />
      </span>
    </Tooltip>
  );
};

export default SampleValues;
