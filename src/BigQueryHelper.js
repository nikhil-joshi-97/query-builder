const express = require("express");
const { BigQuery } = require("@google-cloud/bigquery");
const cors = require("cors");

const app = express();

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "/Users/pst-macair-23b/Downloads/agile-apex-401012-a6e230542a0a.json";

// Configure BigQuery client
const bigquery = new BigQuery();

app.use(cors());

app.get("/get-column-names", async (req, res) => {
  try {
    const datasetId = "latest";
    const tableId = "user";
    const query = `
      SELECT column_name
      FROM agile-apex-401012.${datasetId}.INFORMATION_SCHEMA.COLUMNS
      WHERE table_name = '${tableId}'
    `;
    const options = {
      query: query,
      location: "US", // Adjust the location as needed
    };

    const [job] = await bigquery.createQueryJob(options);
    const [rows] = await job.getQueryResults();

    const columnNames = rows.map((row) => row.column_name);

    res.json({ columnNames }); // Send the column names as JSON response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
