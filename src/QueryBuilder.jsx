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
  const [includeQuerySampleValueProperties, setIncludeQuerySampleValueProperties] = useState({});
  const [excludeQuerySampleValueProperties, setExcludeQuerySampleValueProperties,] = useState({});
  const [excludeQuerySampleValuesNode, setExcludeQuerySampleValuesNode] = useState({});
  const [includeQuerySampleValuesNode, setIncludeQuerySampleValuesNode] = useState({});

  useEffect(() => {
    fetch("http://localhost:3001/get-table-schema")
      .then((response) => response.json())
      .then((data) => {
        const schema = data.schema;
        const columnNames = schema.fields.map((field) => field.name);
        setColumnNames(columnNames);

        // Create dynamic fields and update the config
        const dynamicFields = {};
        for (const field of schema.fields) {
          const fieldConfig = {
            label: field.name,
            type: "text",
          };
  
          // If the field is a struct, add subfields
          if (field.type === 'RECORD') {
            fieldConfig.type = "!group";
            fieldConfig.subfields = {};
            for (const subfield of field.fields) {
              fieldConfig.subfields[subfield.name] = {
                label: subfield.name,
                    type: "text",
                  };
            }
          }
  
          dynamicFields[field.name] = fieldConfig;
        }
  
          setConfig({ ...config, fields: dynamicFields });
              })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleDelete = (parentNodes, key, dictionary, sampleValueProperties) => {
    let buttons = parentNodes.querySelectorAll('button')
    buttons.forEach(deleteButton => {
      if (deleteButton.textContent === 'Delete') {
        deleteButton.addEventListener('click', (e) => {
          e.preventDefault()
          let spanNodes = parentNodes.querySelector(`span`)
          if(spanNodes) {
            dictionary[key] = undefined;
            sampleValueProperties[key] = undefined;
          }
        });
      };
    })
    return [dictionary, sampleValueProperties];
  }

  const handleGroupDelete = (dictionary, tree, sampleValueProperties) => {
    let parentDiv = document.getElementsByClassName("query-builder qb-lite")
    Array.from(parentDiv).forEach(div => {
      let buttons = div.querySelectorAll('button')
      buttons.forEach(button => {
        if(button.textContent === 'Delete') {
          if(button.parentElement.className === "group--actions group--actions--tr") {
            button.addEventListener('click', () => {
              if(button.parentNode.parentNode.parentNode.parentNode) {
                let parentDivs =  button.parentNode.parentNode.parentNode.getElementsByClassName("group rule_group group-or-rule")
                console.log(parentDivs)
                Array.from(parentDivs).forEach((singleDiv)=> {
                  let id = singleDiv.getAttribute(`data-id`)
                  if(id) {
                    [dictionary, sampleValueProperties] = deleteGroup(dictionary, tree, sampleValueProperties, id)
                  }
                })
              }
            })
          }
        }
      });
    });
    return [dictionary, sampleValueProperties];
  }
  
  const deleteGroup = (dictionary, tree, sampleValueProperties, id) => {
    if (tree.type === "group" && tree.children1 && tree.children1.length > 0) {
      tree.children1.forEach((element) => {
        if (element.type === "rule_group" && element.children1 && element.children1.length > 0) {
          console.log("id",element)
          if (element.id === id) {
            element.children1.forEach((element2) => {
              console.log("4",id)
              console.log("5",element2.id)
                console.log("delete",id)
                sampleValueProperties[element2.id] = undefined;
                dictionary[element2.id] = undefined;
            })
          }
        }
        if(element.type === 'group' && element.children1 && element.children1.length > 0) {
          [dictionary, sampleValueProperties] = deleteGroup(dictionary, element, sampleValueProperties, id);
        } 
      });
    }
    return [dictionary, sampleValueProperties];
  }

  const getSelectedField = (tree, sampleValueProperties) => {
    if (tree.type === "group" && tree.children1 && tree.children1.length > 0) {
      let subTree = tree.children1
      subTree.forEach((element) => {
        if (element.type === "rule_group" && element.children1 && element.children1.length > 0) {
          let children = element.children1
          children.forEach((element2) => {
            if (element2 && element2.type === 'rule' && element2.properties && element2.properties.field) {
              sampleValueProperties[element2.id] = [element2.properties.field, element2.properties.valueType]
            }
          })
        }
        if(element.type === 'group' && element.children1 && element.children1.length > 0) {
          sampleValueProperties = getSelectedField(element, sampleValueProperties);
        } 
      });
      return sampleValueProperties;
    }
    return {};
  };

  const onChangeInclude = (immutableTree) => {
    setIncludeQueryTree(immutableTree);
    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    setIncludeQuerySampleValueProperties(() => getSelectedField(jsonTree, includeQuerySampleValueProperties));
    setIncludeQuerySampleValuesNode((prevValue) => {
      let siblingNode = document.createElement("span");
      console.log("include",includeQuerySampleValueProperties)
      Object.entries(includeQuerySampleValueProperties).forEach(([key, value]) => {
        if (includeQuerySampleValueProperties[key]) {
          let parentNodes = document.querySelector(`div[data-id="${key}"]`);
          let spanNode = parentNodes.querySelector('span')
          if (!spanNode){
            siblingNode.classList.add(`${key}`);
            let inputNode = parentNodes.querySelector('input[type="text"]')
            inputNode.parentNode.appendChild(siblingNode)
            prevValue[key] = createPortal(<SampleValues field={value[0]} />, siblingNode);
          }
          else if ((spanNode.className === `${key}`) && prevValue.hasOwnProperty(key)){
            siblingNode.classList.add(`${key}`);
            let inputNode = parentNodes.querySelector('input[type="text"]')
            inputNode.parentNode.appendChild(siblingNode)
            prevValue[key] = createPortal(<SampleValues field={value[0]} />, siblingNode);
          }
          let groupDeleteResult = handleGroupDelete(prevValue, jsonTree, includeQuerySampleValueProperties)
          prevValue = groupDeleteResult[0]
          setIncludeQuerySampleValueProperties(() => groupDeleteResult[1])
          let deleteResult = handleDelete(parentNodes, key, prevValue, includeQuerySampleValueProperties)
          prevValue = deleteResult[0]
          setIncludeQuerySampleValueProperties(() => deleteResult[1])
        }
      });
      console.log("prevValue",prevValue)
      return prevValue
    });
  };

  const onChangeExclude = (immutableTree) => {
    setExcludeQueryTree(immutableTree);
    const jsonTree = QbUtils.getTree(immutableTree);
    console.log(jsonTree);
    setExcludeQuerySampleValueProperties(() => getSelectedField(jsonTree, excludeQuerySampleValueProperties));
    setExcludeQuerySampleValuesNode((prevValue) => {
      let siblingNode = document.createElement("span");
      Object.entries(excludeQuerySampleValueProperties).forEach(([key, value]) => {
        if (excludeQuerySampleValueProperties[key]) {
          let parentNodes = document.querySelector(`div[data-id="${key}"]`);
          let spanNode = parentNodes.querySelector('span')
          if (!spanNode){
            siblingNode.classList.add(`${key}`);
            let inputNode = parentNodes.querySelector('input[type="text"]')
            inputNode.parentNode.appendChild(siblingNode)
            prevValue[key] = createPortal(<SampleValues field={value[0]} />, siblingNode);
          }
          else if ((spanNode.className === `${key}`) && prevValue.hasOwnProperty(key)){
            siblingNode.classList.add(`${key}`);
            let inputNode = parentNodes.querySelector('input[type="text"]')
            inputNode.parentNode.appendChild(siblingNode)
            prevValue[key] = createPortal(<SampleValues field={value[0]} />, siblingNode);
          }
          let groupDeleteResult = handleGroupDelete(prevValue, jsonTree, excludeQuerySampleValueProperties)
          prevValue = groupDeleteResult[0]
          setExcludeQuerySampleValueProperties(() => groupDeleteResult[1])
          let deleteResult = handleDelete(parentNodes, key, prevValue, excludeQuerySampleValueProperties)
          prevValue = deleteResult[0]
          setExcludeQuerySampleValueProperties(() => deleteResult[1])
        }
      });
      return prevValue
    });
  };

  const includeRenderBuilder = (props) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        {columnNames.length > 0 ? (
          <Builder {...props} />
        ) : (
          <p>
            <Spin />
          </p>
        )}
        {includeQuerySampleValuesNode ? Object.values(includeQuerySampleValuesNode) : ""}
      </div>
    </div>
  );

  const excludeRenderBuilder = (props) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        {columnNames.length > 0 ? (
          <Builder {...props} />
        ) : (
          <p>
            <Spin />
          </p>
        )}
        {excludeQuerySampleValuesNode ? Object.values(excludeQuerySampleValuesNode) : ""}
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
                    renderBuilder={includeRenderBuilder}
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
                    renderBuilder={excludeRenderBuilder}
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
