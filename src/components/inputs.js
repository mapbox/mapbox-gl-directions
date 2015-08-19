'use strict';

import React, { Component, PropTypes } from 'react';

export default class Inputs extends Component {

  constructor() {
    super();
  }

  query() {
    // console.log(e);
  }

  clearQuery(e) {
    var ref = e.target.getAttribute('data-ref');
    var target = this.refs[ref].getDOMNode();
    target.value = '';
    target.focus();
  }

  render() {

    console.log(this.props);

    return (
      <div className='mapbox-directions-component mapbox-directions-inputs'>

        <div className='mapbox-directions-origin'>
          <label className='mapbox-form-label'>
            <span className='directions-icon directions-icon-depart'></span>
          </label>
          <input
            type='text'
            placeholder='Start'
            ref='origin'
            onChange={this.query}
          />
          <button
            onClick={this.clearQuery.bind(this)}
            data-ref='origin'
            className='directions-icon directions-icon-close directions-close'
            title='Clear value'></button>
        </div>

        <span className='directions-icon directions-icon-reverse directions-reverse' title='Reverse origin &amp; destination'></span>

        <div className='mapbox-directions-destination'>
          <label className='mapbox-form-label'>
            <span className='directions-icon directions-icon-arrive'></span>
          </label>
          <input
            type='text'
            placeholder='End'
            ref='destination'
            onChange={this.query.bind(this)}
          />
          <button
            onClick={this.clearQuery}
            data-ref='destination'
            className='directions-icon directions-icon-close directions-close'
            title='Clear value'></button>
        </div>

        {this.props.results && <div className='mapbox-directions-profile'>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-driving'
            />
            <label htmlFor='mapbox-directions-profile-driving'>Driving</label>
          </span>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-walking'
            />
            <label htmlFor='mapbox-directions-profile-walking'>Walking</label>
          </span>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-cycling'
            />
            <label htmlFor='mapbox-directions-profile-cycling'>Cycling</label>
          </span>
        </div>}
      </div>
    );
  }
}

Inputs.propTypes = {
  actions: PropTypes.object.isRequired,
  inputs: PropTypes.object.isRequired
};
