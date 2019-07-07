// source: https://github.com/sdras/night-owl-vscode-theme/blob/master/demo/statelessfunctionalreact.js
import React, { useState } from 'react';

const ListItem = (props) => <li className="ListItem">{props.item.name}</li>;

const List = ({ items }) => (
  <ul className="List">{items.map(item => <ListItem item={item} />)}</ul>
);

const Body = props => {
  let items = transformItems(props.rawItems);
  return (
    <div>
      <h1>{props.header}</h1>
      <List items={items} />
    </div>
  );
};

const UnusedFoo = () => <div>
  <div></div>
</div>;

// This is equivalent to the last example
function Page(props, context) {
  const [active, setActive] = useState(false);
  return (
    <div>
      <Body active={active} header="My List" rawItems={props.rawItems} />
      <button onClick={() => void setActive(!active)} />
    </div>
  );
}
// propTypes and contextTypes are supported
Page.propTypes = {
  rawItems: React.PropTypes.array.isRequired,
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      total: null,
      next: null,
      operation: null
    };
  }

  handleClick = buttonName => {
    this.setState(calculate(this.state, buttonName));
  }

  render() {
    return (
      <div className="component-app">
        Tacos
        <Display value={this.state.next || this.state.total || '0'} />
        <ButtonPanel clickHandler={this.handleClick} />
      </div>
    );
  }
}

export default App;
