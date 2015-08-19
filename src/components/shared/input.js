'use strict';

import React, { Component, PropTypes } from 'react';

export default class Input extends Component {

  constructor() {
    super();
  }

  query() {
    // console.log(e);
  }

  clearQuery() {
    var target = this.refs.input.getDOMNode();
    target.value = '';
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
          onChange={this.query}
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
  options: PropTypes.object.isRequired
};
