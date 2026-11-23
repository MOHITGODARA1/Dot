const { Router } = require('express');
const { body, query } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const taskController = require('../controllers/task.controller');

const router = Router();
const dateField = (field) => field
  .isString()
  .matches(/^\d{4}-\d{2}-\d{2}$/)
  .withMessage('Date must use YYYY-MM-DD format');

router.use(requireAuth);
router.get('/', [query('date').custom((value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}).withMessage('Enter a valid date as YYYY-MM-DD')], validate, taskController.list);

router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().isLength({ max: 120 }).withMessage('Title is required and must be at most 120 characters'),
    body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
    body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
    dateField(body('taskDate')),
  ],
  validate,
  taskController.create
);

router.patch(
  '/:taskId',
  [
    body('title').optional().isString().trim().notEmpty().isLength({ max: 120 }).withMessage('Title must be at most 120 characters'),
    body('description').optional().isString().trim().isLength({ max: 500 }).withMessage('Description must be at most 500 characters'),
    body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Priority must be Low, Medium, or High'),
    body('status').optional().isIn(['Pending', 'In Progress', 'Completed']).withMessage('Status must be Pending, In Progress, or Completed'),
  ],
  validate,
  taskController.update
);

router.delete('/:taskId', taskController.remove);

module.exports = router;
