const deploymentCompletedHandler = require("./deploymentCompletedHandler");
const getStagingUserStoriesHandler = require("./getStagingUserStoriesHandler");
const pullRequestCommentsHandler = require("./pullRequestCommentsHandler");
const subscribeHandlers = require("./subscribeHandlers");
const unsubscribeHandlers = require("./unsubscribeHandlers");
const workItemsCreatedHandler = require("./workItemsCreatedHandler");
const userStoryChangedHandler = require("./userStoryChangedHandler");

module.exports = {
  deploymentCompletedHandler,
  getStagingUserStoriesHandler,
  pullRequestCommentsHandler,
  subscribeHandlers,
  unsubscribeHandlers,
  userStoryChangedHandler,
  workItemsCreatedHandler,
};
