import express from 'express';
import Pusher from 'pusher';

const router = express.Router();

// POST /api/send-event - Send a test event
router.post('/send-event', async (req, res) => {
  try {
    const { appId, appKey, appSecret, channel, event, data } = req.body;

    if (!appId || !appKey || !appSecret || !channel || !event) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: appId, appKey, appSecret, channel, event' 
      });
    }

    // Create Pusher instance for sending events
    // Use localhost since both services are in the same container
    const pusher = new Pusher({
      appId,
      key: appKey,
      secret: appSecret,
      host: 'localhost',
      port: 6001,
      useTLS: false
    });

    // Send the event
    await pusher.trigger(channel, event, data);

    res.json({ 
      success: true, 
      message: `Event "${event}" sent to channel "${channel}"` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send event' 
    });
  }
});

export default router;
