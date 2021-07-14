import React from "react";
import { connect } from "react-redux";
import { Icon, Table } from "semantic-ui-react";
import { modifyResult } from "../../actions/ResultActions";
import ResultsHistoryView from "./ResultsHistoryView";

class ResultsTableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      phys_priority:
        this.props.result.phys_priority !== null
          ? this.props.result.phys_priority
          : "e",
      phys_contrast:
        this.props.result.phys_contrast !== null
          ? this.props.result.phys_contrast
          : "e",
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      phys_priority:
        nextProps.result.phys_priority !== null
          ? nextProps.result.phys_priority
          : "e",
      phys_contrast:
        nextProps.result.phys_contrast !== null
          ? nextProps.result.phys_contrast
          : "e",
    });
  }

  handleSelectChange(e, { name, value }) {
    this.setState({ [name]: value }, () => {
      this.props.modifyResult({
        id: this.props.result.id,
        phys_priority:
          this.state.phys_priority === "e" ? null : this.state.phys_priority,
        phys_contrast:
          this.state.phys_contrast === "e" ? null : this.state.phys_contrast,
      });
    });
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const activeIndex = this.state.activeIndex;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  renderItemCaret(expanded) {
    if (expanded) {
      return <Icon name="caret down" />;
    } else {
      return <Icon name="caret right" />;
    }
  }

  render() {
    const index = this.props.index;
    const result = this.props.result;

    let state = result.state;
    if (result.error && result.error !== "") {
      //  error state
      state = `"${result.error}"`;
    }
    switch (state) {
      case "received_duplicate":
        state = "duplicate";
        break;
      case "ai_priority_processed":
        state = "ai_processed";
        break;
      case "final_priority_received":
        state = "phys_received";
        break;
      case "labelled_priority":
        state = "labelled";
        break;
      default:
        break;
    }
    return (
      <>
        <Table.Row
          onClick={() => this.props.handleRowClick(index)}
          key={"row-data-" + index}
          disabled={this.props.loading}
          error={(result.error && result.error !== "") || state === "deleted"}
          warning={state === "received" || state === "received_duplicate"}
          positive={
            // state === "ai_priority_processed" ||
            // state === "final_priority_received" ||
            state === "labelled"
          }
        >
          <Table.Cell singleLine>
            {/* {this.renderItemCaret(this.props.expanded)} */}
            {result.id}
          </Table.Cell>
          <Table.Cell>{state}</Table.Cell>
          <Table.Cell>{result.age ? result.age : "N/A"}</Table.Cell>
          <Table.Cell>{result.height ? result.height : "N/A"}</Table.Cell>
          <Table.Cell>{result.weight ? result.weight : "N/A"}</Table.Cell>
          <Table.Cell>
            {result.request_json
              ? result.request_json["Reason for Exam"]
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {result.request_json
              ? result.request_json["Exam Requested"]
              : "N/A"}
          </Table.Cell>
          <Table.Cell>
            {result.ai_rule_id ? result.ai_rule_id : " - "}
          </Table.Cell>
          <Table.Cell>
            {result.ai_priority ? result.ai_priority : " - "}
          </Table.Cell>
          <Table.Cell>
            {result.ai_contrast !== null
              ? result.ai_contrast.toString()
              : " - "}
          </Table.Cell>
          {/* <Table.Cell>
            {result.p5_flag !== null ? result.p5_flag.toString() : "none"}
          </Table.Cell> */}
          <Table.Cell>
            {result.ai_tags ? result.ai_tags.join(", ") : "none"}
          </Table.Cell>
          <Table.Cell>
            {result.final_priority ? result.final_priority : " - "}
          </Table.Cell>
          <Table.Cell>
            {result.final_contrast !== null
              ? result.final_contrast.toString()
              : " - "}
          </Table.Cell>
          <Table.Cell>
            {result.labelled_rule_id ? result.labelled_rule_id : " - "}
          </Table.Cell>
          <Table.Cell>
            {result.labelled_priority ? result.labelled_priority : " - "}
          </Table.Cell>
          <Table.Cell>
            {result.labelled_contrast !== null
              ? result.labelled_contrast.toString()
              : " - "}
          </Table.Cell>
          {/* <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              name="phys_priority"
              value={this.state.phys_priority}
              options={[
                { key: "e", text: "none", value: "e" },
                { key: "P1", text: "P1", value: "P1" },
                { key: "P2", text: "P2", value: "P2" },
                { key: "P3", text: "P3", value: "P3" },
                { key: "P4", text: "P4", value: "P4" },
                { key: "P5", text: "P5", value: "P5" },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell>
          <Table.Cell>
            <Form.Dropdown
              fluid
              selection
              name="phys_contrast"
              value={this.state.phys_contrast}
              options={[
                { key: "e", text: "none", value: "e" },
                { key: true, text: "true", value: true },
                { key: false, text: "false", value: false },
              ]}
              onChange={this.handleSelectChange}
            />
          </Table.Cell> */}
          <Table.Cell>{result.date_created}</Table.Cell>
          <Table.Cell>{result.date_updated}</Table.Cell>
          <Table.Cell textAlign="right" collapsing>
            <ResultsHistoryView history={result.history} />
          </Table.Cell>
        </Table.Row>
      </>
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

export default connect(mapStateToProps, { modifyResult })(ResultsTableRow);
