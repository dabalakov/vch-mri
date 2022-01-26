import {
  GET_RESULT_BY_ID_FAILURE,
  GET_RESULT_BY_ID_STARTED,
  GET_RESULT_BY_ID_SUCCESS,
  GET_RESULTS_BY_PAGE_FAILURE,
  GET_RESULTS_BY_PAGE_STARTED,
  GET_RESULTS_BY_PAGE_SUCCESS,
  GET_LABELLED_RESULTS_BY_PAGE_FAILURE,
  GET_LABELLED_RESULTS_BY_PAGE_STARTED,
  GET_LABELLED_RESULTS_BY_PAGE_SUCCESS,
  GET_RESULT_DATA_FAILURE,
  GET_RESULT_DATA_STARTED,
  GET_RESULT_DATA_SUCCESS,
  GET_STATISTICS_STARTED,
  GET_STATISTICS_SUCCESS,
  GET_STATISTICS_FAILURE,
  GET_STATS_STARTED,
  GET_STATS_SUCCESS,
  GET_STATS_FAILURE,
  MODIFY_RESULT_FAILURE,
  MODIFY_RESULT_STARTED,
  MODIFY_RESULT_SUCCESS,
  REMOVE_FAILURE,
  REMOVE_SUCCESS,
  REMOVE_STARTED,
  AI_RERUN_STATUS_STARTED,
  AI_RERUN_STATUS_FAILURE,
  AI_RERUN_STATUS_SUCCESS,
  AI_RERUN_STARTED,
  AI_RERUN_SUCCESS,
  AI_RERUN_ALL_SUCCESS,
  AI_RERUN_FAILURE,
  CHANGE_RESULT_SORT,
} from "../constants/resultConstants";
import axios from "axios";
// TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
// import SampleData from "../data/SampleDataResults2Pages";
// import SampleDataStatistics from "../data/SampleDataStatistics";

export const getResultByIDStarted = () => {
  return {
    type: GET_RESULT_BY_ID_STARTED,
  };
};

export const getResultByIDSuccess = (response) => {
  return {
    type: GET_RESULT_BY_ID_SUCCESS,
    response,
  };
};

export const getResultByIDFailure = (error) => {
  return {
    type: GET_RESULT_BY_ID_FAILURE,
    error,
  };
};

export const getResultsByPageStarted = () => {
  return {
    type: GET_RESULTS_BY_PAGE_STARTED,
  };
};

export const getResultsByPageSuccess = (response) => {
  return {
    type: GET_RESULTS_BY_PAGE_SUCCESS,
    response,
  };
};

export const getResultsByPageFailure = (error) => {
  return {
    type: GET_RESULTS_BY_PAGE_FAILURE,
    error,
  };
};

export const getLabelledResultsByPageStarted = () => {
	return {
	  type: GET_LABELLED_RESULTS_BY_PAGE_STARTED,
	};
  };

export const getLabelledResultsByPageSuccess = (response) => {
	return {
	  type: GET_LABELLED_RESULTS_BY_PAGE_SUCCESS,
	  response,
	};
  };
  
  export const getLabelledResultsByPageFailure = (error) => {
	return {
	  type: GET_LABELLED_RESULTS_BY_PAGE_FAILURE,
	  error,
	};
  };

export const getResultDataStarted = () => {
  return {
    type: GET_RESULT_DATA_STARTED,
  };
};

export const getResultDataSuccess = (response) => {
  return {
    type: GET_RESULT_DATA_SUCCESS,
    response,
  };
};

export const getResultDataFailure = (error) => {
  return {
    type: GET_RESULT_DATA_FAILURE,
    error,
  };
};

// GET_STATISTICS
export const getStatisticsStarted = () => {
  return {
    type: GET_STATISTICS_STARTED,
  };
};

export const getStatisticsSuccess = (response) => {
  return {
    type: GET_STATISTICS_SUCCESS,
    response,
  };
};

export const getStatisticsFailure = (error) => {
  return {
    type: GET_STATISTICS_FAILURE,
    error,
  };
};

// GET_STATS
export const getStatsStarted = () => {
	return {
	  type: GET_STATS_STARTED,
	};
  };
  
  export const getStatsSuccess = (response) => {
	return {
	  type: GET_STATS_SUCCESS,
	  response,
	};
  };
  
  export const getStatsFailure = (error) => {
	return {
	  type: GET_STATS_FAILURE,
	  error,
	};
  };

// MODIFY_RESULT
export const modifyResultStarted = () => {
  return {
    type: MODIFY_RESULT_STARTED,
  };
};

export const modifyResultSuccess = (response) => {
  return {
    type: MODIFY_RESULT_SUCCESS,
    response,
  };
};

export const modifyResultFailure = (error) => {
  return {
    type: MODIFY_RESULT_FAILURE,
    error,
  };
};

// REMOVE
export const removeStarted = () => {
  return {
    type: REMOVE_STARTED,
  };
};

export const removeSuccess = (response) => {
  return {
    type: REMOVE_SUCCESS,
    response,
  };
};

export const removeFailure = (error) => {
  return {
    type: REMOVE_FAILURE,
    error,
  };
};

// AI_RERUN
export const aiStatusStarted = () => {
  return {
    type: AI_RERUN_STATUS_STARTED,
  };
};

export const aiStatusSuccess = (response) => {
  return {
    type: AI_RERUN_STATUS_SUCCESS,
    response,
  };
};

export const aiStatusFailure = (error) => {
  return {
    type: AI_RERUN_STATUS_FAILURE,
    error,
  };
};

export const aiRerunStarted = () => {
  return {
    type: AI_RERUN_STARTED,
  };
};

export const aiRerunSuccess = (response) => {
  return {
    type: AI_RERUN_SUCCESS,
    response,
  };
};

export const aiRerunAllSuccess = (response) => {
  return {
    type: AI_RERUN_ALL_SUCCESS,
    response,
  };
};

export const aiRerunFailure = (error) => {
  return {
    type: AI_RERUN_FAILURE,
    error,
  };
};

export const changeResultSort = (columnName) => {
  return {
    type: CHANGE_RESULT_SORT,
    column: columnName,
  };
};

export const getResultByID = (id, states = null) => {
  return (dispatch) => {
    dispatch(getResultByIDStarted());

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
        operation: "GET",
        id: id,
        states: states,
      })
      .then((response) => {
        dispatch(getResultByIDSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getResultByIDFailure(e));
      });
  };
};

export const getResultsByPage = (pageIndex, states = null) => {
  return (dispatch) => {
    console.log("getResultsByPage");
    dispatch(getResultsByPageStarted());

    // TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
    // dispatch(getResultsByPageSuccess(SampleData));
    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
        operation: "GET",
        page: pageIndex,
        states: states,
        // states: ["labelled_priority", "deleted"]
      })
      .then((response) => {
        console.log(response.data);
        dispatch(getResultsByPageSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getResultsByPageFailure(e));
      });
  };
};


export const getLabelledResultsByPage = (pageIndex) => {
	return (dispatch) => {
	  console.log("getLabelledResultsByPage");
	  dispatch(getLabelledResultsByPageStarted());
  
	  // TODO for sample data local testing instead of waiting Lambda containers to load ~5secs
	  // dispatch(getLabelledResultsByPageSuccess(SampleData));
	  axios
		.post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
		  operation: "GET_LABELLED",
		  page: pageIndex
		  // states: ["labelled_priority", "deleted"]
		})
		.then((response) => {
		  console.log(response.data);
		  dispatch(getLabelledResultsByPageSuccess(response.data));
		})
		.catch((e) => {
		  dispatch(getLabelledResultsByPageFailure(e));
		});
	};
  };


export const getResultData = () => {
  return async (dispatch) => {
    dispatch(getResultDataStarted());

    let url = `${process.env.REACT_APP_HTTP_API_URL}/results`;
    // try {
    //   const response = await axios.get(url, {
    //     operation: "GET_DATA",
    //   });
    //   dispatch(getResultDataSuccess(response.data));
    // } catch (ex) {
    //   dispatch(getResultDataFailure(ex));
    // }
    axios
      .post(url, {
        operation: "GET_DATA",
      })
      .then((response) => {
        dispatch(getResultDataSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getResultDataFailure(e));
      });
  };
};

export const getStatistics = (startDate, endDate) => {
  return async (dispatch) => {
    dispatch(getStatisticsStarted());

    // dispatch(getStatisticsSuccess(SampleDataStatistics));
    let url = `${process.env.REACT_APP_HTTP_API_URL}/results`;
    axios
      .post(url, {
        operation: "GET_STATISTICS",
        start_date: startDate,
        end_date: endDate,
      })
      .then((response) => {
        dispatch(getStatisticsSuccess(response.data));
      })
      .catch((e) => {
        dispatch(getStatisticsFailure(e));
      });
  };
};
export const getStats = (startDate, endDate) => {
	return async (dispatch) => {
	  dispatch(getStatsStarted());
  
	  // dispatch(getStatsSuccess(SampleDataStatistics));
	  let url = `${process.env.REACT_APP_HTTP_API_URL}/results`;
	  axios
		.post(url, {
		  operation: "GET_STATS",
		  start_date: startDate,
		  end_date: endDate,
		})
		.then((response) => {
		  dispatch(getStatsSuccess(response.data));
		})
		.catch((e) => {
		  dispatch(getStatsFailure(e));
		});
	};
  };

export const modifyResult = (state) => {
  return (dispatch) => {
    dispatch(modifyResultStarted());
    console.log("modifyResult");
    console.log(state);

    axios
      .post(`${process.env.REACT_APP_HTTP_API_URL}/results`, {
        operation: "UPDATE_LABELLING",
        ...state,
      })
      .then((response) => {
        dispatch(modifyResultSuccess(response.data));
      })
      .catch((e) => {
        dispatch(modifyResultFailure(e));
      });
  };
};

export const removeRequest = (
  reqId,
  cognito_user_id = "",
  cognito_user_fullname = ""
) => {
  return async (dispatch) => {
    dispatch(removeStarted());
    console.log("removeRequest");
    console.log(reqId);

    try {
      // Re-run AI for one result
      const response = await axios.post(
        `${process.env.REACT_APP_HTTP_API_URL}/results`,
        {
          operation: "REMOVE",
          id: reqId,
          cognito_user_fullname,
          cognito_user_id,
        }
      );
      console.log("REMOVE response");
      console.log(response.data);
      dispatch(removeSuccess(response.data));
    } catch (ex) {
      dispatch(removeFailure(ex));
    }
    // axios
    //   .post(`${process.env.REACT_APP_HTTP_API_URL}/parser`, {
    //     operation: "RERUN_ONE",
    //     CIO_ID: reqId
    //   })
    //   .then((response) => {
    //     dispatch(modifyResultSuccess(response.data));
    //   })
    //   .catch((e) => {
    //     dispatch(modifyResultFailure(e));
    //   });
  };
};

export const rerunAIAll = (
  pageIndex,
  rerunAISessionID,
  cognito_user_id = "",
  cognito_user_fullname = ""
) => {
  return async (dispatch) => {
    dispatch(aiRerunStarted());
    console.log("rerunAIAll");
    console.log(pageIndex);
    console.log(rerunAISessionID);

    try {
      // Re-run AI for ALL results
      let responseRerun = await axios.post(
        `${process.env.REACT_APP_HTTP_API_URL}/parser`,
        {
          operation: "RERUN_ALL",
          rerun_all_id: rerunAISessionID,
          cognito_user_fullname,
          cognito_user_id,
        }
      );
      console.log("responseRerun");
      console.log(responseRerun);

      // Get latest info for result - history and new AI result
      let response = await axios.post(
        `${process.env.REACT_APP_HTTP_API_URL}/results`,
        {
          operation: "GET",
          page: pageIndex,
        }
      );
      console.log("rerunAIAll 2");
      console.log(response.data);
      dispatch(getResultsByPageSuccess(response.data));
      dispatch(aiRerunAllSuccess(responseRerun.data));
    } catch (ex) {
      dispatch(aiRerunFailure(ex));
    }
  };
};

export const rerunAI = (
  reqId,
  cognito_user_id = "",
  cognito_user_fullname = ""
) => {
  return async (dispatch) => {
    dispatch(aiRerunStarted());
    console.log("rerunAI");
    console.log(reqId);

    try {
      // Re-run AI for one result
      await axios.post(`${process.env.REACT_APP_HTTP_API_URL}/parser`, {
        operation: "RERUN_ONE",
        CIO_ID: reqId,
        cognito_user_fullname,
        cognito_user_id,
      });

      // Get latest info for result - history and new AI result
      const response = await axios.post(
        `${process.env.REACT_APP_HTTP_API_URL}/results`,
        {
          operation: "GET",
          id: reqId,
        }
      );
      console.log("rerunAI 2");
      console.log(response.data);
      dispatch(aiRerunSuccess(response.data));
    } catch (ex) {
      dispatch(aiRerunFailure(ex));
    }
    // axios
    //   .post(`${process.env.REACT_APP_HTTP_API_URL}/parser`, {
    //     operation: "RERUN_ONE",
    //     CIO_ID: reqId
    //   })
    //   .then((response) => {
    //     dispatch(modifyResultSuccess(response.data));
    //   })
    //   .catch((e) => {
    //     dispatch(modifyResultFailure(e));
    //   });
  };
};

export const getRerunAIHistory = () => {
  return async (dispatch) => {
    dispatch(aiStatusStarted());

    // dispatch(getStatisticsSuccess(SampleDataStatistics));
    let url = `${process.env.REACT_APP_HTTP_API_URL}/parser`;
    axios
      .post(url, {
        operation: "GET_RERUN_HISTORY",
      })
      .then((response) => {
        dispatch(aiStatusSuccess(response.data));
      })
      .catch((e) => {
        dispatch(aiStatusFailure(e));
      });
  };
};

export const stopRerunAI = (id) => {
  return async (dispatch) => {
    dispatch(aiStatusStarted());

    // dispatch(getStatisticsSuccess(SampleDataStatistics));
    let url = `${process.env.REACT_APP_HTTP_API_URL}/parser`;
    axios
      .post(url, {
        operation: "STOP_RERUN_AI",
        id: id,
      })
      .then((response) => {
        dispatch(aiStatusSuccess(response.data));
      })
      .catch((e) => {
        dispatch(aiStatusFailure(e));
      });
  };
};
