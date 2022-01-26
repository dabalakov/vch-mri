import React from "react";
import { connect } from "react-redux";
import { Table, Popup } from "semantic-ui-react";
import { modifyResult } from "../../../actions/ResultActions";

class RuleCandidatesRow extends React.Component {
  render() {
    const candidate = this.props.candidate;
    const index = this.props.index;

    return (
          <Table.Row
            key={"row-data-" + index}
            disabled={this.props.loading}
            positive={candidate.rules_id && index === 0}
          >
            <Table.Cell>
              {candidate.rules_id ? candidate.rules_id : "N/A"}
            </Table.Cell>
            <Table.Cell>{candidate.body_part}</Table.Cell>
            <Table.Cell>{candidate.priority}</Table.Cell>
            <Table.Cell>
              {candidate.contrast !== null
                ? candidate.contrast.toString()
                : "none"}
            </Table.Cell>
            <Table.Cell>
              {candidate.specialty_tags ? candidate.specialty_tags : " - "}
            </Table.Cell>
            <Table.Cell>{candidate.info}</Table.Cell>
            <Table.Cell>
              {candidate.match_percent
                ? `${candidate.match_percent.toFixed(2)}%`
                : "N/A"}
            </Table.Cell>
            <Table.Cell>{candidate.bp_tk}</Table.Cell>
            <Table.Cell>{candidate.info_weighted_tk}</Table.Cell>
          </Table.Row>
        
    );
  }
}

const mapStateToProps = (state) => {
  return {
    results: state.results.resultsList,
    loading: state.results.loading,
    error: state.results.error,
    success: state.results.success,
    sortedColumn: state.results.column,
    sortDirection: state.results.direction,
  };
};

export default connect(mapStateToProps, { modifyResult })(RuleCandidatesRow);
