const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Task = require('../models/Task');
const { emitTaskUpdate } = require('../config/realtime');

const VALID_PRIORITIES = ['Low', 'Medium', 'High'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];

function validateTaskDate(taskDate) {
  if (typeof taskDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(taskDate)) {
    throw new ApiError(400, 'Date must use YYYY-MM-DD format');
  }
  const [year, month, day] = taskDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new ApiError(400, 'Enter a valid calendar date');
  }
  return taskDate;
}

async function getConnection(userId) {
  const user = await User.findById(userId).select('connectionId');
  if (!user) throw new ApiError(404, 'User not found');
  if (!user.connectionId) throw new ApiError(403, 'Connect with your partner to use shared tasks');

  const connection = await Connection.findById(user.connectionId);
  if (!connection || !connection.members.some((memberId) => memberId.toString() === userId.toString())) {
    throw new ApiError(403, 'A valid partner connection is required');
  }
  return connection;
}

async function withCreators(tasks, memberIds) {
  const creators = await User.find({ _id: { $in: memberIds } }).select('name email avatar').lean();
  const creatorMap = new Map(creators.map((creator) => [creator._id.toString(), creator]));
  return tasks.map((task) => ({
    ...task,
    creator: creatorMap.get(task.userId.toString()) || null,
  }));
}

function emitTaskChange(connection, actorId, action, taskDate, taskId) {
  emitTaskUpdate(connection.members.map((id) => id.toString()), {
    action,
    actorId: actorId.toString(),
    taskDate,
    taskId: taskId?.toString(),
  });
}

async function listForDate(userId, taskDate) {
  validateTaskDate(taskDate);
  const connection = await getConnection(userId);
  const tasks = await Task.find({ connectionId: connection._id, taskDate })
    .sort({ createdAt: 1 })
    .lean();
  return { date: taskDate, tasks: await withCreators(tasks, connection.members) };
}

async function createTask(userId, input) {
  const connection = await getConnection(userId);
  const taskDate = validateTaskDate(input.taskDate);
  const priority = input.priority || 'Medium';
  const status = input.status || 'Pending';
  if (!VALID_PRIORITIES.includes(priority)) throw new ApiError(400, 'Priority must be Low, Medium, or High');
  if (!VALID_STATUSES.includes(status)) throw new ApiError(400, 'Status must be Pending, In Progress, or Completed');

  const task = await Task.create({
    userId,
    connectionId: connection._id,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    priority,
    status,
    taskDate,
    completedAt: status === 'Completed' ? new Date() : null,
  });
  emitTaskChange(connection, userId, 'created', taskDate, task._id);
  const [view] = await withCreators([task.toObject()], connection.members);
  return view;
}

async function updateTask(userId, taskId, input) {
  const connection = await getConnection(userId);
  if (!mongoose.isValidObjectId(taskId)) throw new ApiError(404, 'Task not found');
  const task = await Task.findOne({ _id: taskId, connectionId: connection._id, userId });
  if (!task) throw new ApiError(404, 'Task not found');

  if (input.title !== undefined) task.title = input.title.trim();
  if (input.description !== undefined) task.description = input.description.trim();
  if (input.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(input.priority)) throw new ApiError(400, 'Priority must be Low, Medium, or High');
    task.priority = input.priority;
  }
  if (input.status !== undefined) {
    if (!VALID_STATUSES.includes(input.status)) throw new ApiError(400, 'Status must be Pending, In Progress, or Completed');
    if (input.status === 'Completed' && task.status !== 'Completed') task.completedAt = new Date();
    if (input.status !== 'Completed') task.completedAt = null;
    task.status = input.status;
  }

  await task.save();
  emitTaskChange(connection, userId, 'updated', task.taskDate, task._id);
  const [view] = await withCreators([task.toObject()], connection.members);
  return view;
}

async function deleteTask(userId, taskId) {
  const connection = await getConnection(userId);
  if (!mongoose.isValidObjectId(taskId)) throw new ApiError(404, 'Task not found');
  const task = await Task.findOneAndDelete({ _id: taskId, connectionId: connection._id, userId });
  if (!task) throw new ApiError(404, 'Task not found');
  emitTaskChange(connection, userId, 'deleted', task.taskDate, task._id);
  return { id: task._id };
}

module.exports = { listForDate, createTask, updateTask, deleteTask };
