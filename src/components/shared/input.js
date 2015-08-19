'use strict';

import React, { Component, PropTypes } from 'react';

export default class Input extends Component {

  constructor(props) {
    super(props);
    this.state = {
      text: this.props.text || ''
    };
  }

  onChange(e) {
    var text = e.target.value;
    this.setState({ text: text });
    this.props.onChange(text.trim());
  }

  clearQuery() {
    this.setState({ text: '' });
    var target = this.refs.input.getDOMNode();
    target.focus();
  }

  render() {
    var options = this.props.options;
    return (
      <div className={`mapbox-directions-${options.mode}`}>
        <label className='mapbox-form-label'>
          <span className={`directions-icon directions-icon-${options.icon}`}></span>
        </label>
        <input
          type='text'
          placeholder={options.placeholder}
          ref='input'
          value={this.state.text}
          onChange={this.onChange.bind(this)}
        />
        <button
          onClick={this.clearQuery.bind(this)}
          className='directions-icon directions-icon-close directions-close'
          title='Clear value'></button>
      </div>
    );
  }
}

Input.propTypes = {
  text: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.object.isRequired
};
