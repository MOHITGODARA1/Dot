const asyncHandler = require('../utils/asyncHandler');
const taskService = require('../services/task.service');

const list = asyncHandler(async (req, res) => {
  const data = await taskService.listForDate(req.user._id, req.query.date);
  res.status(200).json({ success: true, data });
});

const create = asyncHandler(async (req, res) => {
  const data = await taskService.createTask(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Task created', data });
});

const update = asyncHandler(async (req, res) => {
  const data = await taskService.updateTask(req.user._id, req.params.taskId, req.body);
  res.status(200).json({ success: true, message: 'Task updated', data });
});

const remove = asyncHandler(async (req, res) => {
  const data = await taskService.deleteTask(req.user._id, req.params.taskId);
  res.status(200).json({ success: true, message: 'Task deleted', data });
});

module.exports = { list, create, update, remove };
