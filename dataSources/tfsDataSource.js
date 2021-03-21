const express = require("express");
const qs = require("qs");

const DataSource = require("./DataSource");

const {
  API_VERSION,
  API_VERSION_PREVIEW,
  ASTRAL_WEB_REPORT_TEAM_NAME,
  BATCH_WORK_ITEMS_IDS_COUNT_LIMIT,
  RESOLVED_USER_STORIES_QUERY_ID,
  TEAM_NAMES,
  TEAM_ITERATIONS_ENDPOINT,
  WORK_ITEMS_BATCH_ENDPOINT,
  WIQL_ENDPOINT,
} = require("../constants/tfs");
const { PROJECT_ID, TFS_PAT_TOKEN, TFS_API_BASE_URL } = process.env;

const getTeamIterationWorkItemsUrl = (iterationId) =>
  `_apis/work/teamsettings/iterations/${iterationId}/workitems`;

const HEADERS = {
  Authorization: `Basic ${Buffer.from(":" + TFS_PAT_TOKEN).toString("base64")}`,
  "Content-type": "application/json",
};

class TfsDataSource extends DataSource {
  constructor({ baseUrl, headers }) {
    super({ baseUrl, headers });
  }

  //https://tfs.astralnalog.ru/tfs/DefaultCollection/e3337b08-f8bd-424a-9626-53e0af05ffa9/Нептун/_apis/work/teamsettings/iterations?$timeframe=Current&api-version=6.0&
  getTeamCurrentIteration = async () => {
    const queryString = qs.stringify(
      {
        $timeframe: "Current",
        "api-version": API_VERSION,
      },
      { encodeValuesOnly: true }
    );

    //console.log({ queryString });

    try {
      const teamCurrentIterationUrl = `${PROJECT_ID}/${encodeURIComponent(
        TEAM_NAMES[0]
      )}${TEAM_ITERATIONS_ENDPOINT}?${queryString}`;

      const { value } = await this.get(teamCurrentIterationUrl);

      const currentIterationId = value?.[0]?.id || "";
      //console.log({ currentIterationId });

      return currentIterationId;
    } catch (e) {
      console.log("error occurred when fetching team current iteration : ", e);
    }
  };

  // https://tfs.astralnalog.ru/tfs/DefaultCollection/e3337b08-f8bd-424a-9626-53e0af05ffa9/Нептун/_apis/work/teamsettings/iterations/d4ced292-e33e-42b7-aab6-4e33b94145e7/workitems?api-version=6.0-preview.1

  getTeamIterationWorkItems = async (teamName, iterationId) => {
    const queryString = qs.stringify(
      {
        "api-version": API_VERSION_PREVIEW,
      },
      { encodeValuesOnly: true }
    );

    try {
      const teamIterationWorkItemsUrl = `${PROJECT_ID}/${encodeURIComponent(
        teamName
      )}/${getTeamIterationWorkItemsUrl(iterationId)}?${queryString}`;

      const data = await this.get(teamIterationWorkItemsUrl);

      // console.log({ data });
      const workItemsIds = data.workItemRelations.reduce((ids, relation) => {
        // if it is an object describing us->task or us->bug relationship
        if (relation.target !== null) {
          ids.add(relation.target.id);
        }

        return ids;
      }, new Set());

      // console.log({ workItemsIds });
      return workItemsIds;
    } catch (e) {
      console.log(
        "error occurred when fetching team iteration work items: ",
        e
      );
    }
  };

  // https://tfs.astralnalog.ru/tfs/DefaultCollection/e3337b08-f8bd-424a-9626-53e0af05ffa9/AstralWebReport Team/_apis/wit/wiql/d878d507-d74d-4703-b7ee-d573b413b2a0?api-version=6.0

  getResolvedUserStories = async () => {
    const queryString = qs.stringify({
      "api-version": API_VERSION,
    });

    const url = `${PROJECT_ID}/${ASTRAL_WEB_REPORT_TEAM_NAME}${WIQL_ENDPOINT}/${RESOLVED_USER_STORIES_QUERY_ID}?${queryString}`;
    try {
      const response = await this.get(url);

      // console.log("workItems", response?.workItems);
      return response?.workItems || [];
    } catch (e) {
      console.log("error occurred when fetching resolved user stories : ", e);
    }
  };

  // https://tfs.astralnalog.ru/tfs/DefaultCollection/e3337b08-f8bd-424a-9626-53e0af05ffa9/_apis/wit/workitemsbatch?api-version=6.0

  getUserStoriesBatchesByIds = async (ids) => {
    const queryString = qs.stringify(
      {
        "api-version": API_VERSION,
      },
      { encodeValuesOnly: true }
    );

    // Get Work Items Batch method limit - 200 ids max
    let idsBatches = [];
    const batchesCount = Math.ceil(
      ids.length / BATCH_WORK_ITEMS_IDS_COUNT_LIMIT
    );
    for (let i = 0; i < batchesCount; i++) {
      const batch = ids.slice(
        i * BATCH_WORK_ITEMS_IDS_COUNT_LIMIT,
        (i + 1) * BATCH_WORK_ITEMS_IDS_COUNT_LIMIT
      );

      idsBatches.push(batch);
    }

    try {
      const workItemsBatchUrl = `${PROJECT_ID}${WORK_ITEMS_BATCH_ENDPOINT}?${queryString}`;

      return Promise.all(
        idsBatches.map((idsBatch) =>
          this.post(workItemsBatchUrl, { ids: idsBatch })
        )
      );
    } catch (e) {
      console.log("error occurred when fetching work items batch : ", e);
    }
  };

  getStagingUserStories = async () => {
    try {
      const resolvedUserStories = await this.getResolvedUserStories();
      const ids = resolvedUserStories.map((userStory) => userStory.id);

      const workItemsResponses = await this.getUserStoriesBatchesByIds(ids);
      const userStories = workItemsResponses.reduce(
        (workItems, batchResponse) => {
          workItems.push(...batchResponse.value);

          return workItems;
        },
        []
      );

      const stagingColumnUserStories = userStories.filter(
        (userStory) =>
          userStory.fields[
            "WEF_30CDE1B38F71477D8653BE28B7F9571D_Kanban.Column"
          ] === "Staging"
      );

      console.log(
        "stagingColumnUserStories.length",
        stagingColumnUserStories.length
      );

      return stagingColumnUserStories;
    } catch (e) {
      console.log("error occurred when fetching teams' US ids", e);
      return null;
    }
  };
}

module.exports = new TfsDataSource({
  baseUrl: TFS_API_BASE_URL,
  headers: HEADERS,
});
