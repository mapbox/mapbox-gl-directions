'use strict';

import React, { Component, PropTypes } from 'react';

export default class Instructions extends Component {

  render() {
    return (
      <div className='mapbox-directions-component'>
        Instructions
      </div>
    );
  }
}

Instructions.propTypes = {
  options: PropTypes.object
};
