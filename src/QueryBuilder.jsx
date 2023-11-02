/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useEffect, useState } from "react";
import { Space, Card, Input, Switch, Button, Modal, Spin, Divider } from "antd";
import SelectMultiple from "./SelectMultiple";
import { createPortal } from 'react-dom';
import SampleValues from "./Sample";
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
  const [includeQuerySampleValueProperties, setIncludeQuerySampleValueProperties] = useState([])
  const [excludeQuerySampleValueProperties, setExcludeQuerySampleValueProperties] = useState([])
  const [excludeQuerySampleValuesNode, setExcludeQuerySampleValuesNode] = useState(null)
  const [includeQuerySampleValuesNode, setIncludeQuerySampleValuesNode] = useState(null)
  const [includeNodes, setIncludeNodes] = useState([])
  const [excludeNodes, setExcludeNodes] = useState([])


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

  const getSelectedField = (tree) => {
    // Implement logic to find the selected field from the tree
    // Here, we will look for the selected field in the 'properties' of the first rule.
    if (tree.type === "group" && tree.children1 && tree.children1.length > 0) {
      let rule = tree.children1[0];
      let properties = []
      tree.children1.forEach(element => {
        rule = element
        if (rule && rule.properties && rule.properties.field) {
          properties.push([rule.properties.field, rule.properties.valueType, rule.id])
        }
      });
      return properties
    }
    return [];
  };

  const onChangeInclude = (immutableTree) => {
    setIncludeQueryTree(immutableTree);
    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    setIncludeQuerySampleValueProperties(() => getSelectedField(jsonTree))
    let siblingNode = document.createElement('span');
    setIncludeQuerySampleValuesNode(() => {
      includeQuerySampleValueProperties.forEach((element) =>{
        let parentNodes = document.querySelector(`div[data-id="${element[2]}"]`)
        console.log("parent", parentNodes)
        let spanNode = parentNodes.querySelector('span')
        if (!spanNode) {
          let inputNode = parentNodes.querySelector('input[type="text"]')
          console.log("inputnode",inputNode)
          inputNode.parentNode.appendChild(siblingNode)
          setIncludeNodes((prevValue)=> [...prevValue,createPortal(<SampleValues field={element[0]} />, siblingNode)])
        }
      })
      if(includeNodes != [])
        return includeNodes
      else 
        return null
    })
  };

  const onChangeExclude = (immutableTree) => {
    setExcludeQueryTree(immutableTree);
    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    let siblingNode = document.createElement('span');
    setExcludeQuerySampleValueProperties(() => getSelectedField(jsonTree))
    setExcludeQuerySampleValuesNode(() => {
      excludeQuerySampleValueProperties.forEach((element) =>{
        let parentNodes = document.querySelector(`div[data-id="${element[2]}"]`)
        console.log("parent", parentNodes)
        let spanNode = parentNodes.querySelector('span')
        if (!spanNode) {
          let inputNode = parentNodes.querySelector('input[type="text"]')
          console.log("inputnode",inputNode)
          inputNode.parentNode.appendChild(siblingNode)
          setExcludeNodes((prevValue)=> [...prevValue,createPortal(<SampleValues field={element[0]} />, siblingNode)])
        }
      })
      if(excludeNodes != [])
        return excludeNodes
      else 
        return null
    })
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
        { excludeQuerySampleValuesNode ? 
          excludeQuerySampleValuesNode :
          ""
        }
        { includeQuerySampleValuesNode ?
          includeQuerySampleValuesNode :
          ""
        }
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
              <div onClick={(e) => e.preventDefault()}>
                {showIncludeQueryComponent ? (
                  <div style={{ textAlign: "center" }}>
                    <Divider
                      plain
                      style={{
                        color: "rgb(11, 50, 0)",
                        borderColor: "grey",
                        paddingInline: "10rem",
                      }}
                    >
                      Included in my audience
                    </Divider>
                  </div>
                ) : (
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
                    Include in my audience
                  </Button>
                )}
              </div>
              <div className="include-query">
              {showIncludeQueryComponent && (
                <Query
                  {...config}
                  value={includeQueryTree}
                  onChange={onChangeInclude}
                  renderBuilder={renderBuilder}
                />
              )}
              </div>
              <div onClick={(e) => e.preventDefault()}>
                {showExcludeQueryComponent ? (
                  <Divider
                    plain
                    style={{
                      color: "rgb(53, 1, 1)",
                      borderColor: "grey",
                      paddingInline: "10rem",
                    }}
                  >
                    Excluded in my audience
                  </Divider>
                ) : (
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
                    Exclude in my audience
                  </Button>
                )}
              </div>
              <div className="exclude-query">
              {(showExcludeQueryComponent) && (
                <Query
                  {...config}
                  value={excludeQueryTree}
                  onChange={onChangeExclude}
                  renderBuilder={renderBuilder}
                />
              )}
              </div>
            </Card>
            <div>
              Include Query JsonLogic:{" "}
              <pre>
                {JSON.stringify(QbUtils.jsonLogicFormat(includeQueryTree, config))}
              </pre>
              Exclude Query JsonLogic:{" "}
              <pre>
                {JSON.stringify(QbUtils.jsonLogicFormat(excludeQueryTree, config))}
              </pre>
            </div>
          </Space>
        </Modal>
      </div>
    </>
  );
};

export default DemoQueryBuilder;
