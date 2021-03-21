const BOT_COMMANDS = [
  {
    command: "subscribe_to_work_items_created",
    description: `оповещения о созданных work items Нептуна`,
  },
  {
    command: "subscribe_to_us_transitions",
    description: `оповещения о переходах US staging->closed на релизной доске`,
  },
  {
    command: "subscribe_to_pr_comments",
    description: `оповещения о комментариях к пулл реквестам`,
  },
  {
    command: "unsubscribe_from_w_i_created",
    description: `отписаться от оповещений о созданных work items Нептуна`,
  },
  {
    command: "unsubscribe_from_us_transitions",
    description: `отписаться от оповещений о переходах US staging->closed на релизной доске`,
  },
  {
    command: "unsubscribe_from_pr_comments",
    description: `отписаться от оповещений о комментариях к пулл реквестам`,
  },
  {
    command: "get_staging_user_stories",
    description: "получить US, находящиеся в Staging",
  },
];

const SUBSCRIPTION_TYPES = {
  deploymentCompleted: 0,
  pullRequestCommentAddedOrEdited: 1,
  userStoryTransitionedFromStagingToClosed: 2,
  workItemCreated: 3,
};

exports.BOT_COMMANDS = BOT_COMMANDS;
exports.SUBSCRIPTION_TYPES = SUBSCRIPTION_TYPES;
