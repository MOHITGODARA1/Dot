const asyncHandler = require('../utils/asyncHandler');
const connectionService = require('../services/connection.service');

const getStatus = asyncHandler(async (req, res) => {
  const data = await connectionService.getStatus(req.user._id);
  res.status(200).json({ success: true, data });
});

const generateCode = asyncHandler(async (req, res) => {
  const data = await connectionService.generateCode(req.user._id);
  res.status(200).json({ success: true, data });
});

const connect = asyncHandler(async (req, res) => {
  const data = await connectionService.connectWithCode(req.user._id, req.body.code);
  res.status(200).json({ success: true, message: 'You are successfully connected!', data });
});

module.exports = { getStatus, generateCode, connect };
