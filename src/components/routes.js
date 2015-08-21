import React, { Component, PropTypes } from 'react';

export default class Routes extends Component {

  render() {

    console.log('From route', this.props);

    return (
      <div className='mapbox-directions-component'>
        Routes
      </div>
    );
  }
}

Routes.propTypes = {
  options: PropTypes.object
};
