const tfsDataSource = require("../dataSources/tfsDataSource");
const { TFS_API_BASE_URL } = process.env;

const userStoryFieldsDescriptions = [
  { path: "System.Title", title: "Title" },
  { path: "System.AreaPath", title: "Area" },
  { path: "System.IterationPath", title: "Iteration" },
];

const getUserStoryDescription = (userStory) => {
  const link = `${TFS_API_BASE_URL}/AstralWebReport/_workitems/edit/${userStory.id}`;
  let description = userStoryFieldsDescriptions.reduce(
    (text, { path, title }, index) => {
      return text + `<b>${title}</b>: ${userStory.fields[path]}\n`;
    },
    ""
  );
  description = `<b>ID</b>: ${userStory.id}\n${description}`;
  description += `<a href="${link}">${link}</a>`;
  return description;
};

const getStagingUserStoriesHandler = ({ bot }) => {
  const handler = async (ctx) => {
    // https://github.com/telegraf/telegraf/issues/420
    ctx.webhookReply = false;
    console.log("get_staging_user_stories command");
    const message = await ctx.reply("Генерируем ответ...");

    const {
      message_id: messageId,
      chat: { id: chatId },
    } = message;

    try {
      const userStories = await tfsDataSource.getStagingUserStories();

      console.log({ userStories });

      if (!userStories) {
        throw new Error(
          `Something bad was received: typeof userStories: ${typeof userStories}`
        );
      }

      const replyText = userStories.length
        ? userStories.reduce((text, userStory) => {
            const userStoryDescription = getUserStoryDescription(userStory);

            const dividerLine = "-".repeat(40);

            return `${text}${userStoryDescription}\n${dividerLine}\n\n`;
          }, "")
        : "Staging свободен";

      await bot.telegram.editMessageText(
        chatId.toString(),
        messageId,
        null,
        replyText,
        {
          parse_mode: "HTML",
        }
      );
    } catch (e) {
      console.log("error occurred when fetching staging user stories: ", e);
      await ctx.reply("Произошла ошибка");
    }
  };

  bot.command("get_staging_user_stories", handler);
  bot.hears(/^\/get_staging_user_stories.+/, handler);
};

module.exports = getStagingUserStoriesHandler;
