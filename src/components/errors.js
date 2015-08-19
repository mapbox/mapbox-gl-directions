import React, { Component, PropTypes } from 'react';

export default class Errors extends Component {

  render() {
    return (
      <div className='mapbox-directions-component'>
        Errors controller
      </div>
    );
  }
}

Errors.propTypes = {
  options: PropTypes.object
};
