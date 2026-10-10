import ChatbotConfig from '../models/ChatbotConfig.js';

// GET /api/config - Get chatbot config for current user
export const getConfig = async (req, res, next) => {
  try {
    let config = await ChatbotConfig.findOne({ userId: req.user._id });
    if (!config) {
      config = await ChatbotConfig.create({ userId: req.user._id });
    }
    res.json({ config });
  } catch (err) {
    next(err);
  }
};

// PUT /api/config - Update chatbot config
export const updateConfig = async (req, res, next) => {
  try {
    const allowedFields = [
      'botName',
      'llmProvider',
      'llmModel',
      'temperature',
      'apiKey',
      'customBaseUrl',
      'systemPromptAddition',
      'responseStyle',
      'useEmoji',
      'language',
      'riskTolerance',
      'focusAreas',
      'showDisclaimer',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const config = await ChatbotConfig.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ message: 'Configuration updated.', config });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/config/reset - Reset config to defaults
export const resetConfig = async (req, res, next) => {
  try {
    await ChatbotConfig.findOneAndDelete({ userId: req.user._id });
    const config = await ChatbotConfig.create({ userId: req.user._id });
    res.json({ message: 'Configuration reset to defaults.', config });
  } catch (err) {
    next(err);
  }
};
