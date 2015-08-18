'use strict';

import React from 'react';

module.exports = React.createClass({

  propTypes: {
    options: React.PropTypes.object
  },

  render() {
    return (
      <form className='mapbox-directions-inputs'>

        <div className='mapbox-directions-origin'>
          <label className='mapbox-form-label'>
            <span className='mapbox-directions-icon mapbox-depart-icon'></span>
          </label>
          <input
            type='text'
            required='required'
            placeholder='Start'
          />
          <div className='mapbox-directions-icon mapbox-close-icon' title='Clear value'></div>
        </div>

        <span className='mapbox-directions-icon mapbox-reverse-icon mapbox-directions-reverse-input' title='Reverse origin &amp; destination'></span>

        <div className='mapbox-directions-destination'>
          <label className='mapbox-form-label'>
            <span className='mapbox-directions-icon mapbox-arrive-icon'></span>
          </label>
          <input
            type='text'
            required='required'
            placeholder='End'
          />
          <div className='mapbox-directions-icon mapbox-close-icon' title='Clear value'></div>
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

});
