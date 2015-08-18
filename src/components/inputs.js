'use strict';

import React, { Component, PropTypes } from 'react';

export default class Inputs extends Component {

  render() {
    return (
      <form className='mapbox-directions-component mapbox-directions-inputs'>

        <div className='mapbox-directions-origin'>
          <label className='mapbox-form-label'>
            <span className='directions-icon directions-icon-depart'></span>
          </label>
          <input
            type='text'
            placeholder='Start'
          />
          <div
            className='directions-icon directions-icon-close directions-close'
            title='Clear value'></div>
        </div>

        <span className='directions-icon directions-icon-reverse directions-reverse' title='Reverse origin &amp; destination'></span>

        <div className='mapbox-directions-destination'>
          <label className='mapbox-form-label'>
            <span className='directions-icon directions-icon-arrive'></span>
          </label>
          <input
            type='text'
            placeholder='End'
          />
          <div
            className='directions-icon directions-icon-close directions-close'
            title='Clear value'></div>
        </div>

        <div className='mapbox-directions-profile'>
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
        </div>
      </form>
    );
  }
}

Inputs.propTypes = {
  options: PropTypes.object
};
