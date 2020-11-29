import React, { Component } from "react";
import axios from "axios";
type AppProps = {};

type AppState = {
  seenIndexes: { number: number }[];
  values: { [key: string]: number };
  index: string;
};

class Fib extends Component<AppProps, AppState> {

  constructor(props: AppProps) {
    super(props);
    this.state = {
      seenIndexes: [],
      values: {},
      index: "",
    };
  }

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await axios.post("/api/values", {
      index: this.state.index,
    });

    this.setState({ index: "" });
  };

  render() {
    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="">Enter your index:</label>
          <input
            type="text"
            value={this.state.index}
            onChange={(e) => {
              this.setState({ index: e.target.value });
            }}
          />
          <button type="submit">
            Submit
          </button>
        </form>
        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}
        <h3>Calculated values</h3>
        {this.renderValues()}
      </>
    );
  }

  private async fetchValues() {
    const values = await axios.get("/api/values/current");
    this.setState({ values: values.data });
  }

  private async fetchIndexes() {
    const seenIndexes = await axios.get("/api/values/all");
    this.setState({ seenIndexes: seenIndexes.data });
  }

  private renderSeenIndexes() {
    return this.state.seenIndexes.map(({ number }) => number).join(", ");
  }

  private renderValues() {
    const entries: JSX.Element[] = [];

    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }
    return entries;
  }
}

export default Fib;
