const express = require("express");
const axios = require("axios");
const router = express.Router();

const AGENT_SERVICE_URL = process.env.AGENT_SERVICE_URL || "http://localhost:5001";

router.post("/recommend", async (req, res) => {
  try {
    const response = await axios.post(
      `${AGENT_SERVICE_URL}/api/agent/recommend`,
      req.body,
      { timeout: 60000 } // agent runs can take a while, especially with retries
    );
    res.json(response.data);
  } catch (err) {
    if (err.response) {
      // agent-service responded with an error status
      return res.status(err.response.status).json(err.response.data);
    }
    // agent-service unreachable (not running, wrong port, network issue)
    res.status(502).json({
      message: "Could not reach agent-service",
      error: err.message,
    });
  }
});

module.exports = router;