import React from "react";
import { Tooltip } from "antd";
import { BarsOutlined } from "@ant-design/icons";

const SampleValues = ({ field }) => {
  const sampleValues = {
    qty: "10, 20, 30",
    price: "$10, $20, $30",
    color: "Yellow, Green, Orange",
    user: "Nikhil, Rutuja, Nishant",
    promo: "True, False",
    anyitem: "Pencil, Pen"
  };

  if(sampleValues.hasOwnProperty(field)) {
    return (
      <Tooltip title={sampleValues[field]}>
        <span>
          <BarsOutlined />
        </span>
      </Tooltip>
    );
  }

  return null
};

export default SampleValues;
