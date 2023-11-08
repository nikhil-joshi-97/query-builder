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
    anyitem: "Pencil, Pen",
    gender: "F, M",
    city: "Pune, Pandharpur"
  };

  let fieldValue = field.split("."); 

  if(sampleValues.hasOwnProperty(fieldValue[1])) {
    return (
      <Tooltip title={sampleValues[fieldValue[1]]}>
        <span>
          <BarsOutlined />
        </span>
      </Tooltip>
    );
  }
};

export default SampleValues;
