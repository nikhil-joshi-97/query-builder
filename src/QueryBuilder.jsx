/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useEffect, useState } from "react";
import { Space, Card, Input, Switch, Button, Modal, Spin } from "antd";
import SelectMultiple from "./SelectMultiple";
import {
  Utils as QbUtils,
  Query,
  Builder,
  BasicConfig,
} from "@react-awesome-query-builder/ui";
import "@react-awesome-query-builder/ui/css/styles.css";

const InitialConfig = BasicConfig;

const DemoQueryBuilder = () => {
  const [columnNames, setColumnNames] = useState([]);
  const [config, setConfig] = useState(InitialConfig);
  const [includeQueryTree, setIncludeQueryTree] = useState(null);
  const [excludeQueryTree, setExcludeQueryTree] = useState(null); // Use a state variable for config

  useEffect(() => {
  fetch("http://localhost:3001/get-column-names")
    .then((response) => response.json())
    .then((data) => {
      setColumnNames(data.columnNames);

      // Create dynamic fields and update the config
      const dynamicFields = {};
      for (const columnName of data.columnNames) {
        // Capitalize the first letter of columnName
        const capitalizedColumnName =
          columnName.charAt(0).toUpperCase() + columnName.slice(1);

        dynamicFields[columnName] = {
          label: capitalizedColumnName,
          type: "text", // You can set an appropriate type
        };
      }

      if (
        data.columnNames.includes("email") &&
        data.columnNames.includes("name")
      ) {
        setConfig({
          ...config,
          fields: {
            ...dynamicFields,
            customer: {
              label: "Customer",
              type: "!group",
                subfields: {
                  name: {
                    label: "Name",
                    type: "text",
                  },
                  email: {
                    label: "Email",
                  type: "text",
                },
              },
            },
          },
        });
      } else {
        setConfig({
          ...config,
          fields: {
            ...dynamicFields,
          },
        });
      }
    })
    .catch((error) => {
      console.error(error);
    });
}, []);

  const onChangeInclude = (immutableTree) => {
    setIncludeQueryTree(immutableTree);
    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
  };

  const onChangeExclude = (immutableTree) => {
    setExcludeQueryTree(immutableTree);
    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
  };

  const renderBuilder = (props) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        {columnNames.length > 0 ? (
          <Builder {...props} />
        ) : (
          <p>
            <Spin />
          </p>
        )}
      </div>
    </div>
  );

  const Name = () => <Input placeholder="Name of the Audience Segment" />;
  const Description = () => (
    <Input placeholder="Description of the Audience Segment" />
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [showIncludeQueryComponent, setIncludeQueryComponent] = useState(false);
  const [showExcludeQueryComponent, setExcludeQueryComponent] = useState(false);

  const handleIncludeQuery = () => {
    setIncludeQueryComponent((prevValue) => !prevValue); // Toggle the value
  };

  const handleExcludeQuery = () => {
    setExcludeQueryComponent((prevValue) => !prevValue); // Toggle the value
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "250px",
        }}
      >
        <Button type="primary" onClick={showModal} size="large">
          New Audience Filter
        </Button>
      </div>
      <div>
        <Modal
          title="Create Custom Audience Filter"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          className="custom-modal"
          width={1000}
          maskClosable={false}
          destroyOnClose={true}
        >
          <Space
            direction="vertical"
            size="middle"
            style={{
              display: "flex",
            }}
          >
            <Card size="small">
              <div style={{ display: "flex" }}>
                <div style={{ flex: 1, marginRight: "16px" }}>
                  Name
                  <Name />
                </div>
                <div style={{ flex: 1 }}>
                  Description
                  <Description />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Switch defaultChecked style={{ marginTop: "25px" }} />
                <span style={{ marginTop: "25px", marginLeft: "10px" }}>
                  Display this audience on campaign plan
                </span>
              </div>
              <div>
                <span style={{ display: "flex", marginTop: "25px" }}>
                  Channels
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "5px",
                }}
              >
                <SelectMultiple />
              </div>
              <div>
                <Button
                  style={{
                    marginTop: "25px",
                    textAlign: "center",
                    width: "195px",
                    height: "35px",
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  Compute Audience
                </Button>
              </div>
              <div>
                <Button
                  style={{
                    width: "100%",
                    textAlign: "center",
                    height: "50px",
                    marginTop: "25px",
                    backgroundColor: "rgb(246, 255, 237)",
                  }}
                  onClick={handleIncludeQuery}
                >
                  {showIncludeQueryComponent
                    ? "Include in my audience"
                    : "Include in my audience"}
                </Button>
              </div>
              {showIncludeQueryComponent && (
                <Query
                  {...config}
                  value={includeQueryTree}
                  onChange={onChangeInclude}
                  renderBuilder={renderBuilder}
                />
              )}
              <div onClick={(e) => e.preventDefault()}>
                <Button
                  style={{
                    width: "100%",
                    textAlign: "center",
                    height: "50px",
                    marginTop: "15px",
                    backgroundColor: "rgba(248, 22, 22, 0.05)",
                  }}
                  onClick={handleExcludeQuery}
                >
                  {showExcludeQueryComponent
                    ? "Exclude from my audience"
                    : "Exclude from my audience"}
                </Button>
              </div>
              {showExcludeQueryComponent && (
                <Query
                  {...config}
                  value={excludeQueryTree}
                  onChange={onChangeExclude}
                  renderBuilder={renderBuilder}
                />
              )}
            </Card>
            <div>
              JsonLogic:{" "}
              <pre>
                {JSON.stringify(
                  QbUtils.jsonLogicFormat(includeQueryTree, config)
                )}
              </pre>
            </div>
          </Space>
        </Modal>
      </div>
    </>
  );
};

export default DemoQueryBuilder;
