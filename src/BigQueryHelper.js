const express = require("express");
const { BigQuery } = require("@google-cloud/bigquery");
const cors = require("cors");

const app = express();

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "/Users/pst-macair-23b/Downloads/agile-apex-401012-a6e230542a0a.json";

// Configure BigQuery client
const bigquery = new BigQuery();

app.use(cors());

// Define your dataset and table
const datasetId = 'latest';
const tableId = 'user';

// Get the schema of the table
async function getTableSchema() {
  const dataset = bigquery.dataset(datasetId);
  const table = dataset.table(tableId);
  const [metadata] = await table.getMetadata();
  return metadata.schema;
}

// Define your API endpoint to return the schema
app.get('/get-table-schema', async (req, res) => {
  try {
    const schema = await getTableSchema();
    res.json({ schema });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch table schema' });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
