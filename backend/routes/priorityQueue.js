const express = require('express');
const router = express.Router();
const PriorityQueueService = require('../services/priorityQueueService');

/**
 * GET /api/priority-queue/department/:department
 * Get priority queue for a specific department
 */
router.get('/department/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const { status } = req.query;

    const queue = await PriorityQueueService.getDepartmentQueue(department, status);

    res.json({
      success: true,
      department,
      count: queue.length,
      queue
    });
  } catch (error) {
    console.error('Error fetching department queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department queue',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/department/:department/stats
 * Get queue statistics for a department
 */
router.get('/department/:department/stats', async (req, res) => {
  try {
    const { department } = req.params;

    const stats = await PriorityQueueService.getDepartmentQueueStats(department);

    res.json({
      success: true,
      department,
      stats
    });
  } catch (error) {
    console.error('Error fetching queue stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/all-departments
 * Get all department queues with stats
 */
router.get('/all-departments', async (req, res) => {
  try {
    const queues = await PriorityQueueService.getAllDepartmentQueues();

    res.json({
      success: true,
      count: queues.length,
      queues
    });
  } catch (error) {
    console.error('Error fetching all queues:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all queues',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/department/:department/top
 * Get top N complaints by priority
 */
router.get('/department/:department/top', async (req, res) => {
  try {
    const { department } = req.params;
    const { limit = 10 } = req.query;

    const complaints = await PriorityQueueService.getTopComplaints(
      department,
      parseInt(limit)
    );

    res.json({
      success: true,
      department,
      limit: parseInt(limit),
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Error fetching top complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top complaints',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/department/:department/level/:level
 * Get complaints by priority level
 */
router.get('/department/:department/level/:level', async (req, res) => {
  try {
    const { department, level } = req.params;

    const validLevels = ['critical', 'high', 'medium', 'low'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority level. Must be: critical, high, medium, or low'
      });
    }

    const complaints = await PriorityQueueService.getComplaintsByPriorityLevel(
      department,
      level
    );

    res.json({
      success: true,
      department,
      level,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Error fetching complaints by level:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints by priority level',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/overdue
 * Get overdue complaints
 */
router.get('/overdue', async (req, res) => {
  try {
    const { department } = req.query;

    const complaints = await PriorityQueueService.getOverdueComplaints(department);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Error fetching overdue complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue complaints',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/urgent
 * Get urgent complaints (within 6 hours of SLA)
 */
router.get('/urgent', async (req, res) => {
  try {
    const { department } = req.query;

    const complaints = await PriorityQueueService.getUrgentComplaints(department);

    res.json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Error fetching urgent complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch urgent complaints',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/complaint/:id/breakdown
 * Get priority score breakdown for a complaint
 */
router.get('/complaint/:id/breakdown', async (req, res) => {
  try {
    const { id } = req.params;

    const breakdown = await PriorityQueueService.getPriorityBreakdown(id);

    if (!breakdown) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      breakdown
    });
  } catch (error) {
    console.error('Error fetching priority breakdown:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch priority breakdown',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/complaint/:id/history
 * Get priority score history for a complaint
 */
router.get('/complaint/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const history = await PriorityQueueService.getPriorityHistory(
      id,
      parseInt(limit)
    );

    res.json({
      success: true,
      complaint_id: id,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Error fetching priority history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch priority history',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/analytics
 * Get queue analytics
 */
router.get('/analytics', async (req, res) => {
  try {
    const { department } = req.query;

    const analytics = await PriorityQueueService.getQueueAnalytics(department);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
});

/**
 * GET /api/priority-queue/approaching-sla
 * Get complaints approaching SLA deadline
 */
router.get('/approaching-sla', async (req, res) => {
  try {
    const { hours = 24, department } = req.query;

    const complaints = await PriorityQueueService.getApproachingSLAComplaints(
      parseInt(hours),
      department
    );

    res.json({
      success: true,
      threshold_hours: parseInt(hours),
      count: complaints.length,
      complaints
    });
  } catch (error) {
    console.error('Error fetching approaching SLA complaints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approaching SLA complaints',
      error: error.message
    });
  }
});

/**
 * POST /api/priority-queue/recalculate/:id
 * Manually recalculate priority for a complaint
 */
router.post('/recalculate/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await PriorityQueueService.recalculatePriority(id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.json({
      success: true,
      message: 'Priority recalculated successfully',
      complaint: complaint[0]
    });
  } catch (error) {
    console.error('Error recalculating priority:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate priority',
      error: error.message
    });
  }
});

/**
 * POST /api/priority-queue/update-queue/:department
 * Update queue positions for a department
 */
router.post('/update-queue/:department', async (req, res) => {
  try {
    const { department } = req.params;

    const stats = await PriorityQueueService.updateQueuePositions(department);

    res.json({
      success: true,
      message: 'Queue positions updated successfully',
      stats
    });
  } catch (error) {
    console.error('Error updating queue positions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update queue positions',
      error: error.message
    });
  }
});

module.exports = router;
