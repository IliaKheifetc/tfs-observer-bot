// const TFS_API_BASE_URL = "https://tfs.astralnalog.ru/tfs/DefaultCollection/";
const TEAM_ITERATIONS_ENDPOINT = "/_apis/work/teamsettings/iterations";
const WORK_ITEMS_BATCH_ENDPOINT = "/_apis/wit/workitemsbatch";
const WIQL_ENDPOINT = "/_apis/wit/wiql";

//const PROJECT_ID = "e3337b08-f8bd-424a-9626-53e0af05ffa9";
const API_VERSION = "6.0";
const API_VERSION_PREVIEW = "6.0-preview.1";
// будет получена текущая итерация данной команды. id итерации одинаковый для команд Нептун, Уран, Редактор
const TEAM_NAMES = ["Нептун", "Уран", "Редактор"];
const ASTRAL_WEB_REPORT_TEAM_NAME = "AstralWebReport Team";
const BATCH_WORK_ITEMS_IDS_COUNT_LIMIT = 200;

// скопирован из url tfs
const RESOLVED_USER_STORIES_QUERY_ID = "d878d507-d74d-4703-b7ee-d573b413b2a0";

module.exports = {
  API_VERSION,
  API_VERSION_PREVIEW,
  ASTRAL_WEB_REPORT_TEAM_NAME,
  BATCH_WORK_ITEMS_IDS_COUNT_LIMIT,
  RESOLVED_USER_STORIES_QUERY_ID,
  TEAM_NAMES,
  TEAM_ITERATIONS_ENDPOINT,
  WORK_ITEMS_BATCH_ENDPOINT,
  WIQL_ENDPOINT,
};
